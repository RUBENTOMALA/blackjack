CREATE TABLE "deck" (
	"id" char(30) PRIMARY KEY NOT NULL,
	"time_created" timestamp DEFAULT now() NOT NULL,
	"time_updated" timestamp DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
	"time_deleted" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"success" boolean NOT NULL,
	"deck_id" varchar(20) NOT NULL,
	"shuffled" boolean NOT NULL,
	"remaining" integer NOT NULL
);
