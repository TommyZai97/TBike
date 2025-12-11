using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TBike.Domain.Entities;
using TBike.Domain.Enums;
using TBike.Infrastructure;

namespace TBike.Api.Controllers;

[ApiController]
[Route("api/tenants/{tenantId:guid}/bookings")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BookingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetBookings(Guid tenantId, [FromQuery] BookingStatus? status, CancellationToken cancellationToken)
    {
        var query = _db.Bookings
            .AsNoTracking()
            .Where(b => b.TenantId == tenantId)
            .OrderByDescending(b => b.BookingDate)
            .ThenByDescending(b => b.CreatedAt)
            .Take(200);

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status);
        }

        var bookings = await query.ToListAsync(cancellationToken);
        return Ok(bookings);
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> CreateBooking(Guid tenantId, [FromBody] CreateBookingRequest request, CancellationToken cancellationToken)
    {
        var booking = new Booking
        {
            TenantId = tenantId,
            BikeId = request.BikeId,
            CustomerId = request.CustomerId,
            BookingDate = request.BookingDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            TotalPrice = request.TotalPrice,
            Remark = request.Remark,
            Status = BookingStatus.Reserved
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetBookings), new { tenantId, id = booking.Id }, booking);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid tenantId, Guid id, [FromBody] UpdateBookingStatusRequest request, CancellationToken cancellationToken)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.TenantId == tenantId && b.Id == id, cancellationToken);
        if (booking == null) return NotFound();

        booking.Status = request.Status;
        booking.StartTime = request.StartTime ?? booking.StartTime;
        booking.EndTime = request.EndTime ?? booking.EndTime;
        booking.TotalPrice = request.TotalPrice ?? booking.TotalPrice;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    public record CreateBookingRequest(Guid BikeId, Guid CustomerId, DateTimeOffset BookingDate, DateTimeOffset? StartTime, DateTimeOffset? EndTime, decimal? TotalPrice, string? Remark);

    public record UpdateBookingStatusRequest(BookingStatus Status, DateTimeOffset? StartTime, DateTimeOffset? EndTime, decimal? TotalPrice);
}
