# Onapookkal — Project Memory (agent context)

> Read this at the START of any session on this project to regain full context.
> Cross-session working memory for the agent. Last updated: 2026-08-13.

## 1. What this is
**Onapookkal** (ഓണപ്പൂക്കൾ) — an Onam flower e-commerce site (pookalam flowers) for Kannur, Kerala.
Bilingual (English default + Malayalam toggle). Online orders are saved to D1 **and** open a pre-filled WhatsApp message to the shop.

## 2. Live + repo
- Storefront: `https://onapookkal.aanandab44.workers.dev`
- Custom domain: `https://onapookkal.store` — **LIVE** (apex + `www`; `www` 301→apex via `src/middleware.ts`).
- Admin: `/admin`
- GitHub: `https://github.com/AanandAB/Onapoo` (branch `main`, **public repo**)

## 3. Stack
- Next.js 16 (App Router) + React 19 + Tailwind CSS 4 (`@theme` in `globals.css`, no tailwind.config)
- `@opennextjs/cloudflare` → Cloudflare Workers (edge)
- Drizzle ORM + Cloudflare D1 (db `onapookkal-db`, id `70f656a7-769d-408e-8c78-d789848682f6`)
- GSAP + Lenis (smooth scroll + scroll animations), lucide-react icons
- Fonts bundled locally in `assets/fonts` (Fraunces + Baloo Chettan 2 + Plus Jakarta Sans) — no Google Fonts runtime

## 4. Build / deploy (CRITICAL)
```bash
npm run dev                 # local dev
npx opennextjs-cloudflare build   # MUST use OpenNext — plain `next build` BREAKS
npx wrangler deploy         # deploy
npm run db:migrate:local    # / db:migrate:remote
npx tsx scripts/seed.ts     # seed
```
- **No CI/CD** — `git push` does NOT deploy. Deploy is a manual `wrangler deploy`.
- User's "push redeploy" = `git push origin main` then `opennextjs-cloudflare build` + `wrangler deploy`.
- **Never `git push` without explicit user approval** (user reviews offline, then says "push"). No `--force`/`--orphan`/`branch -D`.
- Multiple parallel Hermes sessions touch this repo — always `git fetch` + verify `origin/main` first.

## 5. Routes / architecture
- `(site)` route group (public; wrapper = header/footer/bottom-nav/cart/toast/scroll-progress):
  - `/` home = Hero → Marquee → HowItWorks → Catalog (products)
  - `/checkout`
  - `/shop/[slug]` — product detail pages
  - `/faq`, `/delivery`, `/about`, `/contact` — bilingual info pages (content in `info-pages.tsx`)
  - `/admin` — login + dashboard (products, offers, orders, orders/new, orders/[id])
  - `/api/health`, `/api/admin/export-orders` (CSV), `/api/upload`, `/media/[key]` (latter two are dead/guarded — no R2)
- Key components: `hero` (pookalam + countdown + 3D tilt/scroll), `pookalam.tsx` (SVG flower carpet), `onam-decor.tsx` (SVG Onam motifs: nilavilakku, vallam, Thrikkakarappan, Kathakali, banana leaf, kasavu divider, flower glyphs), `motion.tsx` (Lenis + Reveal + useTilt + ScrollProgress), `cart-context/drawer/toast`, `product-card/detail`, `bottom-nav`, `cart-bar`, `marquee`, `header`, `footer`, `info-pages`.

## 6. Data model (D1)
- `products`: slug, nameEn/Ml, colorEn/Ml, descriptionEn/Ml, unit, price, compareAtPrice, stockStatus, isFeatured, sortOrder, image (data URL OR `/images/flowers/*.jpg`), categoryId
- `categories`, `offers`, `orders` (items JSON, `deliveryMethod` delivery|pickup, `location` text, paymentMethod, paymentStatus, orderStatus, subtotal, deliveryCharge, total), `admins`, `settings` (key/value)
- **Product images: NO R2** (account-disabled). Uploaded images are base64 data URLs stored in `image` (admin compresses client-side to ≤1400px JPEG). Default images are static `/images/flowers/*.jpg`.

## 7. Key decisions & gotchas
- Images = data-URL approach (same as the Aquarium project), not R2.
- Cart UX: `add()` does NOT auto-open the drawer (toast instead); drawer opens only from the cart icon; no backdrop-blur on the drawer panel.
- Order flow: online order → saved to D1 + opens pre-filled WhatsApp to `+91 70340 26295`.
- Delivery: home delivery (browser geolocation "share my location") OR store pickup. Store coords `11.831404379922596, 75.55180389653135` (STORE_MAPS_LINK in `lib/site.ts`). Delivery charge ₹30 (in settings).
- `AUTH_SECRET` is a Worker secret; `getSecret()` in `lib/auth.ts` reads Workers env (with dev fallback).
- `workers_dev: true` MUST stay in `wrangler.jsonc` (fallback URL). Adding `routes` (custom domains) otherwise disables workers.dev.
- Browser test env has a buggy extension (injects `bis_skin_checked`, breaks form submits, drops cookies on server-action POSTs) — verify auth/server-actions via `curl`, not the browser.
- `unitLabel(unit, t)` maps product unit → translated label; pass the real `t` from `useLang()`, not an identity fn.

## 8. Constants
- WhatsApp: `917034026295` (display `+91 70340 26295`) — in `lib/site.ts`
- Delivery pincode: `670643` (Kannur)
- Onam 2026: Atham 17 Aug → Thiruvonam 26 Aug (`ONAM_THIRUVONAM` in `lib/site.ts`)
- Admin credentials: **in `HANDOVER.md` "Login" section — ⚠️ plaintext in a PUBLIC repo (see §10, must fix)**

## 9. Current state / pending (as of last session)
- **Custom domain `onapookkal.store`: LIVE** — apex + `www` both attached as Worker custom domains; `www` 301-redirects to apex via `src/middleware.ts`. All three URLs active (workers.dev, apex, www).
- Admin password was CHANGED in D1 (remote + local) — see §10.
- Next candidate work (from the UX/IA research): real product photos + "finished pookalam" gallery; trust signals (star rating + testimonials + freshness guarantee); indexable category URLs; product schema.org structured data.

## 10. Security (resolved)
Admin password was exposed in the public repo → redacted from `HANDOVER.md`, and the actual password was **changed** in D1 (remote + local) and verified with `verifyPassword`. The new password is known only to the owner — do NOT write it into any repo file. Username is `admin`.

## 11. Git
- All work committed + pushed through commit `173c152` (last session).
- Do NOT push without explicit approval.
