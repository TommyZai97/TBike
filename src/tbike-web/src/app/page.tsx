const links = [
  { href: "/tenants", title: "Tenants", description: "List tenants from the API and jump into context." },
  { href: "/bikes", title: "Bikes", description: "View bikes for a tenant (?tenantId=<guid>)." },
  { href: "/bookings", title: "Bookings", description: "See bookings per tenant (?tenantId=<guid>)." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Home</span>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            TBike SaaS
          </p>
        </div>
        <h1 className="text-4xl font-bold text-slate-900">Next.js frontend</h1>
        <p className="text-lg text-slate-600">
          Wired for the new ASP.NET Core API. Use the links below to browse tenants, bikes, and bookings. Set
          <code className="ml-1 rounded bg-slate-100 px-2 py-1 text-sm text-slate-800">NEXT_PUBLIC_API_BASE_URL</code>{" "}
          to point at your running API.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-700">
              {link.title} →
            </h2>
            <p className="mt-2 text-sm text-slate-600">{link.description}</p>
          </a>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <h3 className="text-base font-semibold text-slate-900">API quickstart</h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Run the API: <code className="rounded bg-white px-1 text-xs text-slate-800">dotnet run --project ../TBike.Api/TBike.Api.csproj --urls http://localhost:5000</code></li>
          <li>Create a tenant: <code className="rounded bg-white px-1 text-xs text-slate-800">POST http://localhost:5000/api/tenants</code> with <code className="rounded bg-white px-1 text-xs text-slate-800">{"{ \"name\": \"Demo\", \"slug\": \"demo\" }"}</code></li>
          <li>Visit <a className="text-indigo-600 hover:text-indigo-700" href="/tenants">/tenants</a> to browse.</li>
        </ol>
      </section>
    </main>
  );
}
