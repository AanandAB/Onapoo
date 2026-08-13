"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "M3 3h8v8H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 15h8v6H3z" },
  { href: "/admin/products", label: "Products", icon: "M12 3c3 3 6 4.5 6 8a6 6 0 1 1-12 0c0-3.5 3-5 6-8z" },
  { href: "/admin/offers", label: "Offers", icon: "M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" },
  { href: "/admin/orders", label: "Orders", icon: "M6 2h9l4 4v16H6zM15 2v4h4M9 12h6M9 16h6" },
];

export function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-ink/10 bg-paper lg:h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="px-5 py-5">
        <Link href="/admin" className="font-display text-lg font-semibold text-leaf-deep">
          Onapookkal <span className="text-muted">Admin</span>
        </Link>
        <p className="mt-1 text-xs text-muted">Signed in as {username}</p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
        {LINKS.map((l) => {
          const active =
            l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-gold/15 text-gold-deep" : "text-ink/70 hover:bg-cream"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d={l.icon} strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-ink/10 px-3 py-3 lg:block">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-cream"
        >
          View site ↗
        </a>
        <form action={logoutAction}>
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-chethi hover:bg-chethi/5">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
