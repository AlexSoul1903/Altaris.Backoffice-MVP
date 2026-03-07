using Altairis.Domain.Entities;
using Altairis.Domain.Interfaces;
using Altairis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AltairisDbContext _context;

        public UserRepository(AltairisDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(User user) => await _context.Users.AddAsync(user);

        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email);

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}