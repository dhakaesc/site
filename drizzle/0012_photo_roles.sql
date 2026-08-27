ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "role" varchar(10) DEFAULT 'album' NOT NULL;
--> statement-breakpoint
UPDATE "photos" p SET "role" = 'profile'
  WHERE p."position" = 0 AND p."role" = 'album'
    AND NOT EXISTS (SELECT 1 FROM "photos" q WHERE q."user_id" = p."user_id" AND q."role" = 'profile');
--> statement-breakpoint
UPDATE "photos" p SET "role" = 'cover'
  WHERE p."position" = 1 AND p."role" = 'album'
    AND NOT EXISTS (SELECT 1 FROM "photos" q WHERE q."user_id" = p."user_id" AND q."role" = 'cover');
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "photos_one_profile_per_user" ON "photos" ("user_id") WHERE "role" = 'profile';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "photos_one_cover_per_user" ON "photos" ("user_id") WHERE "role" = 'cover';
