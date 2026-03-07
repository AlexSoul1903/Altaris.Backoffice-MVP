using Altairis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace Altairis.Infrastructure.Persistence
{
    public class AltairisDbContext : DbContext
    {
        public AltairisDbContext(DbContextOptions<AltairisDbContext> options) : base(options)
        {
        }

        // Tablas de la base de datos
        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Reservation> Reservations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones extra 
            modelBuilder.Entity<Hotel>().Property(h => h.Name).IsRequired().HasMaxLength(200);
            modelBuilder.Entity<Reservation>().Property(r => r.Status).HasDefaultValue("Pending");
        }
    }
}