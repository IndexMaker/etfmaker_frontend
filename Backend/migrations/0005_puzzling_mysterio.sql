CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50) NOT NULL,
	"website_url" varchar(255),
	"docs_url" varchar(255),
	"twitter_url" varchar(255),
	"discord_url" varchar(255),
	"screenshots" json,
	"overview" text,
	"integration_details" text,
	CONSTRAINT "projects_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "compositions" ALTER COLUMN "weight" SET DATA TYPE numeric(7, 4);