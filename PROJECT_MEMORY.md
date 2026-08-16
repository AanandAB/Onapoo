# Onapookkal — Project Memory (agent context)

> **Read this file at the START of any session on this project to regain full context.**
> It is the durable cross-session working memory. Last fully updated: 2026-08-16.
> (Also see `HANDOVER.md` for the non-technical owner-facing handover, and `UX_RESEARCH.md`.)

## 1. What this is
**Onapookkal** (ഓണപ്പൂക്കൾ) — an Onam flower e-commerce site (pookalam flowers) for Kannur, Kerala.
Bilingual (English default + Malayalam toggle). Online orders are saved to D1 **and** open a pre-filled WhatsApp message to the shop.

## 2. Live + repo
- Storefront (custom domain): `https://onapookkal.store` (apex + `www`; `www` 301→apex via `src/middleware.ts`)
- Workers.dev fallback: `https://onapookkal.aanandab44.workers.dev`
- Admin: `/admin` (username `admin`)
- GitHub: `https://github.com/AanandAB/Onapoo` (branch `main`, **PUBLIC repo — never commit secrets**)

## 3. Stack
- Next.js 16 (App Router) + React 19 + Tailwind CSS 4 (`@theme` in `globals.css`, no tailwind.config)
- `@opennextjs/cloudflare` → Cloudflare Workers (edge). **MUST use OpenNext, not plain `next build`.**
- Drizzle ORM + Cloudflare D1 (db `onapookkal-db`, id `70f656a7-769d-408e-8c78-d789848682f6`)
- GSAP + Lenis (smooth scroll), lucide-react icons, Leaflet (delivery map)
- Fonts bundled locally in `assets/fonts` (no Google Fonts runtime)

## 4. Build / deploy (CRITICAL)
```bash
npm run dev                         # local dev
npx tsc --noEmit -p tsconfig.json   # typecheck — MUST pass before build
npm run build                       # next build (webpack)
npx opennextjs-cloudflare build     # OpenNext (required)
npx wrangler deploy                 # deploy to Cloudflare
```
- **No CI/CD** — `git push` does NOT deploy. Deploy = manual `opennextjs-cloudflare build` + `wrangler deploy`.
- User's "push redeploy" = `git push origin main` then OpenNext build + `wrangler deploy`.
- **Never `git push` without explicit user approval** (user reviews offline, then says "push"). No `--force`/`--orphan`/`branch -D`.
- Multiple parallel Hermes sessions touch this repo — always `git fetch` + verify `origin/main` first.
- Kill `next dev` before building (it locks `.open-next` with EPERM).
- `npx tsc --noEmit -p tsconfig.json` is the ONLY reliable typecheck. The patch/write tool's inline "lint" output is **spurious noise** (it can't resolve `@/` path aliases or node_modules types) — ignore it; trust the real tsc exit code.

## 5. Data model (D1)
- **products**: slug, nameEn/Ml, colorEn/Ml, descriptionEn/Ml, unit, `price`, **`costPrice`** (buying cost, for profit), compareAtPrice, `stock` (integer; 0 = out of stock), isFeatured, sortOrder, `image` (data URL or `/images/flowers/*.jpg`), `images` (JSON string[] gallery), categoryId.
- **categories**, **offers**, **admins**, **settings** (key/value).
- **orders**: items (JSON `{productId,name,nameMl,unit,qty,price}`), deliveryMethod (delivery|pickup), `location` ("lat,lng" when shared), paymentMethod/paymentStatus, orderStatus (new→confirmed→packed→out_for_delivery→delivered / cancelled), subtotal, deliveryCharge, **`discount`**, **`couponCode`**, total, district, area, pincode, notes.
- **coupons**: code (PK), type (percent|free_delivery), value, phone (normalized, no country code), used (bool). Single-use, phone-bound.
- **expenses**: id, label, amount (₹), createdAt. (Additional business overhead for the P&L report.)

