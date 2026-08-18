#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
for i in {1..30}; do
  if pg_isready -h postgres -p 5432 -U taskuser -d taskdb 2>/dev/null; then
    echo "PostgreSQL ready!"
    break
  fi
  sleep 1
done

echo "Applying migrations..."
cd /app
/root/.dotnet/tools/dotnet-ef database update \
  --project /app/src/Infrastructure/Infrastructure.csproj \
  --startup-project /app/src/taskAPI/taskAPI.csproj || true

echo "Starting API..."
exec dotnet taskAPI.dll
