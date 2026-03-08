using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Altairis.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            // Obtenemos el ID del usuario logueado desde los Claims del Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var profile = await _userService.GetProfileByIdAsync(int.Parse(userIdClaim));
            return profile != null ? Ok(profile) : NotFound();
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            var result = await _userService.UpdateProfileAsync(int.Parse(userIdClaim), request);
            return result ? Ok(new { message = "Perfil actualizado con éxito" }) : BadRequest();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Administrador")] 
        public async Task<IActionResult> UpdateUserByAdmin(int id, [FromBody] UpdateUserAdminRequest request)
        {
            var result = await _userService.UpdateUserAdminAsync(id, request);
            return result ? Ok(new { message = "Usuario actualizado correctamente" }) : NotFound(new { message = "Usuario no encontrado" });
        }

        [HttpGet]
        [Authorize(Roles = "Admin, Administrador")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Administrador")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Verificamos que el usuario no intente borrarse a sí mismo (opcional pero recomendado)
                var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserIdClaim != null && int.Parse(currentUserIdClaim) == id)
                {
                    return BadRequest(new { message = "No puedes eliminar tu propia cuenta de administrador." });
                }

                var result = await _userService.DeleteUserAsync(id);
                return result
                    ? Ok(new { message = "Usuario eliminado correctamente." })
                    : NotFound(new { message = "Usuario no encontrado." });
            }
            catch (Exception ex)
            {

                if (ex.InnerException != null && ex.InnerException.Message.Contains("violates foreign key constraint"))
                {
                    return BadRequest(new { message = "No se puede eliminar este usuario porque tiene reservas registradas en el sistema. Te sugerimos cambiar su contraseña o rol para revocar su acceso." });
                }

                return BadRequest(new { message = "Error al intentar eliminar el usuario." });
            }
        }
    }
}