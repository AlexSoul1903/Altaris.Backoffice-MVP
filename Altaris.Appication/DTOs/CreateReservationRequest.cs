using System.ComponentModel.DataAnnotations;

namespace Altairis.Application.DTOs
{
    public class CreateReservationRequest
    {
        [Required]
        public int RoomTypeId { get; set; }
        [Required]
        public string GuestName { get; set; } = string.Empty;
        [Required]
        public DateTime CheckIn { get; set; }
        [Required]
        public DateTime CheckOut { get; set; }
    }
}