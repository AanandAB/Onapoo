# Onapookkal · ഓണപ്പൂക്കൾ

Fresh Onam flowers delivered across Kannur, Kerala — a seasonal e-commerce site for
selling pookalam flowers during Onam. Bilingual (English + മലയാളം), with a full
admin/CRM backend for running the shop day-to-day.

- **Storefront:** https://onapookkal.store
- **Admin:** https://onapookkal.store/admin (username `admin`)
- **Workers.dev fallback:** https://onapookkal.aanandab44.workers.dev

---

## Features

### Storefront (customer-facing)
- **Bilingual UI** — English by default, Malayalam toggle (top-right); persisted in localStorage.
- **Animated pookalam hero** with a live countdown to Thiruvonam (Onam 2026: Atham 17 Aug → Thiruvonam 26 Aug).
- **Catalog** — category filter pills + a **search box** (matches name & colour in English and Malayalam).
- **Product detail** — gallery, pricing, stock status, add-to-cart.
- **Cart** — slide-in drawer, persisted to localStorage, mobile "view cart" bar, quantity controls.
- **Smooth scroll + motion** — Lenis smooth scrolling (anchor-aware), GSAP ScrollTrigger, scroll-reveal animations, Onam motif decorations.

### Checkout & orders
- **Distance-based delivery charge** — Haversine from the store origin (`11.8314722, 75.5517778`): free ≤ 7 km, then ₹20 base + ₹5/extra km; free on orders over ₹2,000; ₹30 flat fallback when no location. Computed server-side (never trusts the client).
- **"Share my location"** — required for home delivery, so the delivery map gets exact pins instead of pincode guesses.
- **Payment methods** — Cash on Delivery, Pay-on-WhatsApp, and Razorpay online (auto-hidden until API keys are set).
- **Pincode lookup** — auto-fills district/area from the pincode.
- **Orders save to D1** and simultaneously open a **pre-filled WhatsApp message** to the shop (+91 70340 26295).
- **Order tracking** (`/track`) — customer enters order number + phone → live status timeline + a printable receipt.
- **Privacy policy** (`/privacy`) — Indian IT Act 2000 + DPDP Act 2023 compliant, with Grievance Officer details.

### Coupons
- Three coupon types: **percentage**, **flat ₹**, and **free delivery**.
- Single-use and bound to a phone number (validated server-side; flat discounts capped at the subtotal).
- Applied at checkout with a live preview API (`/api/coupon`); the discount line always shows when applied.
- **Two generators** — in the admin panel (`/admin/coupons`) and a standalone Python GUI (`py -3.12 coupon_generator.py`).

### Admin panel (`/admin`)
- **Login** — username `admin`; password stored in the D1 `admins` table (not in the repo).
- **Products** — manage names (EN/ML), price, cost price, stock, featured status, sorting, and images (URL or browser-compressed base64 upload — no R2 needed).
- **Offers** — percentage / flat site offers.
- **Coupons** — list, view used/unused, delete, and the in-page generator.
- **Orders (CRM)** — full order list with status filters + search; per-order WhatsApp button, **"Send receipt on WhatsApp"** (pre-filled itemized message) and **"PDF bill"** (printable receipt at `/admin/orders/[id]/receipt`); CSV export; **manual order entry** for walk-in / phone orders.
- **Delivery map** (`/admin/map`) — Leaflet + OpenStreetMap plotting all pending delivery orders (exact pin from shared location, else pincode geocoded via Nominatim).
- **Profit & Loss** (`/admin/profit`) — revenue, COGS, gross, expenses, and net profit with animated count-up cards, a per-day bar chart and a cumulative line chart. Cost price is **snapshotted per order**, so profit is frozen at order time.
- **Expenses tracker** — log extra overhead (transport, packing, etc.) that feeds the P&L report.
- **Inventory** — server-side stock check + decrement on order; **restock automatically on cancel**.

---

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **@opennextjs/cloudflare** — deploys to **Cloudflare Workers** (edge)
- **Cloudflare D1** (SQLite) via **Drizzle ORM**
- **GSAP + Lenis** (smooth scroll/animation), **lucide-react**, **Leaflet** (map)
- **Fonts** bundled locally (Playfair Display, Plus Jakarta Sans, JetBrains Mono) — no runtime Google Fonts
- **Product images** — self-hosted in `/public/images/flowers/*.jpg` or base64 data URLs in D1 (R2 is disabled)

---

## Getting started

```bash
npm install
npm run db:generate          # create D1 migration from schema
npm run db:migrate:local     # apply migration to local D1
npm run db:seed:local        # seed categories, products, admin, settings
npm run dev                  # http://localhost:3000
```

> Admin username is `admin`. The password is set in the D1 `admins` table — it is **not** in the repo.

## Build & deploy

Deploy is **manual** (no CI/CD — `git push` does not deploy):

```bash
npm run build     # next build (webpack)
npm run deploy    # opennextjs-cloudflare build + deploy to Cloudflare
```

Kill any running `next dev` first (it locks `.open-next` with EPERM).

### Environment variables / secrets

| Secret | Purpose |
| --- | --- |
| `AUTH_SECRET` | Session-signing secret (set via `wrangler secret put AUTH_SECRET`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional — enable online payments |

---

## Security

This is a **public** repository (https://github.com/AanandAB/Onapoo). Never commit
secrets, tokens, password hashes, or the admin password. `workers_dev: true` must stay
in `wrangler.jsonc` to keep the workers.dev fallback URL.

## Project structure

```
src/
  app/
    (site)/          # storefront pages (home, shop, checkout, track, about, contact, faq, delivery, privacy)
    admin/           # admin panel (login, dashboard, products, offers, coupons, orders, map, profit, reports)
    api/             # route handlers (coupon, pincode, upload, health, export-orders)
  components/        # UI components (catalog, checkout, cart, admin, receipt, map, report…)
  db/                # Drizzle schema + client
  lib/               # business logic (site constants, coupons, orders, admin, geocode, auth, i18n, receipt)
coupon_generator.py  # standalone Python GUI coupon generator (writes to D1 via wrangler)
```
