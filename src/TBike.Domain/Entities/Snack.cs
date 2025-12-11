using TBike.Domain.Enums;

namespace TBike.Domain.Entities;

public class Snack : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public SnackStatus Status { get; set; } = SnackStatus.Active;
}
