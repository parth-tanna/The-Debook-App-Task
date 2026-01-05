# Debook Challenge - Database Setup

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed

## Quick Start

### 1. Start Services and Setup Database

The recommended way is to use Docker, which automates container startup and migrations:

```bash
docker compose up -d --build
```

This will automatically create the database (via Postgres initialization), run migrations (via `docker-entrypoint.sh`), and start the application.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

The `.env.example` file is already configured for local development. The database name is `debookchallengedb`.

### 4. Build the Project

```bash
npm run build
```

### 5. Run Migrations (Manual)

*Note: If you used the helper scripts in Step 1, this step is already done.*

```bash
# Run all pending migrations manually
npm run migration:run
```

This will:
- Create the `debookchallengedb` database if it doesn't exist
- Create all tables (users, posts, likes, notifications)
- Add all columns including `updated_at` (User, Like) and `version` (Post)
- Add all indexes and constraints
- Insert seed users (user-1, user-2, user-3) for testing

### 6. Start the Application

```bash
# Development mode with hot reload
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Database Schema

### Tables

- **users**: User accounts (id, username, email, created_at, updated_at)
- **posts**: User posts with denormalized counters (id, user_id, content, likes_count, comments_count, version, created_at, updated_at)
- **likes**: Post likes with duplicate prevention (id, user_id, post_id, created_at, updated_at) - unique constraint on (user_id, post_id)
- **notifications**: Async notifications (id, user_id, type, data, read, created_at)

### Key Features

- **Denormalized Counters**: `likes_count` and `comments_count` stored on posts for O(1) reads
- **Unique Constraints**: Prevents duplicate likes via database constraint
- **Optimistic Locking**: Version column on posts for concurrent update safety
- **Indexes**: Strategic indexes on foreign keys, timestamps, and composite queries

## Migration Commands

All migration commands now use the native TypeORM CLI via the data-source file.

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration (after entity changes)
npm run migration:generate -- src/database/migrations/MigrationName
```

## Seed Users

Three test users are automatically created:
- `user-1` (alice@debook.com)
- `user-2` (bob@debook.com)
- `user-3` (charlie@debook.com)

Use these IDs in the `x-user-id` header for testing.

## Stopping Services

```bash
# Stop containers but keep data
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Remove everything including data
docker-compose down -v
```
