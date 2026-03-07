using Altairis.Domain.Common;

namespace Altairis.Domain.Entities
{
    public class Hotel:AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public int Stars { get; set; }
        public bool IsActive { get; set; } = true;

        // Relación: Un hotel tiene muchos tipos de habitaciones
        public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
    }
}