using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

namespace Altairis.Application.Services
{
    public class DashboardService : IDashboardService
    {
       
        private readonly IGenericRepository<Reservation> _reservationRepo;
        private readonly IGenericRepository<Inventory> _inventoryRepo;
        private readonly IGenericRepository<RoomType> _roomTypeRepo;

        public DashboardService(
            IGenericRepository<Reservation> reservationRepo,
            IGenericRepository<Inventory> inventoryRepo,
            IGenericRepository<RoomType> roomTypeRepo)
        {
            _reservationRepo = reservationRepo;
            _inventoryRepo = inventoryRepo;
            _roomTypeRepo = roomTypeRepo;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync()
        {
            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var allReservations = await _reservationRepo.GetAllAsync();
            var allInventories = await _inventoryRepo.GetAllAsync();
            var allRoomTypes = await _roomTypeRepo.GetAllAsync(); 


            // a. Reservas Activas 
            int activeReservations = allReservations.Count(r =>
                r.Status?.ToLower().Trim() == "confirmada" ||
                r.Status?.ToLower().Trim() == "confirmed");

            // b. Check-ins pendientes hoy 
            int pendingCheckIns = allReservations.Count(r =>
                r.CheckIn.Date == today &&
                (r.Status?.ToLower().Trim() == "confirmada" || r.Status?.ToLower().Trim() == "confirmed"));

            // c. Habitaciones disponibles 
            int availableRooms = allInventories
                .Where(i => i.Date.Date == today)
                .Sum(i => i.AvailableRooms);

            // d. KPI OPERATIVO: Reservas del Mes (Excluyendo canceladas en ambos idiomas)
            int monthlyReservations = allReservations
                .Count(r => r.CreatedAt >= startOfMonth &&
                            r.Status?.ToLower().Trim() != "cancelada" &&
                            r.Status?.ToLower().Trim() != "cancelled");

            // 4. Actividad Reciente (Últimas 5)
            var recentActivities = allReservations
                .OrderByDescending(r => r.Id)
                .Take(5)
                .Select(r => new RecentActivityDto
                {
                    Id = $"RES-{r.Id:D3}",
                    Guest = r.GuestName,
                    Room = allRoomTypes.FirstOrDefault(rt => rt.Id == r.RoomTypeId)?.Name ?? "Sin Asignar",
                    Status = r.Status, 
                    Date = r.CheckIn.ToString("dd/MM/yyyy HH:mm")
                }).ToList();


            return new DashboardSummaryDto
            {
                ActiveReservations = activeReservations,
                AvailableRooms = availableRooms,
                PendingCheckIns = pendingCheckIns,
                MonthlyReservations = monthlyReservations,
                RecentActivity = recentActivities
            };
        }
    }
}