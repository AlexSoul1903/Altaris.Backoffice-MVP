using Altairis.Application.DTOs;
using Altairis.Domain.Entities;

namespace Altairis.Application.Interfaces
{
    public interface IInventoryService
    {
        Task<IEnumerable<Inventory>> GetAllAsync();

        Task<IEnumerable<Inventory>> GetByRoomTypeAsync(int roomTypeId);
        Task<Inventory> CreateOrUpdateAsync(CreateInventoryRequest request);
        Task<bool> DeleteAsync(int id);
    }
}