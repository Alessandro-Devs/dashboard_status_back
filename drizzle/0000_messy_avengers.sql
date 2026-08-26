ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password" varchar(255) NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updated_password" boolean DEFAULT true NOT NULL;
