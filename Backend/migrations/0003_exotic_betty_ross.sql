CREATE TABLE "binance_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"pair" varchar(20) NOT NULL,
	"action" varchar(10) NOT NULL,
	"timestamp" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"coin_id" varchar(100) NOT NULL,
	"categories" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_ohlc" (
	"id" serial PRIMARY KEY NOT NULL,
	"coin_id" varchar(100) NOT NULL,
	"open" numeric(18, 8) NOT NULL,
	"high" numeric(18, 8) NOT NULL,
	"low" numeric(18, 8) NOT NULL,
	"close" numeric(18, 8) NOT NULL,
	"timestamp" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
