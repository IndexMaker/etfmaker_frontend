CREATE TABLE "token_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"coin_gecko_id" varchar(100) NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"categories" jsonb NOT NULL,
	"market_cap" bigint,
	"fetched_at" timestamp DEFAULT now()
);
