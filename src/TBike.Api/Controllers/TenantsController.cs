using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TBike.Domain.Entities;
using TBike.Infrastructure;

namespace TBike.Api.Controllers;

[ApiController]
[Route("api/tenants")]
public class TenantsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TenantsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tenant>>> GetTenants(CancellationToken cancellationToken)
    {
        var tenants = await _db.Tenants.AsNoTracking().OrderBy(t => t.Name).ToListAsync(cancellationToken);
        return Ok(tenants);
    }

    [HttpPost]
    public async Task<ActionResult<Tenant>> CreateTenant([FromBody] CreateTenantRequest request, CancellationToken cancellationToken)
    {
        var tenant = new Tenant
        {
            Name = request.Name.Trim(),
            Slug = request.Slug.Trim().ToLowerInvariant()
        };

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetTenants), new { id = tenant.Id }, tenant);
    }

    public record CreateTenantRequest(string Name, string Slug);
}