## 6. Key features & where they live
- **Distance-based delivery** (`lib/site.ts`): Haversine from store. Free ≤7 km; >7 km = ₹20 base + ₹5/extra km (ceil); free over ₹2,000; ₹30 flat if no location. Shared server+client via `computeDeliveryCharge(subtotal, location)` — server never trusts client.
- **Coupons** (`lib/coupons.ts`): `validateCoupon`, `markCouponUsed`, `generateCouponCode`. Checkout field (`checkout-form.tsx`) + preview API (`/api/coupon`). Applied in `placeOrder` (`lib/order-actions.ts`). Admin: `/admin/coupons` page + in-page generator (`coupon-generator.tsx`). Python GUI: `coupon_generator.py` (run `py -3.12 coupon_generator.py`).
- **Profit & Loss** (`lib/admin.ts` `getProfitReport`, `components/profit-report.tsx`, `/admin/profit`): Revenue = subtotal − coupon discount; COGS = Σ(costPrice × qty); Gross = revenue − COGS; Net = gross − expenses. Cancelled orders excluded. Animated count-up cards + per-day bar chart + cumulative line chart.
- **Delivery map** (`lib/geocode.ts`, `lib/admin.ts` `getDeliveryMapOrders`, `components/delivery-map.tsx`, `/admin/map`): Leaflet + OSM. Plots pending delivery orders (excl. cancelled/delivered). Exact pin from shared location, else pincode geocoded via Nominatim (cached).
- **Order tracking** (`/track`, `components/track-view.tsx`): customer enters order # + phone → status timeline + printable receipt (Print/Save button + `@media print` CSS).
- **Manual receipt send** (`lib/receipt.ts`): admin "Send receipt" button (orders list row + order detail header) opens a pre-filled WhatsApp message with a full itemized receipt; admin taps Send from their own device (no automation, no ban risk).
- **Dynamic inventory**: server-side stock check + decrement in `placeOrder`; cancelling an order in admin restocks its items (guarded against double-restock; manual orders skipped).
- **Cost-price snapshot**: `orders.items[]` carry a per-item `costPrice` (frozen at order time). `getProfitReport` uses the snapshot, falling back to live `products.costPrice` only for pre-existing orders.
- **Storefront search**: catalog search box filters by name/colour (EN + ML).
- **Location required**: checkout requires a shared location for home delivery (prominent "Required" styling) so the delivery map gets exact pins.
- **Multi-image gallery**: `products.images` JSON.
- **Privacy policy** (`/privacy`): Indian law (IT Act 2000 + DPDP Act 2023), footer link. Grievance Officer: Aanand AB, aanandab44@gmail.com.

## 7. Constants (in `lib/site.ts`)
- Store coordinate (delivery origin): **`11.8314722, 75.5517778`** = `11°49'53.3"N 75°33'06.4"E`. (Note: an older pickup coord `11.831404379922596, 75.55180389653135` appears in `STORE_MAPS_LINK` history — the delivery-origin is the new one above.)
- WhatsApp: `917034026295` (display `+91 70340 26295`).
- Delivery pincode: `670643` (Kannur).
- Onam 2026: Atham 17 Aug → Thiruvonam 26 Aug (`ONAM_THIRUVONAM` in site.ts).

## 8. Gotchas / pitfalls
- Browser test env has a buggy extension (injects `bis_skin_checked`, breaks form submits, drops cookies on server-action POSTs) — verify auth/server-actions via `curl`, not the browser.
- `unitLabel(unit, t)` needs the real `t` from `useLang()`, not an identity fn.
- Product images: **NO R2** (account disabled). Base64 data URLs in D1 (admin compresses to ≤1400px JPEG) or static `/images/flowers/*.jpg`. Avoid inlining many/large base64 images into HTML (bloats pages).
- `workers_dev: true` MUST stay in `wrangler.jsonc` (fallback URL); adding `routes` otherwise disables workers.dev.
- `AUTH_SECRET` is a Worker secret (`getSecret()` in `lib/auth.ts`, dev fallback).

## 9. Security
- Admin password is **NOT in any repo file** (was exposed once → changed in D1). Username `admin`. Do not write the password anywhere.
- Public repo: never commit secrets, tokens, PBKDF2 hashes, etc.

## 10. Git / current state (session 2026-08-16)
- Onam feature batch (`28df963`) committed and deployed (Version ID `592774ad`), pushed to origin/main.
- **Do NOT push without explicit approval.** Deploy = `npm run deploy` (opennextjs build + deploy).

## 11. Pending / candidate future work
- Auto-send receipt (automated) via WhatsApp: assessed **OpenWA** (feasible but unofficial/ban risk); official Cloud API is the safe-but-paid path. Manual "Send receipt" button already added — admin taps Send from own device.
- UPI/Razorpay keys (deferred by owner — later).
- Admin Settings page for delivery thresholds (deferred — later).
- R2 / proper image upload (blocked: R2 account disabled — options noted in session).
