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

        public async Task<Hotel?> GetByIdAsync(int id) => await _hotelRepository.GetByIdAsync(id);

        public async Task<Hotel> UpdateAsync(int id, UpdateHotelRequest request)
        {
            var hotel = await _hotelRepository.GetByIdAsync(id);
            if (hotel == null) throw new Exception("Hotel no encontrado.");

            hotel.Name = request.Name;
            hotel.Address = request.Address;
            hotel.City = request.City;
            hotel.Stars = request.Stars;
            hotel.IsActive = request.IsActive;

            _hotelRepository.Update(hotel); 
            await _hotelRepository.SaveChangesAsync();
            return hotel;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var hotel = await _hotelRepository.GetByIdAsync(id);
            if (hotel == null) return false;

            _hotelRepository.Delete(hotel); 
            await _hotelRepository.SaveChangesAsync();
            return true;
        }


    }
}