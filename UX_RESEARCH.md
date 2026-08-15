# Onapookkal — User Experience Research Report

Date: 2026-08-15
Method: live walkthrough of the customer-facing storefront (home → shop → product → cart → checkout → empty-cart), plus codebase inspection. Desktop viewport (1264×625); the codebase is mobile-first (bottom nav, sticky cart, 44–48px touch targets) but mobile was not visually tested at a mobile viewport.

---

## 1. Executive summary

Onapookkal is a polished, cohesive, strongly Onam-themed storefront. It is already above the typical bar for a local business site: real Malayalam localization, clean pricing with discounts and unit labels, a sensible delivery/pickup toggle, WhatsApp-first ordering (correct for Kerala), and — after this week's work — dynamic stock with low-stock warnings, pincode→area auto-lookup, and typeable quantities.

The gaps are concentrated in four areas: **findability** (no search), **trust** (no social proof, no freshness/quality guarantee), **payments** (no UPI), and a few **checkout friction points** (prefilled pincode, no delivery-charge context).

Overall grade: **B+ / A- for a local business** — strong foundation, with a short list of high-impact improvements.

---

## 2. Strengths (keep these)

1. **Clear value proposition.** Hero: "Grow your pookalam petal by petal" + "fresh to your door, from sacred Thumba to vibrant Chethi", with a live Thiruvonam countdown (verified accurate — targets 2026-08-26 IST).
2. **Genuine Malayalam localization.** Nav, hero, checkout (labels, delivery method, payment, summary, empty state), footer — all fully translated. Brand "Onapookkal" correctly stays in English.
3. **Category filtering.** Six color-coded pills (Traditional, Popular, Petal Packs, Pookalam Kits, Bulk) filter instantly. Verified: "Traditional Flowers" → 9 items.
4. **Clear pricing.** Discount %, strike-through compare-at price, and unit label ("/ bunch", "/ kg", "/ kit") on every card.
5. **Delivery/pickup toggle works correctly.** Pickup hides address + pincode + location fields and swaps "Delivery ₹30" → "Store pickup · Free". Total updates to ₹50.
6. **WhatsApp-first.** Order-on-WhatsApp is a primary CTA throughout; correct channel for this market.
7. **Stock transparency.** Low-stock ("Only X left") and out-of-stock overlays, quantity capped at available stock.
8. **Pincode → area/district auto-lookup** (new this week).
9. **Typeable quantity** on product page + cards (new this week).
10. **Empty-cart state** handled with a clear message + "back to shop" CTA.
11. **Performance.** Product images are static files (page ~143 KB after the base64 fix), 20 `<img>` tags, fast.
12. **Footer** carries full contact: WhatsApp, store pickup map link, pincode 670643.

---

## 3. Findings (ranked)

### HIGH

**H1 — No search.** 20 products and no search box anywhere. A returning customer wanting "Thumba" or "lotus" must scroll or guess the right category. This is the single biggest findability gap and is a small client-side filter to add.

**H2 — No social proof or trust signals.** No testimonials, reviews, star ratings, "trusted by N customers", and no freshness/quality guarantee. Flowers are a perishable, trust-sensitive purchase; first-time buyers have no reassurance. Even 2–3 short testimonials + a "freshness promise" line would materially lift conversion.

**H3 — No UPI / online payment.** Checkout offers only "Pay on WhatsApp" and "Cash on delivery". UPI is the dominant payment method in India; its absence forces a manual WhatsApp payment or COD. (Razorpay code exists but is unconfigured — no keys. A UPI QR / UPI ID would be a lower-friction stopgap.)

### MEDIUM

**M1 — Pincode prefilled with the store's own pincode (670643).** On delivery, the field defaults to the shop's pickup pincode. A customer who doesn't notice will have their order recorded with the wrong area. Should default empty (or to a sensible delivery default), not the pickup pincode.

**M2 — Pincode lookup only fires on blur.** Because the field is prefilled, the helpful "📍 Ayithara Mambram, Kannur" confirmation never appears unless the user edits the field. Should also resolve on load.

**M3 — No delivery-charge context at checkout.** "Delivery ₹30" appears with no explanation and no free-delivery threshold. Users can't tell if ₹30 is flat, per-km, or waivable.

### LOW

**L1 — Category filter has no URL state.** Selecting a category doesn't update the URL, so a refresh resets to "All" and there's no shareable filtered link. Fine for 20 products; nice-to-have.

**L2 — Thin product descriptions.** Kits especially don't state "what's included" (which flowers, approx. stems, size). This matters for ₹300–₹800 kit purchases.

**L3 — Header cart button labeled "Checkout".** The header control shows a cart icon + count but is labeled "Checkout", which can read as "go straight to payment" rather than "open basket". Minor label clarity.

**L4 — Accessibility not formally audited.** Decorations are correctly `aria-hidden` and `prefers-reduced-motion` is respected, but there's been no contrast/focus-order pass.

---

## 4. Recommendations (prioritized)

1. **Add search** (client-side name filter over the 20 products) — ~1 hour, highest findability ROI.
2. **Trust block** — 2–3 testimonials + a "hand-picked each morning / freshness promise" line on the home page and near the checkout button.
3. **Payments** — configure Razorpay (UPI/card) OR add a UPI ID / UPI QR as a lightweight alternative.
4. **Fix pincode default** — empty for delivery, and auto-run the area lookup on load.
5. **Delivery-charge clarity** — add "Delivery ₹30 (within Kannur)" + any free-delivery threshold.
6. **Enrich kit descriptions** — bullet "what's included" per kit.
7. **Minor:** cart-button label, category URL state, formal a11y pass.

---

## 5. Testing notes / limitations

- Walked: home, category filter, add-to-cart (count increments, drawer does not auto-open), delivery/pickup toggle, Malayalam toggle, empty-cart state.
- Not visually tested at mobile width (browser session was desktop 1264px); mobile-first patterns confirmed from code only.
- One JS console error observed (empty message) — consistent with the known buggy browser extension, not the site.
- Admin panel was out of scope for this customer-facing UX pass.
