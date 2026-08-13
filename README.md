# Onapookkal · ഓണപ്പൂക്കൾ

Fresh Onam flowers delivered across Kannur — a seasonal e-commerce site for selling pookalam flowers during Onam.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **@opennextjs/cloudflare** — runs on Cloudflare Workers
- **Cloudflare D1** (SQLite) via **Drizzle ORM**
- **Product images** — self-hosted in `/public/images` + admin uploads stored as base64 data URLs in D1 (no R2)
- **Cloudflare Pages** — static assets + hosting

## Features

- **Storefront** — bilingual (English default, Malayalam toggle), Lenis smooth scroll + GSAP parallax, animated pookalam hero, live Thiruvonam countdown, category filter, cart, checkout.
- **Checkout** — COD + Pay-on-WhatsApp + Razorpay (auto-hidden until keys set). Orders save to D1 **and** open a pre-filled WhatsApp message to the shop (7034026295).
- **Admin panel** (`/admin`) — login, product manager (rates, stock, R2 image upload), offer manager.
- **CRM** (`/admin/orders`) — order dashboard with status workflow, per-order WhatsApp button, CSV export, and **manual order entry** for walk-in/phone orders.

## Getting started

```bash
npm install
npm run db:generate          # create D1 migration from schema
npm run db:migrate:local     # apply migration to local D1
npm run seed                 # seed categories, products, admin, settings
npm run dev                  # http://localhost:3000
```

Admin login (change after first login): `admin` / `onam2026`

## Build & deploy

```bash
npm run build                                # opennextjs-cloudflare build
npx wrangler d1 migrations apply onapookkal-db --remote   # prod DB
npm run seed -- --remote  (or run seed against remote)    # prod seed
npx wrangler deploy                          # deploy worker
```

Environment variables / secrets:

- `AUTH_SECRET` — session signing secret (set via wrangler secret)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — optional; enable online payments
