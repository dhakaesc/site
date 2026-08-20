CREATE TABLE "slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_key" varchar(500) NOT NULL,
	"eyebrow" varchar(120) DEFAULT '',
	"title" varchar(200) NOT NULL,
	"description" text DEFAULT '',
	"cta_label" varchar(60) DEFAULT 'Create free profile',
	"cta_href" varchar(200) DEFAULT '/register',
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
