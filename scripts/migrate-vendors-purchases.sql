CREATE TABLE `vendors` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `phone` text,
  `location` text,
  `supplies` text,
  `active` integer DEFAULT true NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `purchases` (
  `id` text PRIMARY KEY NOT NULL,
  `vendor_id` text,
  `item` text NOT NULL,
  `quantity` text,
  `cost` integer NOT NULL,
  `notes` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `purchases_vendor_idx` ON `purchases` (`vendor_id`);
