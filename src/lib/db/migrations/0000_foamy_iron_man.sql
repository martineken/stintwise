CREATE TABLE IF NOT EXISTS "races" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" integer NOT NULL,
	"round" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"official_name" varchar(255),
	"circuit" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"race_date" date NOT NULL,
	"total_laps" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(3) NOT NULL,
	"number" integer,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"nationality" varchar(100),
	"team" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_code_unique" UNIQUE("code")
);
