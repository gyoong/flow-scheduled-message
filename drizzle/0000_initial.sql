CREATE TABLE IF NOT EXISTS "scheduled_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "author_email" varchar(255) NOT NULL,
  "target_id" varchar(255) NOT NULL,
  "target_name" varchar(255),
  "content" text NOT NULL,
  "scheduled_at" timestamp with time zone NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "error_message" text,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_status_scheduled" ON "scheduled_messages" ("status", "scheduled_at");
CREATE INDEX IF NOT EXISTS "idx_author_email" ON "scheduled_messages" ("author_email");
