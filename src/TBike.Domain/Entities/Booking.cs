using TBike.Domain.Enums;

namespace TBike.Domain.Entities;

public class Booking : TenantEntity
{
    public Guid BikeId { get; set; }
    public Guid CustomerId { get; set; }
    public DateTimeOffset BookingDate { get; set; }
    public DateTimeOffset? StartTime { get; set; }
    public DateTimeOffset? EndTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Reserved;
    public decimal? TotalPrice { get; set; }
    public string? Remark { get; set; }
}
