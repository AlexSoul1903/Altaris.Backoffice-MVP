using Altairis.Domain.Common;
using Altairis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Collections.Generic;

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
            // 1. Extraemos el Email del token JWT para la auditoría automática
            var currentUser = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Email)?.Value ?? "Sistema";

            // 2. Aplicamos la auditoría a las entidades que heredan de AuditableEntity
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

            //1. CONFIGURACIÓN DE VALIDACIONES Y RESTRICCIONES (FLUENT API)

            // Usuarios: Email único en la base de datos
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Hoteles
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.Property(h => h.Name).IsRequired().HasMaxLength(150);
                entity.Property(h => h.Address).IsRequired();
                entity.Property(h => h.City).IsRequired();
                entity.Property(h => h.Country).IsRequired().HasMaxLength(100);
                entity.Property(h => h.Phone).IsRequired().HasMaxLength(20);
                entity.Property(h => h.Stars).IsRequired();
            });

            // Categorías de Habitación (RoomTypes)
            modelBuilder.Entity<RoomType>(entity =>
            {
                entity.Property(rt => rt.Name).IsRequired().HasMaxLength(100);
                entity.Property(rt => rt.Capacity).IsRequired();

                // Relación: Un RoomType pertenece a un Hotel
                entity.HasOne(rt => rt.Hotel)
                      .WithMany(h => h.RoomTypes)
                      .HasForeignKey(rt => rt.HotelId)
                      .OnDelete(DeleteBehavior.Cascade); // Si se borra el hotel, se borran sus categorías
            });

            // Inventario: Control de disponibilidad diaria
            modelBuilder.Entity<Inventory>(entity =>
            {
                entity.Property(i => i.Date).IsRequired();
                entity.Property(i => i.AvailableRooms).IsRequired();

                entity.HasOne(i => i.RoomType)
                      .WithMany(rt => rt.Inventories)
                      .HasForeignKey(i => i.RoomTypeId)
                      .OnDelete(DeleteBehavior.Cascade); // Si se borra la categoría, se borra su inventario
            });

            // Reservas: Protección del historial de ventas
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.Property(r => r.GuestName).IsRequired().HasMaxLength(150);
                entity.Property(r => r.CheckIn).IsRequired();
                entity.Property(r => r.CheckOut).IsRequired();

                entity.HasOne(r => r.RoomType)
                      .WithMany(rt => rt.Reservations)
                      .HasForeignKey(r => r.RoomTypeId)
                      .OnDelete(DeleteBehavior.Restrict); // PROHIBIDO borrar categorías que tengan reservas activas
            });

            //2. DATA SEED (DATOS INICIALES)

            // Roles del sistema
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "Administrador con acceso total" },
                new Role { Id = 2, Name = "Agent", Description = "Agente operativo de viajes" }
            );

            // Hotel inicial
            modelBuilder.Entity<Hotel>().HasData(new Hotel
            {
                Id = 1,
                Name = "Altairis Central Hotel",
                Address = "123 Ocean Drive",
                City = "Miami",
                Country = "USA",
                Phone = "+1-305-555-0199",
                Stars = 5,
                IsActive = true
            });

       

            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                FirstName = "Admin",
                LastName = "Altairis",
                Email = "alex@gmail.com",
                PasswordHash = "$2a$12$1h5d82g3htRIei37FTBbruqFMaxGhIkQjmNQXp3CVlfCz3qDPcXfe",
                RoleId = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Sistema"
            });
            // Categorías iniciales para el Hotel 1
            modelBuilder.Entity<RoomType>().HasData(
                new RoomType { Id = 1, HotelId = 1, Name = "Suite Presidencial", Capacity = 4, TotalRooms=3 },
                new RoomType { Id = 2, HotelId = 1, Name = "Habitación Estándar", Capacity = 2,TotalRooms= 2 }
            );
        }
    }
}