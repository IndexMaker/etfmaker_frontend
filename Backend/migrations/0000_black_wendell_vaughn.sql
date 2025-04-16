CREATE TABLE "compositions" (
	"id" serial PRIMARY KEY NOT NULL,
	"index_id" varchar(66) NOT NULL,
	"token_address" varchar(66) NOT NULL,
	"weight" numeric(5, 4) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rebalances" (
	"id" serial PRIMARY KEY NOT NULL,
	"index_id" varchar(66) NOT NULL,
	"weights" text NOT NULL,
	"prices" jsonb NOT NULL,
	"timestamp" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"index_id" varchar(66) NOT NULL,
	"user_address" varchar(66) NOT NULL,
	"action" varchar(20) NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"tx_hash" varchar(66) NOT NULL,
	"chain_id" serial NOT NULL,
	"timestamp" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
