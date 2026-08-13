# Onapookkal — Handover

## Live site
- **Storefront:** https://onapookkal.aanandab44.workers.dev
- **Admin:** https://onapookkal.aanandab44.workers.dev/admin
- **GitHub:** https://github.com/AanandAB/Onapoo

## Login
- Username: `admin`  ·  Password: `onam2026`  → **change this after first login** (product manager has no "change password" UI yet — change it in the D1 `admins` table, or ask for a password-change feature).

## Day-to-day (from the admin panel)
- **Products** (`/admin/products`) — edit rates, stock status, featured, and add images (paste a URL or upload a file — no R2 needed).
- **Offers** (`/admin/offers`) — create/edit percentage or flat offers.
- **Orders** (`/admin/orders`) — see all orders, filter by status, update status, message the customer on WhatsApp, export CSV.
- **New order** (`/admin/orders/new`) — enter a walk-in / phone order manually (your CRM for direct orders).

## Orders → WhatsApp
- Every online order is saved to D1 **and** opens a pre-filled WhatsApp message to **+91 70340 26295** (the customer taps Send).
- The admin CRM has a per-order "WhatsApp customer" button too.

## Product images (no R2 needed)
Images are stored directly in the product's `image` column. In the admin, pick **Link** (paste an image URL) or **Upload** (pick a file — the browser compresses it to a small base64 data URL and saves it straight into D1). No R2, no billing. Default catalog images are static files in `/images/flowers/*.jpg`.

## Redeploy
```bash
npm install
npx opennextjs-cloudflare build
npx wrangler deploy
```

## Environment / secrets (already set)
- `AUTH_SECRET` — Worker secret (session signing). Set via `wrangler secret put`.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — optional; add as Worker secrets to enable online payment (else COD + WhatsApp only).

## Notes
- Language: English default, Malayalam toggle (top-right). Brand name stays English.
- Onam 2026: Atham 17 Aug → Thiruvonam 26 Aug (countdown in the hero).
- Delivery: Kannur, pincode 670643, ₹30 delivery charge (editable in settings table).
