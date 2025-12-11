using Microsoft.EntityFrameworkCore;
using TBike.Domain.Entities;
using TBike.Domain.Enums;

namespace TBike.Infrastructure;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<UserAccount> Users => Set<UserAccount>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Bike> Bikes => Set<Bike>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<ServiceTicket> ServiceTickets => Set<ServiceTicket>();
    public DbSet<Snack> Snacks => Set<Snack>();
    public DbSet<SnackSale> SnackSales => Set<SnackSale>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasIndex(x => x.Slug).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(200);
            entity.Property(x => x.Slug).HasMaxLength(120);
        });

        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.HasIndex(x => new { x.TenantId, x.Email }).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.DisplayName).HasMaxLength(128);
            entity.Property(x => x.PasswordHash).HasMaxLength(512);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(x => new { x.TenantId, x.Email });
            entity.Property(x => x.Name).HasMaxLength(200);
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.Phone).HasMaxLength(50);
        });

        modelBuilder.Entity<Bike>(entity =>
        {
            entity.HasIndex(x => new { x.TenantId, x.Name });
            entity.Property(x => x.Name).HasMaxLength(200);
            entity.Property(x => x.Type).HasMaxLength(100);
            entity.Property(x => x.Color).HasMaxLength(60);
            entity.Property(x => x.HourlyRate).HasColumnType("decimal(18,2)");
            entity.Property(x => x.ConditionNote).HasMaxLength(2000);
            entity.Property(x => x.Status).HasDefaultValue(BikeStatus.Available);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(x => new { x.TenantId, x.Status });
            entity.HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<Bike>().WithMany().HasForeignKey(x => x.BikeId).OnDelete(DeleteBehavior.Restrict);
            entity.Property(x => x.TotalPrice).HasColumnType("decimal(18,2)");
            entity.Property(x => x.Remark).HasMaxLength(2000);
            entity.Property(x => x.Status).HasDefaultValue(BookingStatus.Reserved);
        });

        modelBuilder.Entity<ServiceTicket>(entity =>
        {
            entity.HasIndex(x => new { x.TenantId, x.Status });
            entity.HasOne<Bike>().WithMany().HasForeignKey(x => x.BikeId).OnDelete(DeleteBehavior.Cascade);
            entity.Property(x => x.Remark).HasMaxLength(2000);
            entity.Property(x => x.Status).HasDefaultValue(ServiceStatus.Open);
        });

        modelBuilder.Entity<Snack>(entity =>
        {
            entity.HasIndex(x => new { x.TenantId, x.Name });
            entity.Property(x => x.Name).HasMaxLength(200);
            entity.Property(x => x.Type).HasMaxLength(100);
            entity.Property(x => x.Price).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<SnackSale>(entity =>
        {
            entity.HasOne<Snack>().WithMany().HasForeignKey(x => x.SnackId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<Booking>().WithMany().HasForeignKey(x => x.BookingId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.SetNull);
            entity.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
        });
    }
}
