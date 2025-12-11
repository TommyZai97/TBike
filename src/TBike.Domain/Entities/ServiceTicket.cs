using TBike.Domain.Enums;

namespace TBike.Domain.Entities;

public class ServiceTicket : TenantEntity
{
    public Guid BikeId { get; set; }
    public ServiceStatus Status { get; set; } = ServiceStatus.Open;
    public DateTimeOffset? ServiceStart { get; set; }
    public DateTimeOffset? ServiceEnd { get; set; }
    public string? Remark { get; set; }
    public string? CreatedBy { get; set; }
    public string? LastUpdatedBy { get; set; }
}
