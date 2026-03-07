using Altairis.Domain.Common;
using Altairis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Persistence
{
    public class AltairisDbContext : DbContext
    {
        public AltairisDbContext(DbContextOptions<AltairisDbContext> options) : base(options)
        {
        }

        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        // Añadimos los DbSets para Usuarios y Roles
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }

        // MÉTODOS DE AUDITORÍA AUTOMÁTICA
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                         entry.Entity.CreatedBy = "Sistema"; // Más adelante se conectara con el JWT del usuario logueado
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones básicas
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique(); // El email no se puede repetir

            modelBuilder.Entity<Role>().HasData(
        new Role { Id = 1, Name = "Admin", Description = "Administrador con acceso total" },
        new Role { Id = 2, Name = "Agent", Description = "Agente operativo de viajes" }
    );

        }
    }
}