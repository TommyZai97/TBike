using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TBike.Domain.Entities;
using TBike.Domain.Enums;
using TBike.Infrastructure;

namespace TBike.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId:guid}/services")]
public class ServiceTicketsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ServiceTicketsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceTicket>>> GetTickets(Guid tenantId, [FromQuery] ServiceStatus? status, CancellationToken cancellationToken)
    {
        var query = _db.ServiceTickets.AsNoTracking().Where(s => s.TenantId == tenantId);
        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status);
        }

        var tickets = await query.OrderByDescending(s => s.CreatedAt).Take(200).ToListAsync(cancellationToken);
        return Ok(tickets);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceTicket>> CreateTicket(Guid tenantId, [FromBody] CreateServiceTicketRequest request, CancellationToken cancellationToken)
    {
        var ticket = new ServiceTicket
        {
            TenantId = tenantId,
            BikeId = request.BikeId,
            Remark = request.Remark,
            Status = ServiceStatus.Open,
            ServiceStart = request.ServiceStart,
            ServiceEnd = request.ServiceEnd,
            CreatedBy = request.CreatedBy,
            LastUpdatedBy = request.CreatedBy
        };

        _db.ServiceTickets.Add(ticket);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetTickets), new { tenantId }, ticket);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid tenantId, Guid id, [FromBody] UpdateServiceTicketRequest request, CancellationToken cancellationToken)
    {
        var ticket = await _db.ServiceTickets.FirstOrDefaultAsync(s => s.TenantId == tenantId && s.Id == id, cancellationToken);
        if (ticket is null) return NotFound();

        ticket.Status = request.Status;
        ticket.ServiceStart = request.ServiceStart ?? ticket.ServiceStart;
        ticket.ServiceEnd = request.ServiceEnd ?? ticket.ServiceEnd;
        ticket.Remark = request.Remark ?? ticket.Remark;
        ticket.LastUpdatedBy = request.LastUpdatedBy ?? ticket.LastUpdatedBy;
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    public record CreateServiceTicketRequest(Guid BikeId, string? Remark, DateTimeOffset? ServiceStart, DateTimeOffset? ServiceEnd, string? CreatedBy);

    public record UpdateServiceTicketRequest(ServiceStatus Status, DateTimeOffset? ServiceStart, DateTimeOffset? ServiceEnd, string? Remark, string? LastUpdatedBy);
}
