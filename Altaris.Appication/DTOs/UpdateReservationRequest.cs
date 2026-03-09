using System.ComponentModel.DataAnnotations;

namespace Altairis.Application.DTOs
{
    public class UpdateRoomTypeRequest
    {
        public int HotelId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public int TotalRooms { get; set; }

        [Range(1, 10)]
        public int Capacity { get; set; }
    }
}