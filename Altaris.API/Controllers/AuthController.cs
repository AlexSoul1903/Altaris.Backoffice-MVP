using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Altairis.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);
                return Ok(new { message = "Usuario registrado con éxito" });
            }
            catch (Exception ex)
            {
             
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);

                if (response == null)
                    return Unauthorized(new { message = "Credenciales inválidas" });

                return Ok(response);
            }
            catch (Exception ex)
            {
              
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}