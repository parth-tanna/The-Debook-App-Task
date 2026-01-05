# Running Debook in Docker

I have Dockerized the application so you can run the entire stack (App, Postgres, Redis) with a single command, or connect to your local Postgres installation.

## Option 1: Run Full Stack in Docker (Recommended)

This runs the NestJS API, PostgreSQL, and Redis in isolated containers.

1.  **Start Everything**:
    The application is configured to run entirely via Docker Compose. Ensure your `.env` file is populated with the necessary values (see `.env.example`).

    ```bash
    docker compose up -d --build
    ```

2.  **Automatic Migrations**:
    The API container uses `docker-entrypoint.sh` to run migrations automatically before starting the NestJS application. There is no need for manual migration steps during initial setup.

3.  **Access API**:
    The API will be available at `http://localhost:3000`.

## Option 2: Connect to Local Postgres

If you prefer to use your locally installed PostgreSQL instead of the Docker container:

1.  **Host Configuration**:
    The Docker setup now uses dedicated variables to avoid conflicts with your local development environment:
    - `DOCKER_DATABASE_HOST` (defaults to `postgres`)
    - `DOCKER_REDIS_HOST` (defaults to `redis`)
    
    This ensures that even if your `DATABASE_HOST` is set to `localhost` in `.env`, the Docker container will use the correct service name to connect.

    *Note: You may need to ensure your local Postgres is listening on all interfaces (check `postgresql.conf` -> `listen_addresses = '*'`) and `pg_hba.conf` allows connections.*

2.  **Start App Only**:
    You can stop the postgres service in docker-compose or just run:
    ```bash
    docker compose up -d app redis
    ```
    *(Redis is still needed for the async queue, unless you have that locally too)*

## Dockerfile Details

The `Dockerfile` is a multi-stage build:
1.  **Builder Stage**: Installs all dependencies and builds the NestJS app.
2.  **Production Stage**: Uses a lightweight image, installs only production dependencies, and copies the built artifacts (`dist`).

## Useful Commands

- **View Logs**:
  ```bash
  docker compose logs -f app
  ```

- **Rebuild App**:
  ```bash
  docker compose up -d --build app
  ```

- **Stop All**:
  ```bash
  docker compose down
  ```
