ALTER TABLE "users" ADD COLUMN "profile_source" varchar(20) DEFAULT 'self' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_category" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "admin_note" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_published" boolean DEFAULT true NOT NULL;