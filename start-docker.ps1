# Add Docker to PATH for this session
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"

# Check if docker is available
try {
    docker --version
    Write-Host "Docker found! Starting services..." -ForegroundColor Green
} catch {
    Write-Error "Docker executable not found even after modifying PATH. Please ensure Docker Desktop is installed."
    exit 1
}

# Run docker compose
docker compose up -d --build

# Run migrations (wait a bit for container to be ready)
Write-Host "Waiting for services to initialize..."
Start-Sleep -Seconds 10
Write-Host "Running migrations..."
docker compose exec app npm run migration:run

Write-Host "------------------------------------------------"
Write-Host "App is running at http://localhost:3000" -ForegroundColor Cyan
Write-Host "------------------------------------------------"
