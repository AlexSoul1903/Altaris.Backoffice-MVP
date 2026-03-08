using Altairis.Application.DTOs;
using Altairis.Application.Interfaces;
using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;

namespace Altairis.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<User> _userRepo;

        public UserService(IGenericRepository<User> userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<object?> GetProfileByIdAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return null;

            return new
            {
                user.FirstName,
                user.LastName,
                user.Email,
                user.RoleId
            };
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _userRepo.GetByIdAsync(id); 
            if (user == null) return false;

            _userRepo.Delete(user);
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserAdminAsync(int id, UpdateUserAdminRequest request)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return false;

            // El admin puede modificar todos estos campos
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.RoleId = request.RoleId;
            user.IsActive = request.IsActive;

            _userRepo.Update(user);
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return false;

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;

            _userRepo.Update(user);
            await _userRepo.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<object>> GetAllUsersAsync()
        {
            var users = await _userRepo.GetAllAsync();
            return users.Select(u => new {
                u.Id,
                u.FirstName,
                u.LastName,
                u.Email,
                u.RoleId,
                u.IsActive
            });
        }
    }
}