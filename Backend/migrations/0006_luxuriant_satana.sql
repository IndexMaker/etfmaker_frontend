CREATE TABLE "historical_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"coin_id" text NOT NULL,
	"symbol" text NOT NULL,
	"timestamp" integer NOT NULL,
	"price" double precision NOT NULL
);
