using Altairis.Application.DTOs;

namespace Altairis.Application.Interfaces
{
    public interface IUserService
    {
        Task<object?> GetProfileByIdAsync(int userId);
        Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<IEnumerable<object>> GetAllUsersAsync();
        Task<bool> UpdateUserAdminAsync(int id, UpdateUserAdminRequest request);
        Task<bool> DeleteUserAsync(int id);

    }
}