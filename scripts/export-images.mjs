// One-off: pull the base64 data-URL product images from remote D1,
// decode them to static files under public/images/flowers/<slug>.<ext>,
// and emit the UPDATE SQL to repoint the image column at the static path.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const q = "SELECT slug, image FROM products WHERE image LIKE 'data:%'";
const raw = execSync(
  `npx wrangler d1 execute onapookkal-db --remote --json --command="${q}"`,
  { encoding: "utf8", maxBuffer: 100 * 1024 * 1024 },
);
const start = raw.indexOf("[");
const json = JSON.parse(raw.slice(start));
const rows = json[0].results;

const updates = [];
let n = 0;
for (const r of rows) {
  const img = r.image || "";
  const m = img.match(/^data:image\/(?:png|jpeg|jpg);base64,(.+)$/s);
  if (!m) {
    console.log("SKIP (bad format):", r.slug);
    continue;
  }
  const ext = img.includes("image/png") ? "png" : "jpg";
  const buf = Buffer.from(m[1], "base64");
  const rel = `public/images/flowers/${r.slug}.${ext}`;
  writeFileSync(rel, buf);
  updates.push(`UPDATE products SET image = '/images/flowers/${r.slug}.${ext}' WHERE slug = '${r.slug}';`);
  n++;
  console.log(`Wrote ${rel} (${buf.length} bytes)`);
}
writeFileSync("scripts/update-images.sql", updates.join("\n") + "\n");
console.log(`\n${n} images exported. SQL written to scripts/update-images.sql`);
