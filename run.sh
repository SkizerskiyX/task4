#!/bin/bash

set -e

export PATH="/root/.dotnet/tools:${PATH}"

echo "Waiting for PostgreSQL..."
for i in {1..30}; do
  if pg_isready -h postgres -p 5432 -U taskuser -d taskdb 2>/dev/null; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

echo "Applying migrations..."
/root/.dotnet/tools/dotnet-ef database update \
  --project /app/Infrastructure/Infrastructure.csproj \
  --startup-project /app/taskAPI/taskAPI.csproj \
  || echo "Migrations completed or already applied"

echo "Starting API..."
exec dotnet /app/taskAPI.dll
