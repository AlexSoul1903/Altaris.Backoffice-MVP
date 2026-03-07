using Altairis.Domain.Common;

namespace Altairis.Domain.Entities
{
    public class Reservation:AuditableEntity
    {
        public int Id { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public string Status { get; set; } = "Confirmed"; // Ej: Confirmed, Cancelled

        // Relación
        public int RoomTypeId { get; set; }
        public RoomType? RoomType { get; set; }
    }
}