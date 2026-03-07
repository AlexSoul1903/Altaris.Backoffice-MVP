using System.ComponentModel.DataAnnotations;

namespace Altairis.Application.DTOs
{
    public class CreateHotelRequest
    {
        [Required(ErrorMessage = "El nombre del hotel es obligatorio.")]
        [StringLength(150, ErrorMessage = "El nombre no puede exceder los 150 caracteres.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "La dirección es obligatoria.")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "La ciudad es obligatoria.")]
        public string City { get; set; } = string.Empty;

        [Range(1, 5, ErrorMessage = "Las estrellas deben estar entre 1 y 5.")]
        public int Stars { get; set; }
    }
}