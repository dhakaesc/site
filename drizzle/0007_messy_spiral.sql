ALTER TABLE "users" ADD COLUMN "phone" varchar(30) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "identity_status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "identity_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "identity_verified_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_identity_verified_by_user_id_users_id_fk" FOREIGN KEY ("identity_verified_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;