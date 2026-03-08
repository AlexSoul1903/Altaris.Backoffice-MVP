namespace Altairis.Application.DTOs
{
    public class DashboardSummaryDto
    {
        public int ActiveReservations { get; set; }
        public int AvailableRooms { get; set; }
        public int PendingCheckIns { get; set; }
        public int MonthlyReservations { get; set; }
        public List<RecentActivityDto> RecentActivity { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string Id { get; set; } = string.Empty;
        public string Guest { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
    }
}