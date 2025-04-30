ALTER TABLE "compositions" ADD COLUMN "rebalance_timestamp" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "compositions" ADD COLUMN "valid_until" timestamp;