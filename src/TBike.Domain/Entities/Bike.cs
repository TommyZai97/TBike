using TBike.Domain.Enums;

namespace TBike.Domain.Entities;

public class Bike : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal HourlyRate { get; set; }
    public BikeStatus Status { get; set; } = BikeStatus.Available;
    public string? ConditionNote { get; set; }
    public Guid? CurrentBookingId { get; set; }
}
