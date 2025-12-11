import { createBooking, getApiBaseUrl, getBikes, getBookings, getCustomers, getTenants } from "@/lib/api";
import { Booking, Bike, Customer, Tenant } from "@/types";
import { ErrorNotice } from "@/components/ErrorNotice";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface BookingsPageProps {
  searchParams: { tenant?: string };
}

async function createBookingAction(formData: FormData) {
  "use server";
  const tenantId = (formData.get("tenantId") as string)?.trim();
  const tenantSlug = (formData.get("tenantSlug") as string)?.trim();
  const bikeId = (formData.get("bikeId") as string)?.trim();
  const customerId = (formData.get("customerId") as string)?.trim();
  const bookingDate = (formData.get("bookingDate") as string)?.trim();
  const startTime = (formData.get("startTime") as string)?.trim();
  const endTime = (formData.get("endTime") as string)?.trim();
  const totalPriceRaw = formData.get("totalPrice") as string;
  const remark = (formData.get("remark") as string)?.trim();

  if (!tenantId || !bikeId || !customerId || !bookingDate) {
    return { error: "Tenant, bike, customer, and booking date are required." };
  }

  const totalPrice = totalPriceRaw ? Number(totalPriceRaw) : null;
  if (totalPriceRaw && Number.isNaN(totalPrice)) return { error: "Total price must be a number." };

  try {
    await createBooking(tenantId, {
      bikeId,
      customerId,
      bookingDate,
      startTime: startTime || null,
      endTime: endTime || null,
      totalPrice,
      remark: remark || null,
    });
  } catch (err: any) {
    return { error: err?.message || "Failed to create booking." };
  }

  revalidatePath("/bookings");
  redirect(`/bookings?tenant=${tenantSlug}`);
}

function BookingCard({ booking, bikes, customers }: { booking: Booking; bikes: Bike[]; customers: Customer[] }) {
  const statuses: Record<number, string> = {
    0: "Reserved",
    1: "Active",
    2: "Completed",
    3: "Cancelled",
  };
  const bike = bikes.find((b) => b.id === booking.bikeId);
  const customer = customers.find((c) => c.id === booking.customerId);

  return (
    <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Booking {booking.id.slice(0, 8)}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100">
          {statuses[booking.status] ?? `Status ${booking.status}`}
        </span>
      </div>
      <p className="text-sm text-slate-200">Bike: {bike?.name ?? booking.bikeId.slice(0, 8)}</p>
      <p className="text-sm text-slate-200">Customer: {customer?.name ?? booking.customerId.slice(0, 8)}</p>
      <p className="text-sm text-slate-200">Booking date: {new Date(booking.bookingDate).toLocaleString()}</p>
      {booking.startTime && <p className="text-sm text-slate-200">Start: {new Date(booking.startTime).toLocaleString()}</p>}
      {booking.endTime && <p className="text-sm text-slate-200">End: {new Date(booking.endTime).toLocaleString()}</p>}
      {booking.totalPrice != null && <p className="text-sm text-slate-200">Total: ${booking.totalPrice}</p>}
      {booking.remark && <p className="mt-2 text-sm text-slate-300">{booking.remark}</p>}
      <p className="mt-2 text-xs text-slate-400">Updated {new Date(booking.updatedAt).toLocaleString()}</p>
    </article>
  );
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const tenants = await getTenants();
  const tenantSlug = searchParams.tenant || tenants[0]?.slug;
  const tenant: Tenant | undefined = tenants.find((t) => t.slug === tenantSlug);
  const tenantId = tenant?.id;
  const apiBase = getApiBaseUrl();

  if (!tenantId) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-100">Bookings</h1>
        <p className="text-slate-300">
          No tenants yet. Create one on <a className="text-indigo-300" href="/tenants">/tenants</a>.
        </p>
      </main>
    );
  }

  const [bookings, bikes, customers] = await Promise.all([
    getBookings(tenantId),
    getBikes(tenantId),
    getCustomers(tenantId),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            Home
          </a>
          <p className="text-sm text-slate-300">API: {apiBase}</p>
        </div>
        <h1 className="text-3xl font-semibold text-slate-100">Bookings</h1>
        <p className="text-slate-300">
          Viewing bookings for tenant{" "}
          <code className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100">{tenantSlug}</code>. Switch with{" "}
          <code className="rounded bg-slate-800 px-1 text-xs text-slate-100">?tenant=&lt;slug&gt;</code>.
        </p>
      </header>

      <section className="rounded-lg border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Create booking</h2>
        <p className="mb-3 text-sm text-slate-300">Choose bike and customer from this tenant. Times are optional.</p>
        <ErrorNotice message={""} />
        <form action={createBookingAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="tenantId" defaultValue={tenantId} />
          <input type="hidden" name="tenantSlug" defaultValue={tenantSlug} />
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Bike
            <select
              name="bikeId"
              required
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            >
              <option value="">Select bike</option>
              {bikes.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.type})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Customer
            <select
              name="customerId"
              required
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Booking date/time (ISO)
            <input
              type="datetime-local"
              name="bookingDate"
              required
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Start time (optional)
            <input
              type="datetime-local"
              name="startTime"
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            End time (optional)
            <input
              type="datetime-local"
              name="endTime"
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Total price (optional)
            <input
              type="number"
              step="0.01"
              name="totalPrice"
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-sm text-slate-200">
            Remark (optional)
            <textarea
              name="remark"
              rows={2}
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Create booking
            </button>
          </div>
        </form>
      </section>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/70 p-6 text-slate-200">
          No bookings found for this tenant. POST to
          <code className="mx-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100">
            /api/tenants/{tenantId}/bookings
          </code>
          to seed data.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} bikes={bikes} customers={customers} />
          ))}
        </div>
      )}

      <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-200">
        Tip: add <code className="rounded bg-slate-800 px-1 text-xs text-slate-100">tenant</code> (slug) to the URL or
        link from the Tenants page to switch context.
      </div>
    </main>
  );
}
