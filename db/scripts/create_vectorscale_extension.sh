#!/bin/bash
set -e

# When running inside the database container, connect to localhost
until pg_isready -h localhost -p 5432 -U postgres; do
  echo "Waiting for PostgreSQL initial setup..."
  sleep 1
done

echo "PostgreSQL is ready with system user. Creating vectorscale extension..."
psql -v ON_ERROR_STOP=1 --username postgres --dbname "$POSTGRES_DB" --host localhost <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;
EOSQL
echo "vectorscale extension created."

# Now wait for the custom user to be ready as well
until pg_isready -h localhost -p 5432 -U "$DB_USER"; do
  echo "Waiting for custom user '$DB_USER' to be ready..."
  sleep 1
done
echo "Custom user '$DB_USER' is ready."
