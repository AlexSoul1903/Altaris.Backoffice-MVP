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

        public ReservationService(IGenericRepository<Reservation> resRepo, IGenericRepository<Inventory> invRepo)
        {
            _resRepo = resRepo;
            _invRepo = invRepo;
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

            // 1. Devolver el stock al inventario
            var inventories = await _invRepo.GetAllAsync();
            var relatedDays = inventories.Where(i => i.RoomTypeId == res.RoomTypeId
                                                && i.Date >= res.CheckIn.Date
                                                && i.Date < res.CheckOut.Date);

            foreach (var day in relatedDays)
            {
                day.AvailableRooms += 1; // Restauramos la habitación
                _invRepo.Update(day);
            }

            // 2. Actualizar estado de la reserva
            res.Status = "Cancelada";
            _resRepo.Update(res);

            await _resRepo.SaveChangesAsync();
            return true;
        }


        public async Task<bool> IsAvailableAsync(int roomTypeId, DateTime start, DateTime end)
        {
            var inventories = await _invRepo.GetAllAsync();
            var dailyStock = inventories.Where(i => i.RoomTypeId == roomTypeId && i.Date >= start.Date && i.Date < end.Date);

            int totalNights = (end.Date - start.Date).Days;
            return dailyStock.Count() == totalNights && dailyStock.All(i => i.AvailableRooms > 0);
        }

        public async Task<Reservation> CreateAsync(CreateReservationRequest request, int loggedInUserId)
        {
            // 🚀 MAGIA: Forzamos a UTC para que PostgreSQL no explote
            var checkInUtc = DateTime.SpecifyKind(request.CheckIn, DateTimeKind.Utc);
            var checkOutUtc = DateTime.SpecifyKind(request.CheckOut, DateTimeKind.Utc);

            if (checkOutUtc.Date <= checkInUtc.Date)
                throw new Exception("La estancia debe ser de al menos una noche.");

            var available = await IsAvailableAsync(request.RoomTypeId, checkInUtc, checkOutUtc);
            if (!available)
                throw new Exception("No hay disponibilidad para las fechas seleccionadas.");

            var inventories = await _invRepo.GetAllAsync();
            var dailyStock = inventories.Where(i => i.RoomTypeId == request.RoomTypeId
                                               && i.Date >= checkInUtc.Date
                                               && i.Date < checkOutUtc.Date);

            foreach (var day in dailyStock)
            {
                day.AvailableRooms -= 1;
                _invRepo.Update(day);
            }

            var reservation = new Reservation
            {
                RoomTypeId = request.RoomTypeId,
                GuestName = request.GuestName,
                CheckIn = checkInUtc,   // Usamos la variable segura
                CheckOut = checkOutUtc, // Usamos la variable segura
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

         
            var checkInUtc = DateTime.SpecifyKind(request.CheckIn, DateTimeKind.Utc);
            var checkOutUtc = DateTime.SpecifyKind(request.CheckOut, DateTimeKind.Utc);

            // 1. Si el usuario actualiza el estado a "Cancelada"
            if ((request.Status == "Cancelada" || request.Status == "Cancelled") && res.Status != "Cancelada" && res.Status != "Cancelled")
            {
                await CancelAsync(id);

                res.GuestName = request.GuestName;
                _resRepo.Update(res);
                await _resRepo.SaveChangesAsync();
                return res;
            }

            // 2. Revisamos si se cambiaron fechas o tipo de habitación
            bool datesOrRoomChanged = res.RoomTypeId != request.RoomTypeId ||
                                      res.CheckIn.Date != checkInUtc.Date ||
                                      res.CheckOut.Date != checkOutUtc.Date;

            // Solo afectamos inventario si hubo cambios
            if (datesOrRoomChanged && res.Status != "Cancelada" && res.Status != "Cancelled")
            {
                if (checkOutUtc.Date <= checkInUtc.Date)
                    throw new Exception("La estancia debe ser de al menos una noche.");

                var inventories = await _invRepo.GetAllAsync();

                // A. Restaurar (Liberar) el stock original
                var oldDays = inventories.Where(i => i.RoomTypeId == res.RoomTypeId
                                                  && i.Date >= res.CheckIn.Date
                                                  && i.Date < res.CheckOut.Date);
                foreach (var day in oldDays)
                {
                    day.AvailableRooms += 1;
                    _invRepo.Update(day);
                }

                // B. Verificar disponibilidad para las NUEVAS fechas
                var newDays = inventories.Where(i => i.RoomTypeId == request.RoomTypeId
                                                  && i.Date >= checkInUtc.Date
                                                  && i.Date < checkOutUtc.Date);

                int totalNights = (checkOutUtc.Date - checkInUtc.Date).Days;
                bool isAvailable = newDays.Count() == totalNights && newDays.All(i => i.AvailableRooms > 0);

                if (!isAvailable)
                {
                    // Rollback
                    foreach (var day in oldDays)
                    {
                        day.AvailableRooms -= 1;
                        _invRepo.Update(day);
                    }
                    throw new Exception("No hay inventario disponible para las nuevas fechas.");
                }

                // C. Consumir el stock de las nuevas fechas
                foreach (var day in newDays)
                {
                    day.AvailableRooms -= 1;
                    _invRepo.Update(day);
                }
            }
            res.GuestName = request.GuestName;
            res.RoomTypeId = request.RoomTypeId;
            res.CheckIn = checkInUtc; 
            res.CheckOut = checkOutUtc; 
            res.Status = request.Status == "Confirmed" ? "Confirmada" : request.Status;

            _resRepo.Update(res);
            await _resRepo.SaveChangesAsync();

            return res;
        }
    }
    }