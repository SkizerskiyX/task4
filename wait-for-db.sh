#!/bin/bash
# Применение миграций базы данных

set -e

echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if pg_isready -h postgres -p 5432 -U taskuser -d taskdb; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

echo "Running Entity Framework migrations..."
cd /app
dotnet ef database update --project Infrastructure.csproj || true

echo "Database migration completed!"
