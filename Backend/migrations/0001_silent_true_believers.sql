CREATE TABLE "binance_pairs" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"quote_asset" varchar(10) NOT NULL,
	"status" varchar(20) NOT NULL,
	"fetched_at" timestamp DEFAULT now()
);
