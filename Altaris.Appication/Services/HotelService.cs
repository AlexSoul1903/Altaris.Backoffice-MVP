using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

namespace Altairis.Application.Services
{
    public class HotelService : IHotelService
    {
        private readonly IGenericRepository<Hotel> _hotelRepository;

        public HotelService(IGenericRepository<Hotel> hotelRepository)
        {
            _hotelRepository = hotelRepository;
        }

        public async Task<IEnumerable<Hotel>> GetAllAsync()
        {
            return await _hotelRepository.GetAllAsync();
        }

        public async Task<Hotel> CreateAsync(CreateHotelRequest request)
        {
            var hotel = new Hotel
            {
                Name = request.Name,
                Address = request.Address,
                City = request.City,
                Stars = request.Stars,
                IsActive = true
            };

            await _hotelRepository.AddAsync(hotel);
            await _hotelRepository.SaveChangesAsync();

            return hotel;
        }
    }
}