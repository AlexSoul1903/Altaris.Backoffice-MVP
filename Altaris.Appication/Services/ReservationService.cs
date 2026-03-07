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
            if (request.CheckOut.Date <= request.CheckIn.Date)
                throw new Exception("La estancia debe ser de al menos una noche.");

            var available = await IsAvailableAsync(request.RoomTypeId, request.CheckIn, request.CheckOut);
            if (!available)
                throw new Exception("No hay disponibilidad para las fechas seleccionadas.");

            var inventories = await _invRepo.GetAllAsync();
            var dailyStock = inventories.Where(i => i.RoomTypeId == request.RoomTypeId
                                               && i.Date >= request.CheckIn.Date
                                               && i.Date < request.CheckOut.Date);

            foreach (var day in dailyStock)
            {
                day.AvailableRooms -= 1;
                _invRepo.Update(day);
            }

            var reservation = new Reservation
            {
                RoomTypeId = request.RoomTypeId,
                GuestName = request.GuestName,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                UserId = loggedInUserId,
                Status = "Confirmada"
            };

            await _resRepo.AddAsync(reservation);
            await _resRepo.SaveChangesAsync();

            return reservation;
        }
    }
}