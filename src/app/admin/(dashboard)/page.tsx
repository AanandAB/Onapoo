import { requireAdmin, getAdminStats } from "@/lib/admin";

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getAdminStats();

  const cards = [
    { label: "Products", value: stats.productCount, href: "/admin/products" },
    { label: "Total orders", value: stats.orderCount, href: "/admin" },
    { label: "New orders", value: stats.newOrders, href: "/admin" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Welcome back — here's your shop at a glance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-paper p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-leaf-deep">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-paper p-5 shadow-soft">
        <p className="font-semibold">Quick actions</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/admin/products?edit=new" className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-cream">
            + Add product
          </a>
          <a href="/admin/offers?edit=new" className="rounded-full border border-gold/40 px-4 py-2 text-sm font-semibold text-gold-deep">
            + Create offer
          </a>
        </div>
      </div>
    </div>
  );
}
