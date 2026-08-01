CREATE TABLE "payment_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tier" varchar(20) NOT NULL,
	"amount" integer NOT NULL,
	"method" varchar(20) NOT NULL,
	"sender_number" varchar(30) NOT NULL,
	"transaction_id" varchar(60) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"admin_note" text DEFAULT '',
	"reviewed_by_user_id" integer,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_requests_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tier_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;