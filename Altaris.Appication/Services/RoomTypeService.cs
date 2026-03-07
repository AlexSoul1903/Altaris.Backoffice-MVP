using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

namespace Altairis.Application.Services
{
    public class RoomTypeService : IRoomTypeService
    {
        private readonly IGenericRepository<RoomType> _repository;

        public RoomTypeService(IGenericRepository<RoomType> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RoomType>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<RoomType?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

        public async Task<RoomType> CreateAsync(CreateRoomTypeRequest request)
        {
            var roomType = new RoomType
            {
                Name = request.Name,
                Capacity = request.Capacity,
                HotelId = request.HotelId
            };

            await _repository.AddAsync(roomType);
            await _repository.SaveChangesAsync();
            return roomType;
        }

        public async Task<RoomType> UpdateAsync(int id, UpdateRoomTypeRequest request)
        {
            var roomType = await _repository.GetByIdAsync(id);
            if (roomType == null) throw new Exception("Tipo de habitación no encontrado.");

            roomType.Name = request.Name;
            roomType.Capacity = request.Capacity;

            _repository.Update(roomType);


            await _repository.SaveChangesAsync();
            return roomType;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var roomType = await _repository.GetByIdAsync(id);
            if (roomType == null) return false;

       
            _repository.Delete(roomType);

            await _repository.SaveChangesAsync();
            return true;
        }
    }
}