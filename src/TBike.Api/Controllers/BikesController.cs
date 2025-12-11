using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TBike.Domain.Entities;
using TBike.Domain.Enums;
using TBike.Infrastructure;

namespace TBike.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId:guid}/bikes")]
public class BikesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BikesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bike>>> GetBikes(Guid tenantId, CancellationToken cancellationToken)
    {
        var bikes = await _db.Bikes
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId)
            .OrderBy(b => b.Name)
            .Take(200)
            .ToListAsync(cancellationToken);

        return Ok(bikes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Bike>> GetBike(Guid tenantId, Guid id, CancellationToken cancellationToken)
    {
        var bike = await _db.Bikes.AsNoTracking().FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Id == id, cancellationToken);
        if (bike == null) return NotFound();
        return bike;
    }

    [HttpPost]
    public async Task<ActionResult<Bike>> CreateBike(Guid tenantId, [FromBody] CreateBikeRequest request, CancellationToken cancellationToken)
    {
        var bike = new Bike
        {
            TenantId = tenantId,
            Name = request.Name.Trim(),
            Type = request.Type.Trim(),
            Color = request.Color,
            HourlyRate = request.HourlyRate,
            Status = BikeStatus.Available,
            ConditionNote = request.ConditionNote
        };

        _db.Bikes.Add(bike);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetBike), new { tenantId, id = bike.Id }, bike);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBike(Guid tenantId, Guid id, [FromBody] UpdateBikeRequest request, CancellationToken cancellationToken)
    {
        var bike = await _db.Bikes.FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Id == id, cancellationToken);
        if (bike == null) return NotFound();

        bike.Name = request.Name.Trim();
        bike.Type = request.Type.Trim();
        bike.Color = request.Color;
        bike.HourlyRate = request.HourlyRate;
        bike.Status = request.Status;
        bike.ConditionNote = request.ConditionNote;
        bike.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    public record CreateBikeRequest(string Name, string Type, string Color, decimal HourlyRate, string? ConditionNote);

    public record UpdateBikeRequest(string Name, string Type, string Color, decimal HourlyRate, BikeStatus Status, string? ConditionNote);
}
