# Running Debook in Docker

I have Dockerized the application so you can run the entire stack (App, Postgres, Redis) with a single command, or connect to your local Postgres installation.

## Option 1: Run Full Stack in Docker (Recommended)

This runs the NestJS API, PostgreSQL, and Redis in isolated containers.

1.  **Start Everything (Recommended)**:
    Use the automated scripts to start containers and run migrations:
    ```bash
    # Windows
    ./start-docker.ps1

    # Linux/Mac
    bash start-docker.sh
    ```

    *Alternatively, use standard docker command:*
    ```bash
    docker compose up -d --build
    ```

2.  **Run Migrations** (Internal):
    *Note: The helper scripts automate this. If running manually via docker compose:*
    ```bash
    docker compose exec app npm run migration:run
    ```

3.  **Access API**:
    The API will be available at `http://localhost:3000`.

## Option 2: Connect to Local Postgres

If you prefer to use your locally installed PostgreSQL instead of the Docker container:

1.  **Update `docker-compose.yml`**:
    Change the `DATABASE_HOST` environment variable for the `app` service:
    ```yaml
    environment:
      - DATABASE_HOST=host.docker.internal # Connects to host machine's localhost
      # ... other vars ...
    ```

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
