using Altairis.Application.DTOs;
using Altairis.Domain.Entities;

namespace Altairis.Application.Interfaces
{
    public interface IHotelService
    {
        // Recupera todos los hoteles (usado por Agents y Admin)
        Task<IEnumerable<Hotel>> GetAllAsync();

        // Recupera un hotel específico por su ID
        Task<Hotel?> GetByIdAsync(int id);

        // Crea un nuevo hotel (Solo Admin)
        Task<Hotel> CreateAsync(CreateHotelRequest request);

        // Actualiza los datos de un hotel existente
        Task<Hotel> UpdateAsync(int id, UpdateHotelRequest request);

        // Elimina un hotel del sistema
        Task<bool> DeleteAsync(int id);
    }
}