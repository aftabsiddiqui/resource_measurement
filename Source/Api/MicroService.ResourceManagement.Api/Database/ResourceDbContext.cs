using Microsoft.EntityFrameworkCore;
using MicroService.ResourceManagement.Api.Models;

namespace MicroService.ResourceManagement.Api.Database
{
    public class ResourceDbContext : DbContext
    {
        public ResourceDbContext(DbContextOptions<ResourceDbContext> options) : base(options) { }
        public DbSet<DelegatedStat> DelegatedStats { get; set; }

        public override int SaveChanges()
        {
            AddTimeStamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            AddTimeStamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void AddTimeStamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.Entity is DelegatedStat delegatedStat)
                {
                    delegatedStat.CreatedDate = DateTime.UtcNow;
                }
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            SetupDbSchema(modelBuilder);
        }

        private void SetupDbSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DelegatedStat>(entity =>
            {
                entity.ToTable("delegatestats");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Rir).HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.Type).HasMaxLength(100);
                entity.Property(e => e.Value).HasMaxLength(100);
                entity.Property(e => e.Size).HasMaxLength(100);
                entity.Property(e => e.Status).HasMaxLength(100);
                entity.Property(e => e.Entity).HasMaxLength(100);
                entity.Property(e => e.CreatedDate).IsRequired();
            });
        }
    }
}