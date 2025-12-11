using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TBike.Domain.Entities;
using TBike.Domain.Enums;
using TBike.Infrastructure;

namespace TBike.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId:guid}/snacks")]
public class SnacksController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SnacksController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Snack>>> GetSnacks(Guid tenantId, CancellationToken cancellationToken)
    {
        var snacks = await _db.Snacks.AsNoTracking()
            .Where(s => s.TenantId == tenantId)
            .OrderBy(s => s.Name)
            .Take(200)
            .ToListAsync(cancellationToken);

        return Ok(snacks);
    }

    [HttpPost]
    public async Task<ActionResult<Snack>> CreateSnack(Guid tenantId, [FromBody] CreateSnackRequest request, CancellationToken cancellationToken)
    {
        var snack = new Snack
        {
            TenantId = tenantId,
            Name = request.Name.Trim(),
            Type = request.Type.Trim(),
            Price = request.Price,
            Quantity = request.Quantity,
            Status = SnackStatus.Active
        };

        _db.Snacks.Add(snack);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetSnacks), new { tenantId, id = snack.Id }, snack);
    }

    [HttpPost("{snackId:guid}/sales")]
    public async Task<ActionResult<SnackSale>> AddSale(Guid tenantId, Guid snackId, [FromBody] CreateSnackSaleRequest request, CancellationToken cancellationToken)
    {
        var snack = await _db.Snacks.FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Id == snackId, cancellationToken);
        if (snack is null) return NotFound();

        var sale = new SnackSale
        {
            TenantId = tenantId,
            SnackId = snackId,
            BookingId = request.BookingId,
            CustomerId = request.CustomerId,
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice
        };

        snack.Quantity -= request.Quantity;
        snack.UpdatedAt = DateTimeOffset.UtcNow;

        _db.SnackSales.Add(sale);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetSnacks), new { tenantId }, sale);
    }

    public record CreateSnackRequest(string Name, string Type, decimal Price, int Quantity);

    public record CreateSnackSaleRequest(Guid? BookingId, Guid? CustomerId, int Quantity, decimal UnitPrice);
}
