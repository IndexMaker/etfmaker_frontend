CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"announce_date" timestamp NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key_name" text,
	"key" text NOT NULL,
	"expired_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "crypto_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"token_name" text NOT NULL,
	"listing_announcement_date" jsonb NOT NULL,
	"listing_date" jsonb NOT NULL,
	"delisting_announcement_date" jsonb,
	"delisting_date" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
