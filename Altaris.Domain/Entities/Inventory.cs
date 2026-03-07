namespace Altairis.Domain.Entities
{
    public class Inventory
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public int AvailableRooms { get; set; } // Habitaciones disponibles para esta fecha

        // Relación con el tipo de habitación
        public int RoomTypeId { get; set; }
        public RoomType? RoomType { get; set; }
    }
}