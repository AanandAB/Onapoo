-- Add `hidden` flag to products so a product can be hidden from the storefront
-- without deleting it. Booleans are stored as INTEGER (0/1) in D1/SQLite.
-- Apply with:
--   npx wrangler d1 execute onapookkal-db --remote --file scripts/migrate-product-hidden.sql
ALTER TABLE products ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
