using Altairis.Domain.Interfaces;
using Altairis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly AltairisDbContext _context;

        public GenericRepository(AltairisDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<T>> GetAllAsync() => await _context.Set<T>().ToListAsync();

        public async Task<T?> GetByIdAsync(int id) => await _context.Set<T>().FindAsync(id);

        public async Task AddAsync(T entity) => await _context.Set<T>().AddAsync(entity);

        public void Update(T entity) => _context.Set<T>().Update(entity);

        public void Delete(T entity) => _context.Set<T>().Remove(entity);

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}