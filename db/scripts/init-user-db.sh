#!/bin/bash
set -e

# Show environment variables for debugging
echo "DB_USER: ${DB_USER:-ai}"
echo "DB_DATABASE: ${DB_DATABASE:-ai}"
echo "POSTGRES_USER: ${POSTGRES_USER:-ai}"
echo "POSTGRES_DB: ${POSTGRES_DB:-ai}"

# Create the 'postgres' user with appropriate permissions if it doesn't exist
# This script will be executed by the Docker container's init process
# We need to connect using the user created by Docker Compose (likely 'ai')
psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-ai}" --dbname "${POSTGRES_DB:-ai}" <<-EOSQL
    DO
    \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
            CREATE ROLE postgres WITH LOGIN PASSWORD 'postgres' SUPERUSER;
            RAISE NOTICE 'Created postgres user';
        ELSE
            RAISE NOTICE 'Postgres user already exists';
        END IF;
    END
    \$\$;
    
    ALTER USER postgres WITH SUPERUSER;
    
    -- Grant privileges on database
    GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB:-ai}" TO postgres;
    
    -- Show all roles for debugging
    \du
EOSQL

echo "User 'postgres' has been created or updated with appropriate permissions."
