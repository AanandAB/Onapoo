ALTER TABLE `orders` ADD `delivery_method` text DEFAULT 'delivery' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `location` text;