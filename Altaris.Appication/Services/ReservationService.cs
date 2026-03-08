using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

namespace Altairis.Application.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IGenericRepository<Reservation> _resRepo;
        private readonly IGenericRepository<Inventory> _invRepo;
        private readonly IGenericRepository<RoomType> _roomTypeRepo;
        private readonly IGenericRepository<Hotel> _hotelRepo;

        public ReservationService(
            IGenericRepository<Reservation> resRepo,
            IGenericRepository<Inventory> invRepo,
            IGenericRepository<RoomType> roomTypeRepo,
            IGenericRepository<Hotel> hotelRepo)
        {
            _resRepo = resRepo;
            _invRepo = invRepo;
            _roomTypeRepo = roomTypeRepo;
            _hotelRepo = hotelRepo;
        }

        public async Task<IEnumerable<Reservation>> GetAllAsync() => await _resRepo.GetAllAsync();

        public async Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId)
        {
            var all = await _resRepo.GetAllAsync();
            return all.Where(r => r.UserId == userId);
        }

        public async Task<Reservation?> GetByIdAsync(int id) => await _resRepo.GetByIdAsync(id);

        public async Task<bool> CancelAsync(int id)
        {
            var res = await _resRepo.GetByIdAsync(id);
            if (res == null || res.Status == "Cancelada") return false;

            var inventories = await _invRepo.GetAllAsync();
            var relatedDays = inventories.Where(i => i.RoomTypeId == res.RoomTypeId
                                                && i.Date >= res.CheckIn.Date
                                                && i.Date < res.CheckOut.Date).ToList();

            foreach (var day in relatedDays)
            {
                day.AvailableRooms += 1;
                _invRepo.Update(day);
            }

            res.Status = "Cancelada";
            _resRepo.Update(res);
            await _resRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsAvailableAsync(int roomTypeId, DateTime start, DateTime end)
        {
            var inventories = await _invRepo.GetAllAsync();
            var dailyStock = inventories.Where(i => i.RoomTypeId == roomTypeId && i.Date >= start.Date && i.Date < end.Date).ToList();

            int totalNights = (end.Date - start.Date).Days;
            return dailyStock.Count == totalNights && dailyStock.All(i => i.AvailableRooms > 0);
        }

        public async Task<Reservation> CreateAsync(CreateReservationRequest request, int loggedInUserId)
        {
            var roomType = await _roomTypeRepo.GetByIdAsync(request.RoomTypeId);
            if (roomType == null) throw new Exception("La habitación seleccionada no existe.");

            var hotel = await _hotelRepo.GetByIdAsync(roomType.HotelId);
            if (hotel == null || !hotel.IsActive)
                throw new Exception("No se pueden crear reservas para una habitación de un hotel inactivo.");

            var checkInUtc = DateTime.SpecifyKind(request.CheckIn, DateTimeKind.Utc);
            var checkOutUtc = DateTime.SpecifyKind(request.CheckOut, DateTimeKind.Utc);

            if (checkOutUtc.Date <= checkInUtc.Date)
                throw new Exception("La estancia debe ser de al menos una noche.");

            var available = await IsAvailableAsync(request.RoomTypeId, checkInUtc, checkOutUtc);
            if (!available)
                throw new Exception("No hay disponibilidad o el inventario no ha sido creado para las fechas seleccionadas.");

            var inventories = await _invRepo.GetAllAsync();
            var dailyStock = inventories.Where(i => i.RoomTypeId == request.RoomTypeId
                                               && i.Date >= checkInUtc.Date
                                               && i.Date < checkOutUtc.Date).ToList();

            foreach (var day in dailyStock)
            {
                day.AvailableRooms -= 1;
                _invRepo.Update(day);
            }

            var reservation = new Reservation
            {
                RoomTypeId = request.RoomTypeId,
                GuestName = request.GuestName,
                CheckIn = checkInUtc,
                CheckOut = checkOutUtc,
                UserId = loggedInUserId,
                Status = "Confirmada"
            };

            await _resRepo.AddAsync(reservation);
            await _resRepo.SaveChangesAsync();

            return reservation;
        }

 
        public async Task<Reservation> UpdateAsync(int id, UpdateReservationRequest request)
        {
            var res = await _resRepo.GetByIdAsync(id);
            if (res == null) throw new Exception("Reserva no encontrada.");

            if (res.RoomTypeId != request.RoomTypeId)
            {
                var newRoomType = await _roomTypeRepo.GetByIdAsync(request.RoomTypeId);
                if (newRoomType == null) throw new Exception("La habitación destino no existe.");

                var newHotel = await _hotelRepo.GetByIdAsync(newRoomType.HotelId);
                if (newHotel == null || !newHotel.IsActive)
                    throw new Exception("No se puede mover la reserva a un hotel inactivo.");
            }

            var checkInUtc = DateTime.SpecifyKind(request.CheckIn, DateTimeKind.Utc);
            var checkOutUtc = DateTime.SpecifyKind(request.CheckOut, DateTimeKind.Utc);

            if (checkOutUtc.Date <= checkInUtc.Date)
                throw new Exception("La estancia debe ser de al menos una noche.");

            // 1. Normalizamos los estados para saber de dónde venimos y a dónde vamos
            string oldStatus = res.Status?.ToLower().Trim() ?? "";
            string requestStatusRaw = request.Status == "Confirmed" ? "Confirmada" : request.Status;
            string newStatus = requestStatusRaw?.ToLower().Trim() ?? "";

            bool wasActive = oldStatus == "confirmada" || oldStatus == "pendiente";
            bool willBeActive = newStatus == "confirmada" || newStatus == "pendiente";

            bool datesOrRoomChanged = res.RoomTypeId != request.RoomTypeId ||
                                      res.CheckIn.Date != checkInUtc.Date ||
                                      res.CheckOut.Date != checkOutUtc.Date;

            var inventories = await _invRepo.GetAllAsync();

            // CASO A: Cancelando la reserva (Devolver stock)
            if (wasActive && !willBeActive)
            {
                var oldDays = inventories.Where(i => i.RoomTypeId == res.RoomTypeId
                                                  && i.Date >= res.CheckIn.Date
                                                  && i.Date < res.CheckOut.Date).ToList();
                foreach (var day in oldDays)
                {
                    day.AvailableRooms += 1;
                    _invRepo.Update(day);
                }
            }
            // CASO B: Reactivando una reserva muerta (TU TRAMPA BLOQUEADA AQUÍ 🚀)
            else if (!wasActive && willBeActive)
            {
                var newDays = inventories.Where(i => i.RoomTypeId == request.RoomTypeId
                                                  && i.Date >= checkInUtc.Date
                                                  && i.Date < checkOutUtc.Date).ToList();

                int totalNights = (checkOutUtc.Date - checkInUtc.Date).Days;

                // Si el registro de inventario ya no existe (Count != totalNights) o no hay habitaciones libres, lo rechazamos
                if (newDays.Count != totalNights || !newDays.All(i => i.AvailableRooms > 0))
                {
                    throw new Exception("No puedes reactivar esta reserva porque el inventario de esos días fue eliminado o está agotado.");
                }

                foreach (var day in newDays)
                {
                    day.AvailableRooms -= 1;
                    _invRepo.Update(day);
                }
            }
            // CASO C: La reserva sigue activa, pero cambiaste fechas o habitación
            else if (wasActive && willBeActive && datesOrRoomChanged)
            {
                // Devolver stock viejo
                var oldDays = inventories.Where(i => i.RoomTypeId == res.RoomTypeId
                                                  && i.Date >= res.CheckIn.Date
                                                  && i.Date < res.CheckOut.Date).ToList();
                foreach (var day in oldDays)
                {
                    day.AvailableRooms += 1;
                    _invRepo.Update(day);
                }

                // Verificar stock nuevo
                var newDays = inventories.Where(i => i.RoomTypeId == request.RoomTypeId
                                                  && i.Date >= checkInUtc.Date
                                                  && i.Date < checkOutUtc.Date).ToList();
                int totalNights = (checkOutUtc.Date - checkInUtc.Date).Days;

                if (newDays.Count != totalNights || !newDays.All(i => i.AvailableRooms > 0))
                {
                    // Rollback si falla
                    foreach (var day in oldDays)
                    {
                        day.AvailableRooms -= 1;
                        _invRepo.Update(day);
                    }
                    throw new Exception("No hay inventario creado o suficiente para las nuevas fechas solicitadas.");
                }

                // Consumir stock nuevo
                foreach (var day in newDays)
                {
                    day.AvailableRooms -= 1;
                    _invRepo.Update(day);
                }
            }
            // CASO D: Modificando fechas de una reserva Cancelada (se permite porque no roba inventario)

      
            res.GuestName = request.GuestName;
            res.RoomTypeId = request.RoomTypeId;
            res.CheckIn = checkInUtc;
            res.CheckOut = checkOutUtc;
            res.Status = requestStatusRaw;

            _resRepo.Update(res);
            await _resRepo.SaveChangesAsync();

            return res;
        }
    }
}