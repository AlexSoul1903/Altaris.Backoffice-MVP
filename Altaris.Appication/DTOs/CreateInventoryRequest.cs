using System.ComponentModel.DataAnnotations;

namespace Altairis.Application.DTOs
{
    public class CreateInventoryRequest
    {
        [Required(ErrorMessage = "El ID del tipo de habitación es obligatorio.")]
        public int RoomTypeId { get; set; }

        [Required(ErrorMessage = "La fecha es obligatoria.")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "La cantidad de habitaciones es obligatoria.")]
        [Range(0, 1000, ErrorMessage = "La cantidad no puede ser negativa.")]
        public int AvailableRooms { get; set; }
    }
}