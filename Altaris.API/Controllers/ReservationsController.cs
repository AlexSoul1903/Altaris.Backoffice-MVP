using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Altairis.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

       
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            try { return Ok(await _reservationService.GetAllAsync()); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

      
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Usuario no identificado." });

                int userId = int.Parse(userIdClaim);
                return Ok(await _reservationService.GetByUserIdAsync(userId));
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

      
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var reservation = await _reservationService.GetByIdAsync(id);
                return reservation == null
                    ? NotFound(new { message = "Reserva no encontrada." })
                    : Ok(reservation);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReservationRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized(new { message = "Usuario no identificado." });

                int userId = int.Parse(userIdClaim);
                var result = await _reservationService.CreateAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateReservationRequest request)
        {
            try
            {
                var result = await _reservationService.UpdateAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            try
            {
                var success = await _reservationService.CancelAsync(id);
                return success
                    ? Ok(new { message = "Reserva cancelada y stock restaurado." })
                    : NotFound(new { message = "Reserva no encontrada o ya está cancelada." });
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}