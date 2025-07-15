CREATE TABLE "blockchain_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"tx_hash" text NOT NULL,
	"block_number" integer NOT NULL,
	"log_index" integer NOT NULL,
	"event_type" text NOT NULL,
	"user" text,
	"amount" numeric,
	"timestamp" timestamp with time zone
);
