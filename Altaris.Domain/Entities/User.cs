using System.Data;

namespace Altairis.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; 
        public bool IsActive { get; set; } = true;

        // Relación con el Rol
        public int RoleId { get; set; }
        public Role? Role { get; set; }
        // Relación: Un usuario puede hacer muchas reservas
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
