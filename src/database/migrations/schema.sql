-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "username" varchar NOT NULL UNIQUE,
  "email" varchar NOT NULL UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes on users
CREATE INDEX IF NOT EXISTS "IDX_users_username" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email");

-- Create posts table with denormalized counters
CREATE TABLE IF NOT EXISTS "posts" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" varchar NOT NULL,
  "content" text NOT NULL,
  "likes_count" integer NOT NULL DEFAULT 0,
  "comments_count" integer NOT NULL DEFAULT 0,
  "version" integer NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes on posts
CREATE INDEX IF NOT EXISTS "IDX_posts_user_id" ON "posts" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_posts_created_at" ON "posts" ("created_at");

-- Create likes table with unique constraint for duplicate prevention
CREATE TABLE IF NOT EXISTS "likes" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" varchar NOT NULL,
  "post_id" varchar NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_likes_user_post" UNIQUE ("user_id", "post_id")
);

-- Create indexes on likes
CREATE INDEX IF NOT EXISTS "IDX_likes_post_id" ON "likes" ("post_id");
CREATE INDEX IF NOT EXISTS "IDX_likes_user_id" ON "likes" ("user_id");

-- Create notification type enum
DO $$ BEGIN
  CREATE TYPE "notification_type_enum" AS ENUM ('post_liked', 'post_commented');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" varchar NOT NULL,
  "type" "notification_type_enum" NOT NULL,
  "data" jsonb NOT NULL,
  "read" boolean NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create composite index for efficient unread notifications query
CREATE INDEX IF NOT EXISTS "IDX_notifications_user_read" ON "notifications" ("user_id", "read");
CREATE INDEX IF NOT EXISTS "IDX_notifications_created_at" ON "notifications" ("created_at");

-- Insert seed users for testing
INSERT INTO "users" ("id", "username", "email") VALUES
  ('user-1', 'alice', 'alice@debook.com'),
  ('user-2', 'bob', 'bob@debook.com'),
  ('user-3', 'charlie', 'charlie@debook.com')
ON CONFLICT DO NOTHING;
