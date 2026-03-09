using Altairis.Domain.Common;

namespace Altairis.Domain.Entities
{
    public class RoomType:AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public int Capacity { get; set; } // Cuántas personas caben eb una habitación de este tipo
        public int TotalRooms { get; set; } // Cuántas habitaciones de este tipo hay en el hotel

        // Relación con Hotel
        public int HotelId { get; set; }
        public Hotel? Hotel { get; set; }

        // Relaciones: Un RoomType tiene historial de inventario y muchas reservas
        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}