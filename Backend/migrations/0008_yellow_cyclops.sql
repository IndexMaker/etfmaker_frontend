CREATE TABLE "temp_compositions" (
	"id" serial PRIMARY KEY NOT NULL,
	"index_id" varchar(66) NOT NULL,
	"token_address" varchar(66) NOT NULL,
	"coin_id" varchar(66) NOT NULL,
	"weight" numeric(7, 4) NOT NULL,
	"rebalance_timestamp" bigint NOT NULL,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "temp_rebalances" (
	"id" serial PRIMARY KEY NOT NULL,
	"index_id" varchar(66) NOT NULL,
	"weights" text NOT NULL,
	"prices" jsonb NOT NULL,
	"timestamp" bigint NOT NULL,
	"coins" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
