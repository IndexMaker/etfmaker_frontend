ALTER TABLE "sync_state" DROP CONSTRAINT "sync_state_event_name_unique";--> statement-breakpoint
ALTER TABLE "blockchain_events" ADD COLUMN "contract_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "blockchain_events" ADD COLUMN "network" text NOT NULL;--> statement-breakpoint
ALTER TABLE "blockchain_events" ADD COLUMN "user_address" text;--> statement-breakpoint
ALTER TABLE "sync_state" ADD COLUMN "contract_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sync_state" ADD COLUMN "network" text NOT NULL;--> statement-breakpoint
ALTER TABLE "blockchain_events" DROP COLUMN "user";--> statement-breakpoint
ALTER TABLE "sync_state" DROP COLUMN "event_name";--> statement-breakpoint
ALTER TABLE "sync_state" ADD CONSTRAINT "sync_state_contract_address_network_unique" UNIQUE("contract_address","network");