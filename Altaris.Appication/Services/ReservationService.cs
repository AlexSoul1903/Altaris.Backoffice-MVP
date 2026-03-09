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

        // --- 1. LÓGICA DE CANCELACIÓN DIRECTA (REEMBOLSO DE INVENTARIO) ---
        public async Task<bool> CancelAsync(int id)
        {
            var res = await _resRepo.GetByIdAsync(id);
            if (res == null || res.Status == "Cancelada") return false;

            var inventories = await _invRepo.GetAllAsync();
            var relatedDays = inventories.Where(i => i.RoomTypeId == res.RoomTypeId
                                                && i.Date >= res.CheckIn.Date
                                                && i.Date < res.CheckOut.Date).ToList();

            // Devolvemos el inventario sumando +1 a cada día de la reserva cancelada
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

        // --- 2. LÓGICA DE DISPONIBILIDAD  ---
        public async Task<bool> IsAvailableAsync(int roomTypeId, DateTime start, DateTime end)
        {
            var roomType = await _roomTypeRepo.GetByIdAsync(roomTypeId);
            if (roomType == null) return false;

            var inventories = await _invRepo.GetAllAsync();

            var dailyStock = inventories
                .Where(i => i.RoomTypeId == roomTypeId && i.Date >= start.Date && i.Date < end.Date)
                .ToList();

            // Falla solo si existe una fila y su disponibilidad llegó a 0
            bool hasSoldOutDays = dailyStock.Any(i => i.AvailableRooms <= 0);

            return !hasSoldOutDays;
        }

        // --- 3. CREACIÓN DE RESERVA CON INVENTARIO DINÁMICO ---
        public async Task<Reservation> CreateAsync(CreateReservationRequest request, int loggedInUserId)
        {
            var roomType = await _roomTypeRepo.GetByIdAsync(request.RoomTypeId);
            if (roomType == null) throw new Exception("La habitación seleccionada no existe.");

            var hotel = await _hotelRepo.GetByIdAsync(roomType.HotelId);
            if (hotel == null || !hotel.IsActive)
                throw new Exception("No se pueden crear reservas para un hotel inactivo.");

            var checkInUtc = DateTime.SpecifyKind(request.CheckIn.Date, DateTimeKind.Utc);
            var checkOutUtc = DateTime.SpecifyKind(request.CheckOut.Date, DateTimeKind.Utc);

            if (checkOutUtc.Date <= checkInUtc.Date)
                throw new Exception("La estancia debe ser de al menos una noche.");

            var available = await IsAvailableAsync(request.RoomTypeId, checkInUtc, checkOutUtc);
            if (!available)
                throw new Exception("No hay disponibilidad para las fechas seleccionadas.");

            var inventories = await _invRepo.GetAllAsync();

            for (var date = checkInUtc.Date; date < checkOutUtc.Date; date = date.AddDays(1))
            {
                var dayEntry = inventories.FirstOrDefault(i => i.RoomTypeId == request.RoomTypeId && i.Date.Date == date);

                if (dayEntry != null)
                {
                    dayEntry.AvailableRooms -= 1;
                    _invRepo.Update(dayEntry);
                }
                else
                {
                    var newDay = new Inventory
                    {
                        RoomTypeId = request.RoomTypeId,
                        Date = date,
                        AvailableRooms = roomType.TotalRooms - 1
                    };
                    await _invRepo.AddAsync(newDay);
                }
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

        // --- 4. ACTUALIZACIÓN AVANZADA (REEMBOLSO Y NUEVO CONSUMO) ---
        public async Task<Reservation> UpdateAsync(int id, UpdateReservationRequest request)
        {
            var res = await _resRepo.GetByIdAsync(id);
            if (res == null) throw new Exception("Reserva no encontrada.");

            var newCheckIn = DateTime.SpecifyKind(request.CheckIn.Date, DateTimeKind.Utc);
            var newCheckOut = DateTime.SpecifyKind(request.CheckOut.Date, DateTimeKind.Utc);

            if (newCheckOut <= newCheckIn)
                throw new Exception("La estancia debe ser de al menos una noche.");

            var roomType = await _roomTypeRepo.GetByIdAsync(request.RoomTypeId);
            if (roomType == null) throw new Exception("La habitación destino no existe.");

            // Identificamos el estado anterior y el nuevo para saber si debemos liberar o consumir
            string oldStatus = res.Status?.ToLower().Trim() ?? "";
            string requestStatusRaw = request.Status == "Confirmed" ? "Confirmada" : request.Status;
            string newStatus = requestStatusRaw.ToLower().Trim();

            bool wasActive = oldStatus == "confirmada" || oldStatus == "pendiente";
            bool willBeActive = newStatus == "confirmada" || newStatus == "pendiente";

            var inventories = (await _invRepo.GetAllAsync()).ToList();

            // PASO A: REEMBOLSAR INVENTARIO VIEJO
            if (wasActive)
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

            // PASO B: CONSUMIR INVENTARIO NUEVO
            if (willBeActive)
            {
                for (var date = newCheckIn; date < newCheckOut; date = date.AddDays(1))
                {
                    var dayEntry = inventories.FirstOrDefault(i => i.RoomTypeId == request.RoomTypeId && i.Date.Date == date);

                    if (dayEntry != null)
                    {
                        if (dayEntry.AvailableRooms <= 0)
                        {
                            throw new Exception($"No hay disponibilidad para el día {date.ToShortDateString()}.");
                        }

                        dayEntry.AvailableRooms -= 1;
                        _invRepo.Update(dayEntry);
                    }
                    else
                    {
                        var newDay = new Inventory
                        {
                            RoomTypeId = request.RoomTypeId,
                            Date = date,
                            AvailableRooms = roomType.TotalRooms - 1
                        };
                        await _invRepo.AddAsync(newDay);
                        inventories.Add(newDay); // Lo agregamos a la lista en memoria para el bucle
                    }
                }
            }

            // PASO C: ACTUALIZAR DATOS DE LA RESERVA
            res.GuestName = request.GuestName;
            res.RoomTypeId = request.RoomTypeId;
            res.CheckIn = newCheckIn;
            res.CheckOut = newCheckOut;
            res.Status = requestStatusRaw;

            _resRepo.Update(res);

            // Guardamos todos los reembolsos, nuevos consumos y datos en una sola transacción
            await _resRepo.SaveChangesAsync();

            return res;
        }
    }
}