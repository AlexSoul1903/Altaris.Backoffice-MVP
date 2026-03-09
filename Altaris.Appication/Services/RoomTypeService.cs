using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

namespace Altairis.Application.Services
{
    public class RoomTypeService : IRoomTypeService
    {
        private readonly IGenericRepository<RoomType> _roomTypeRepo;
        private readonly IGenericRepository<Hotel> _hotelRepo;

        public RoomTypeService(
            IGenericRepository<RoomType> roomTypeRepo,
            IGenericRepository<Hotel> hotelRepo)
        {
            _roomTypeRepo = roomTypeRepo;
            _hotelRepo = hotelRepo;
        }

        public async Task<IEnumerable<RoomType>> GetAllAsync()
        {
            //  Devolvemos TODAS las habitaciones. 
            // El administrador necesita el diccionario completo para que 
            // las tablas de Inventario y Reservas puedan traducir el ID a Nombre.
            return await _roomTypeRepo.GetAllAsync();
        }

        public async Task<RoomType?> GetByIdAsync(int id)
        {
            return await _roomTypeRepo.GetByIdAsync(id);
        }

        public async Task<RoomType> CreateAsync(CreateRoomTypeRequest request)
        {
            // Aunque la habitación se vea, el backend 
            // NO permite asignarla a un hotel inactivo.
            var hotel = await _hotelRepo.GetByIdAsync(request.HotelId);
            if (hotel == null || !hotel.IsActive)
                throw new Exception("No se puede crear una habitación para un hotel inactivo o inexistente.");

            var roomType = new RoomType
            {
                HotelId = request.HotelId,
                Name = request.Name,
                Capacity = request.Capacity,
                TotalRooms = request.TotalRooms 

            };

            await _roomTypeRepo.AddAsync(roomType);
            await _roomTypeRepo.SaveChangesAsync();

            return roomType;
        }

        public async Task<RoomType> UpdateAsync(int id, UpdateRoomTypeRequest request)
        {
            var roomType = await _roomTypeRepo.GetByIdAsync(id);
            if (roomType == null) throw new Exception("Tipo de habitación no encontrado.");


            var hotel = await _hotelRepo.GetByIdAsync(request.HotelId);
            if (hotel == null || !hotel.IsActive)
                throw new Exception("No se puede asignar la habitación a un hotel inactivo o inexistente.");

            roomType.HotelId = request.HotelId;
            roomType.Name = request.Name;
            roomType.Capacity = request.Capacity;
            roomType.TotalRooms = request.TotalRooms;
            _roomTypeRepo.Update(roomType);
            await _roomTypeRepo.SaveChangesAsync();

            return roomType;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var roomType = await _roomTypeRepo.GetByIdAsync(id);
            if (roomType == null) return false;

            _roomTypeRepo.Delete(roomType);
            await _roomTypeRepo.SaveChangesAsync();
            return true;
        }
    }
}