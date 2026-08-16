<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Onapookkal — project context (start here)

This repo is **Onapookkal** (ഓണപ്പൂക്കൾ), an Onam flower e-commerce site for Kannur, Kerala — Next.js 16 + Cloudflare Workers + D1.

**Read `PROJECT_MEMORY.md` first** — it is the full cross-session context: stack, build/deploy commands, data model, delivery/coupon/profit rules, constants, gotchas, and pending work.

Quick critical facts (details in PROJECT_MEMORY.md):
- Deploy is NOT `git push`. Sequence: `npm run build` → `npx opennextjs-cloudflare build` → `npx wrangler deploy`.
- **Never `git push` without explicit user approval** (public repo; user reviews offline, then says "push").
- Typecheck with `npx tsc --noEmit -p tsconfig.json`. The inline patch/write-tool "lint" output is spurious noise (can't resolve `@/` aliases) — trust the real tsc exit code.
- Store delivery origin: `11.8314722, 75.5517778`. WhatsApp `+91 70340 26295`. Pincode `670643`.
- No R2 (account disabled) — product images are base64 in D1 or static `/images/flowers/*.jpg`.
