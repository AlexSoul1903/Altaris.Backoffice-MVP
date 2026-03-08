using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelService _hotelService;

        public HotelsController(IHotelService hotelService)
        {
            _hotelService = hotelService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var hotels = await _hotelService.GetAllAsync();
                return Ok(hotels);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateHotelRequest request)
        {
            try
            {
                var hotel = await _hotelService.CreateAsync(request);
                return Ok(hotel);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var hotel = await _hotelService.GetByIdAsync(id);
                return hotel == null
                    ? NotFound(new { message = "Hotel no encontrado." })
                    : Ok(hotel);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHotelRequest request)
        {
            try
            {
                var updatedHotel = await _hotelService.UpdateAsync(id, request);
                return Ok(updatedHotel);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _hotelService.DeleteAsync(id);
                return success
                    ? Ok(new { message = "Hotel eliminado correctamente." })
                    : NotFound(new { message = "Hotel no encontrado." });
            }
            catch (Exception ex)
            {
                // Atrapamos el error de clave foránea si el hotel tiene habitaciones
                if (ex.InnerException != null && ex.InnerException.Message.Contains("violates foreign key constraint"))
                {
                    return BadRequest(new { message = "No se puede eliminar este hotel porque tiene habitaciones, reservas o inventario asociado. Te recomendamos editarlo y cambiar su estado a 'Inactivo'." });
                }

                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { message = errorMessage });
            }
        }
    }
}