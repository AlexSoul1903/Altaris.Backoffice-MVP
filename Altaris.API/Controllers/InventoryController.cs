using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class InventoriesController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoriesController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _inventoryService.GetAllAsync()); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpGet("roomtype/{roomTypeId}")]
        public async Task<IActionResult> GetByRoomType(int roomTypeId)
        {
            try { return Ok(await _inventoryService.GetByRoomTypeAsync(roomTypeId)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateOrUpdate([FromBody] CreateInventoryRequest request)
        {
            try { return Ok(await _inventoryService.CreateOrUpdateAsync(request)); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
              
                var success = await _inventoryService.DeleteAsync(id);
                if (!success) return NotFound(new { message = "Inventario no encontrado." });

                return Ok(new { message = "Registro de inventario eliminado correctamente." });
            }
            catch (Exception ex)
            {
              
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}