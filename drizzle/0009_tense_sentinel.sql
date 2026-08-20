ALTER TABLE "users" ALTER COLUMN "admin_category" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "category" varchar(40);