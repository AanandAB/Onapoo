# Onapookkal — Handover

## Live site
- **Storefront:** https://onapookkal.aanandab44.workers.dev
- **Admin:** https://onapookkal.aanandab44.workers.dev/admin
- **GitHub:** https://github.com/AanandAB/Onapoo

## Login
- Username: `admin`  ·  Password: `onam2026`  → **change this after first login** (product manager has no "change password" UI yet — change it in the D1 `admins` table, or ask for a password-change feature).

## Day-to-day (from the admin panel)
- **Products** (`/admin/products`) — edit rates, stock status, featured, and upload images (once R2 is enabled).
- **Offers** (`/admin/offers`) — create/edit percentage or flat offers.
- **Orders** (`/admin/orders`) — see all orders, filter by status, update status, message the customer on WhatsApp, export CSV.
- **New order** (`/admin/orders/new`) — enter a walk-in / phone order manually (your CRM for direct orders).

## Orders → WhatsApp
- Every online order is saved to D1 **and** opens a pre-filled WhatsApp message to **+91 70340 26295** (the customer taps Send).
- The admin CRM has a per-order "WhatsApp customer" button too.

## ⚠️ Remaining manual step — R2 (image upload)
R2 is not enabled on the Cloudflare account yet. To enable product-image uploads:
1. Cloudflare dashboard → add a payment method (R2 has a free tier but needs billing enabled).
2. **R2** → enable R2.
3. Run: `npx wrangler r2 bucket create onapookkal-media`
4. Uncomment the `r2_buckets` block in `wrangler.jsonc` and redeploy.

Until then, everything works except the admin "Upload image" button (it returns a "Storage not configured" message). Product images currently served are static (`/images/flowers/*.jpg`).

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
