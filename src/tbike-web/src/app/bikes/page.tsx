import { createBike, getApiBaseUrl, getBikes, getCustomers, getTenants } from "@/lib/api";
import { Bike, Tenant } from "@/types";
import { ErrorNotice } from "@/components/ErrorNotice";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface BikesPageProps {
  searchParams: { tenant?: string };
}

async function createBikeAction(formData: FormData) {
  "use server";
  const tenantId = (formData.get("tenantId") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const type = (formData.get("type") as string)?.trim();
  const color = (formData.get("color") as string)?.trim();
  const hourlyRate = Number(formData.get("hourlyRate"));
  const conditionNote = (formData.get("conditionNote") as string)?.trim();

  if (!tenantId || !name || !type || !color || Number.isNaN(hourlyRate)) {
    return { error: "All fields are required (hourly rate must be a number)." };
  }

  try {
    await createBike(tenantId, { name, type, color, hourlyRate, conditionNote: conditionNote || undefined });
  } catch (err: any) {
    return { error: err?.message || "Failed to create bike." };
  }

  revalidatePath("/bikes");
  redirect(`/bikes?tenant=${formData.get("tenantSlug")}`);
}

function BikeCard({ bike }: { bike: Bike }) {
  const statuses: Record<number, string> = {
    0: "Available",
    1: "Reserved",
    2: "Rented",
    3: "Maintenance",
    4: "Retired",
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">{bike.name}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100">
          {statuses[bike.status] ?? `Status ${bike.status}`}
        </span>
      </div>
      <p className="text-sm text-slate-200">Type: {bike.type} · Color: {bike.color}</p>
      <p className="text-sm text-slate-200">Rate: ${bike.hourlyRate}/hr</p>
      {bike.conditionNote && <p className="mt-2 text-sm text-slate-300">{bike.conditionNote}</p>}
      <p className="mt-2 text-xs text-slate-400">Updated {new Date(bike.updatedAt).toLocaleString()}</p>
    </article>
  );
}

export default async function BikesPage({ searchParams }: BikesPageProps) {
  const tenants = await getTenants();
  const tenantSlug = searchParams.tenant || tenants[0]?.slug;
  const tenant: Tenant | undefined = tenants.find((t) => t.slug === tenantSlug);
  const tenantId = tenant?.id;
  const apiBase = getApiBaseUrl();

  if (!tenantId) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-100">Bikes</h1>
        <p className="text-slate-300">
          No tenants yet. Create one on <a className="text-indigo-300" href="/tenants">/tenants</a>.
        </p>
      </main>
    );
  }

  const bikes = await getBikes(tenantId);
  const types = Array.from(new Set(bikes.map((b) => b.type))).filter(Boolean);

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
        <h1 className="text-3xl font-semibold text-slate-100">Bikes</h1>
        <p className="text-slate-300">
          Viewing bikes for tenant{" "}
          <code className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100">{tenantSlug}</code>. Switch tenant
          with <code className="rounded bg-slate-800 px-1 text-xs text-slate-100">?tenant=&lt;slug&gt;</code>.
        </p>
      </header>

      <section className="rounded-lg border border-slate-700 bg-slate-900/70 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-100">Add bike</h2>
        <p className="mb-3 text-sm text-slate-300">Select a type from existing bikes; no free text fields.</p>
        <ErrorNotice message={""} />
        <form action={createBikeAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="tenantId" defaultValue={tenantId} />
          <input type="hidden" name="tenantSlug" defaultValue={tenantSlug} />
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Name
            <input
              type="text"
              name="name"
              required
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Type
            <select
              name="type"
              required
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            >
              <option value="">Select type</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Color
            <input
              type="text"
              name="color"
              required
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Hourly rate
            <input
              type="number"
              step="0.01"
              name="hourlyRate"
              required
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-sm text-slate-200">
            Condition note (optional)
            <textarea
              name="conditionNote"
              rows={2}
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Create bike
            </button>
          </div>
        </form>
      </section>

      {bikes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/70 p-6 text-slate-200">
          No bikes found for this tenant. POST to
          <code className="mx-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100">
            /api/tenants/{tenantId}/bikes
          </code>
          to seed data.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bikes.map((bike) => (
            <BikeCard key={bike.id} bike={bike} />
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
