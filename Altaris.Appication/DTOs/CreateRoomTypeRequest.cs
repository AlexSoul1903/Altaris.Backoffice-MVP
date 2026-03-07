using System.ComponentModel.DataAnnotations;

namespace Altairis.Application.DTOs
{
    public class CreateRoomTypeRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Range(1, 10)]
        public int Capacity { get; set; }
        [Required]
        public int HotelId { get; set; }
    }
}