CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"ip" varchar(64) NOT NULL,
	"success" boolean NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug_tr" varchar(200) NOT NULL,
	"slug_en" varchar(200) NOT NULL,
	"title_tr" varchar(200) NOT NULL,
	"title_en" varchar(200) NOT NULL,
	"excerpt_tr" varchar(300),
	"excerpt_en" varchar(300),
	"content_tr" text DEFAULT '' NOT NULL,
	"content_en" text DEFAULT '' NOT NULL,
	"cover_image_url" text,
	"cover_image_alt_tr" varchar(250),
	"cover_image_alt_en" varchar(250),
	"spotify_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"author_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "login_attempts_email_attempted_at_idx" ON "login_attempts" USING btree ("email","attempted_at");--> statement-breakpoint
CREATE INDEX "login_attempts_ip_attempted_at_idx" ON "login_attempts" USING btree ("ip","attempted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_tr_uq" ON "posts" USING btree ("slug_tr");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_en_uq" ON "posts" USING btree ("slug_en");--> statement-breakpoint
CREATE INDEX "posts_status_published_at_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "posts_not_deleted_idx" ON "posts" USING btree ("published_at") WHERE deleted_at IS NULL;