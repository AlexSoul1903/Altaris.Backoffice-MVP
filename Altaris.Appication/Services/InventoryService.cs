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
        private readonly IGenericRepository<Reservation> _reservationRepository;

        public InventoryService(
            IGenericRepository<Inventory> inventoryRepository,
            IGenericRepository<RoomType> roomTypeRepository,
            IGenericRepository<Reservation> reservationRepository) 
        {
            _inventoryRepository = inventoryRepository;
            _roomTypeRepository = roomTypeRepository;
            _reservationRepository = reservationRepository;
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

            var requestDateUtc = DateTime.SpecifyKind(request.Date.Date, DateTimeKind.Utc);

            var allInventories = await _inventoryRepository.GetAllAsync();
            var existingInventory = allInventories
                .FirstOrDefault(i => i.RoomTypeId == request.RoomTypeId && i.Date.Date == requestDateUtc.Date);

            if (existingInventory != null)
            {
                existingInventory.AvailableRooms = request.AvailableRooms;
                existingInventory.Date = DateTime.SpecifyKind(existingInventory.Date, DateTimeKind.Utc);

                _inventoryRepository.Update(existingInventory);
                await _inventoryRepository.SaveChangesAsync();
                return existingInventory;
            }
            else
            {
                var newInventory = new Inventory
                {
                    RoomTypeId = request.RoomTypeId,
                    Date = requestDateUtc,
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

            DateTime targetDate = inventory.Date.Date;

            // Revisamos si hay reservas activas en esta fecha
            var allReservations = await _reservationRepository.GetAllAsync();

            bool hasActiveReservations = allReservations.Any(r =>
            {
                // Extraemos las fechas puras de la reserva
                DateTime resCheckIn = r.CheckIn.Date;
                DateTime resCheckOut = r.CheckOut.Date;

                // Normalizamos el estado para evitar errores por mayúsculas
                string status = r.Status?.ToLower().Trim() ?? "";

                // La lógica invencible
                return r.RoomTypeId == inventory.RoomTypeId &&
                       resCheckIn <= targetDate &&
                       resCheckOut > targetDate &&
                       (status == "confirmada" || status == "pendiente" || status == "confirmed");
            });

            if (hasActiveReservations)
            {
                throw new Exception("No se puede eliminar la disponibilidad de este día porque existen reservas activas cruzando esta fecha. Debes cancelar las reservas primero.");
            }

            _inventoryRepository.Delete(inventory);
            await _inventoryRepository.SaveChangesAsync();
            return true;
        }
    }
}