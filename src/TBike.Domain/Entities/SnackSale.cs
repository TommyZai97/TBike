namespace TBike.Domain.Entities;

public class SnackSale : TenantEntity
{
    public Guid SnackId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid? CustomerId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal => UnitPrice * Quantity;
}
