using Altairis.Application.DTOs;
using Altairis.Domain.Entities;

namespace Altairis.Application.Interfaces
{
    public interface IRoomTypeService
    {
        Task<IEnumerable<RoomType>> GetAllAsync();
        Task<RoomType?> GetByIdAsync(int id);
        Task<RoomType> CreateAsync(CreateRoomTypeRequest request);
        Task<RoomType> UpdateAsync(int id, UpdateRoomTypeRequest request);
        Task<bool> DeleteAsync(int id);
    }
}