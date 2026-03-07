using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

namespace Altairis.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IGenericRepository<Inventory> _inventoryRepository;
        private readonly IGenericRepository<RoomType> _roomTypeRepository;

        public InventoryService(
            IGenericRepository<Inventory> inventoryRepository,
            IGenericRepository<RoomType> roomTypeRepository)
        {
            _inventoryRepository = inventoryRepository;
            _roomTypeRepository = roomTypeRepository;
        }

        public async Task<IEnumerable<Inventory>> GetAllAsync() => await _inventoryRepository.GetAllAsync();

        public async Task<IEnumerable<Inventory>> GetByRoomTypeAsync(int roomTypeId)
        {
            var allInventories = await _inventoryRepository.GetAllAsync();
            return allInventories
                .Where(i => i.RoomTypeId == roomTypeId && i.Date >= DateTime.UtcNow.Date)
                .OrderBy(i => i.Date);
        }

        public async Task<Inventory> CreateOrUpdateAsync(CreateInventoryRequest request)
        {
            var roomType = await _roomTypeRepository.GetByIdAsync(request.RoomTypeId);
            if (roomType == null)
                throw new Exception("El tipo de habitación no existe en el hotel.");

            var allInventories = await _inventoryRepository.GetAllAsync();
            var existingInventory = allInventories
                .FirstOrDefault(i => i.RoomTypeId == request.RoomTypeId && i.Date.Date == request.Date.Date);

            if (existingInventory != null)
            {
                existingInventory.AvailableRooms = request.AvailableRooms;
                _inventoryRepository.Update(existingInventory);
                await _inventoryRepository.SaveChangesAsync();
                return existingInventory;
            }
            else
            {
                var newInventory = new Inventory
                {
                    RoomTypeId = request.RoomTypeId,
                    Date = request.Date.Date,
                    AvailableRooms = request.AvailableRooms
                };

                await _inventoryRepository.AddAsync(newInventory);
                await _inventoryRepository.SaveChangesAsync();
                return newInventory;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var inventory = await _inventoryRepository.GetByIdAsync(id);
            if (inventory == null) return false;

            _inventoryRepository.Delete(inventory);
            await _inventoryRepository.SaveChangesAsync();
            return true;
        }
    }
}