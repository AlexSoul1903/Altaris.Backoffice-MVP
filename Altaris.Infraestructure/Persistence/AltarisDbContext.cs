using Altairis.Domain.Common;
using Altairis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http; 
using System.Security.Claims;   

namespace Altairis.Infrastructure.Persistence
{
    public class AltairisDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

    
        public AltairisDbContext(
            DbContextOptions<AltairisDbContext> options,
            IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            // 1. Extraemos el Email (o el ID) del token JWT. 
            // Si nadie está logueado (ej. registrando un usuario nuevo), usará "Sistema" por defecto.
            var currentUser = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Email)?.Value ?? "Sistema";

            // 2. Aplicamos la auditoría
            foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        entry.Entity.CreatedBy = currentUser;
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        entry.Entity.UpdatedBy = currentUser;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "Administrador con acceso total" },
                new Role { Id = 2, Name = "Agent", Description = "Agente operativo de viajes" }
            );
        }
    }
}