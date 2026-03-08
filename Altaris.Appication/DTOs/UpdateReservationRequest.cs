using System.ComponentModel.DataAnnotations;

namespace Altairis.Application.DTOs
{
    public class UpdateRoomTypeRequest
    {
        public int HotelId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;

        [Range(1, 10)]
        public int Capacity { get; set; }
    }
}