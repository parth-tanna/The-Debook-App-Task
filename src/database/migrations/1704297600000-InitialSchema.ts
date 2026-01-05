import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704297600000 implements MigrationInterface {
  name = 'InitialSchema1704297600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "username" varchar NOT NULL UNIQUE,
        "email" varchar NOT NULL UNIQUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create indexes on users
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_username" ON "users" ("username")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`,
    );

    // Create posts table with denormalized counters
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "content" text NOT NULL,
        "likes_count" integer NOT NULL DEFAULT 0,
        "comments_count" integer NOT NULL DEFAULT 0,
        "version" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create indexes on posts
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_posts_user_id" ON "posts" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_posts_created_at" ON "posts" ("created_at")`,
    );

    // Create likes table with unique constraint for duplicate prevention
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "likes" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_likes_user_post" UNIQUE ("user_id", "post_id")
      )
    `);

    // Create indexes on likes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_likes_post_id" ON "likes" ("post_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_likes_user_id" ON "likes" ("user_id")`,
    );

    // Create notification type enum (Postgres doesn't support IF NOT EXISTS for TYPE easily, catching error)
    try {
      await queryRunner.query(`
            CREATE TYPE "notification_type_enum" AS ENUM ('post_liked', 'post_commented')
        `);
    } catch (e) {
      // Ignore if type already exists
    }

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" "notification_type_enum" NOT NULL,
        "data" jsonb NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create composite index for efficient unread notifications query
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notifications_user_read" ON "notifications" ("user_id", "read")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notifications_created_at" ON "notifications" ("created_at")`,
    );

    // Insert some seed users for testing
    await queryRunner.query(`
      INSERT INTO "users" ("id", "username", "email") VALUES
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'alice', 'alice@debook.com'),
      ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bob', 'bob@debook.com'),
      ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'charlie', 'charlie@debook.com')
      ON CONFLICT ("username") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
    await queryRunner.query(`DROP TABLE "likes"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
