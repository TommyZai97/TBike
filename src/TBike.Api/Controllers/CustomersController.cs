using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TBike.Domain.Entities;
using TBike.Infrastructure;

namespace TBike.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId:guid}/customers")]
public class CustomersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CustomersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers(Guid tenantId, CancellationToken cancellationToken)
    {
        var customers = await _db.Customers.AsNoTracking()
            .Where(c => c.TenantId == tenantId)
            .OrderBy(c => c.Name)
            .Take(200)
            .ToListAsync(cancellationToken);

        return Ok(customers);
    }

    [HttpPost]
    public async Task<ActionResult<Customer>> CreateCustomer(Guid tenantId, [FromBody] CreateCustomerRequest request, CancellationToken cancellationToken)
    {
        var customer = new Customer
        {
            TenantId = tenantId,
            Name = request.Name.Trim(),
            Email = request.Email,
            Phone = request.Phone
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetCustomers), new { tenantId, id = customer.Id }, customer);
    }

    public record CreateCustomerRequest(string Name, string? Email, string? Phone);
}
