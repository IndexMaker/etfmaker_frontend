CREATE TABLE "sync_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"last_synced_block" integer NOT NULL
);
