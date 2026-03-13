#!/bin/bash

# Configuration
DB_NAME="nhfg_crm"
DB_USER="postgres"
export PGPASSWORD="Newholland@2026"
PSQL_PATH="/Library/PostgreSQL/18/bin/psql"
SCHEMA_PATH="./backend/supabase_schema.sql"

# Check if psql exists
if [ ! -f "$PSQL_PATH" ]; then
    echo "❌ psql not found at $PSQL_PATH. Looking in PATH..."
    PSQL_PATH=$(which psql)
fi

if [ -z "$PSQL_PATH" ]; then
    echo "❌ psql command not found. Please ensure PostgreSQL is installed and psql is in your PATH."
    exit 1
fi

echo "🚀 Setting up local database: $DB_NAME..."

# 1. Create the database
echo "Step 1: Creating database '$DB_NAME'..."
"$PSQL_PATH" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "⚠️  Database '$DB_NAME' already exists (skipping)."

# 2. Run the schema
echo "Step 2: Initializing schema from $SCHEMA_PATH..."
"$PSQL_PATH" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Database $DB_NAME successfully initialized!"
else
    echo "❌ Failed to initialize database."
    exit 1
fi

echo "🎉 Local setup complete! You can now start the server with 'npm run server:local'."
