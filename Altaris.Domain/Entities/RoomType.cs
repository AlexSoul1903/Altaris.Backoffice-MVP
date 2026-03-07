using Altairis.Domain.Common;

namespace Altairis.Domain.Entities
{
    public class RoomType:AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public int Capacity { get; set; } // Cuántas personas caben eb una habitación de este tipo

        // Relación con Hotel
        public int HotelId { get; set; }
        public Hotel? Hotel { get; set; }
    }
}