import { createTenant, getApiBaseUrl, getTenants } from "@/lib/api";
import { ErrorNotice } from "@/components/ErrorNotice";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const revalidate = 0;

async function createTenantAction(formData: FormData) {
  "use server";

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  if (!name || !slug) return { error: "Name and slug are required." };

  try {
    await createTenant({ name, slug });
  } catch (err: any) {
    return { error: err?.message || "Failed to create tenant." };
  }

  revalidatePath("/tenants");
  redirect("/tenants");
}

export default async function TenantsPage({ searchParams }: { searchParams: { error?: string } }) {
  const tenants = await getTenants();
  const apiBase = getApiBaseUrl();
  const error = searchParams.error || "";

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-200"
          >
            Home
          </a>
          <p className="text-sm text-slate-500">API: {apiBase}</p>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">Tenants</h1>
        <p className="text-slate-600">
          This list comes directly from the new SaaS API. Add tenants via POST
          <code className="ml-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-800">
            {apiBase}/api/tenants
          </code>
          , then refresh.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create tenant</h2>
        <p className="mb-3 text-sm text-slate-600">Use lowercase, URL-safe slugs (e.g., "demo", "acme").</p>
        <ErrorNotice message={error} />
        <form action={createTenantAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Name
            <input
              type="text"
              name="name"
              required
              className="rounded border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Slug
            <input
              type="text"
              name="slug"
              required
              className="rounded border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Create tenant
            </button>
          </div>
        </form>
      </section>

      {tenants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-slate-600">
          No tenants found. Create one with a POST to <code>/api/tenants</code> or seed the database.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tenants.map((tenant) => (
            <article
              key={tenant.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-slate-900">{tenant.name}</h2>
              <p className="text-sm text-slate-600">Slug: {tenant.slug}</p>
              <p className="text-sm text-slate-500">Created {new Date(tenant.createdAt).toLocaleString()}</p>
              <div className="mt-4 flex gap-3">
                <a
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  href={`/bikes?tenant=${tenant.slug}`}
                >
                  View bikes
                </a>
                <a
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  href={`/bookings?tenant=${tenant.slug}`}
                >
                  View bookings
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
