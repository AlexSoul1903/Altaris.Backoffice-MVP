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
            var hotels = await _hotelService.GetAllAsync();
            return Ok(hotels);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] // Solo los usuarios con Rol 'Admin' pueden crear hoteles
        public async Task<IActionResult> Create([FromBody] CreateHotelRequest request)
        {
            var hotel = await _hotelService.CreateAsync(request);
            return Ok(hotel);
        }
    }
}