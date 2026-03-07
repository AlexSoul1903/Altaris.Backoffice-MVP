using Altairis.Application.DTOs;
using Altairis.Domain.Entities;

namespace Altairis.Application.Interfaces
{
    public interface IHotelService
    {
        Task<IEnumerable<Hotel>> GetAllAsync();
        Task<Hotel> CreateAsync(CreateHotelRequest request);
    }
}