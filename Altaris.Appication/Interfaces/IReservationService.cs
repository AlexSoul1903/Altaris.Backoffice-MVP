using Altairis.Application.DTOs;
using Altairis.Domain.Entities;

namespace Altairis.Application.Interfaces
{
    public interface IReservationService
    {
        Task<bool> IsAvailableAsync(int roomTypeId, DateTime start, DateTime end);
        Task<Reservation> CreateBookingAsync(CreateReservationRequest request);
    }
}