CREATE TABLE "bitget_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"base_asset" varchar(10) NOT NULL,
	"quote_asset" varchar(10) NOT NULL,
	"product_type" varchar(10) NOT NULL,
	"status" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
