using Altairis.Domain.Entities;

namespace Altairis.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task AddAsync(User user);
        Task<User?> GetByEmailAsync(string email);
        Task SaveChangesAsync();
    }
}