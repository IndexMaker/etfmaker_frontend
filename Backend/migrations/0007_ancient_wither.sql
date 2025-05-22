CREATE TABLE "coin_symbols" (
	"symbol" text PRIMARY KEY NOT NULL,
	"coin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_prices" (
	"index_id" text NOT NULL,
	"date" date NOT NULL,
	"price" numeric NOT NULL,
	"quantities" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_prices_index_id_date_pk" PRIMARY KEY("index_id","date")
);
