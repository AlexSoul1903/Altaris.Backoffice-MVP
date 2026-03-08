using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeService _roomTypeService;

        public RoomTypesController(IRoomTypeService roomTypeService)
        {
            _roomTypeService = roomTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _roomTypeService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var roomType = await _roomTypeService.GetByIdAsync(id);
            return roomType == null ? NotFound() : Ok(roomType);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateRoomTypeRequest request) => Ok(await _roomTypeService.CreateAsync(request));

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomTypeRequest request)
        {
            try { return Ok(await _roomTypeService.UpdateAsync(id, request)); }
            catch (Exception ex) { return NotFound(ex.Message); }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _roomTypeService.DeleteAsync(id);
                return success
                    ? Ok(new { message = "Tipo de habitación eliminado correctamente." })
                    : NotFound(new { message = "Tipo de habitación no encontrado." });
            }
            catch (Exception ex)
            {
                // Atrapamos el error de llave foránea (relaciones)
                if (ex.InnerException != null && ex.InnerException.Message.Contains("violates foreign key constraint"))
                {
                    return BadRequest(new { message = "No se puede eliminar esta habitación porque ya tiene reservas o inventario asociado. Si ya no se usa, te recomendamos editar su nombre para indicarlo (Ej. 'Inactiva - Suite')." });
                }

                // Para cualquier otro error genérico:
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { message = errorMessage });
            }
        }
    }
}