const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const encryptionService = require('./backend/encryptionService.cjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
if (connectionString && connectionString.includes('pooler.supabase.com')) {
    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const projectRef = sbUrl ? sbUrl.match(/https:\/\/([^.]+)\./)?.[1] : null;
    if (projectRef) {
        const dbUrl = new URL(connectionString);
        if (dbUrl.username && !dbUrl.username.includes('.')) {
            dbUrl.username = `postgres.${projectRef}`;
            connectionString = dbUrl.toString();
        }
    }
}
const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

const app = require('./backend/server.cjs');
const http = require('http');

const PORT = 3012;
const server = http.createServer(app);

async function run() {
    try {
        server.listen(PORT, async () => {
            console.log("Server listening on " + PORT);

            try {
                // 1. Create table if not exists (in case the initDB didn't finish)
                await pool.query(`
                    DROP TABLE IF EXISTS integration_accounts CASCADE;
                    CREATE TABLE integration_accounts (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        platform VARCHAR(50) NOT NULL,
                        access_token TEXT NOT NULL,
                        refresh_token TEXT,
                        expires_at TIMESTAMP WITH TIME ZONE,
                        external_account_id VARCHAR(255),
                        status VARCHAR(50) DEFAULT 'active',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // 2. Clear meta accounts
                await pool.query("DELETE FROM integration_accounts WHERE platform = 'meta'");

                // 3. Send webhook without account -> should be blocked
                const webhookPayload = {
                    object: "page",
                    entry: [
                        {
                            id: "12345",
                            time: 1620000000,
                            changes: [
                                {
                                    field: "leadgen",
                                    value: {
                                        ad_id: "444444444",
                                        form_id: "555555555",
                                        leadgen_id: "666666666",
                                        created_time: 1620000000,
                                        page_id: "12345",
                                        adgroup_id: "777777777",
                                        field_data: [
                                            { name: "full_name", values: ["John Doe Test"] },
                                            { name: "email", values: ["john.test@example.com"] },
                                            { name: "phone_number", values: ["555-123-4567"] }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                };

                console.log("Testing blocked webhook...");
                try {
                    await axios.post(`http://localhost:${PORT}/api/webhooks/meta`, webhookPayload);
                    console.log("Webhook should have been blocked!");
                } catch (e) {
                    if (e.response && e.response.status === 403) {
                        console.log("Correctly BLOCKED:", e.response.data);
                    } else {
                        console.log("Unexpected error:", e.message);
                    }
                }

                // 4. Add account
                const token = encryptionService.encrypt("test_meta_access_token");
                await pool.query(
                    `INSERT INTO integration_accounts (platform, access_token, status) VALUES ($1, $2, $3)`,
                    ['meta', token, 'active']
                );
                console.log("Integration account created.");

                // 5. Send webhook again -> should succeed
                console.log("Testing success webhook...");
                const res = await axios.post(`http://localhost:${PORT}/api/webhooks/meta`, webhookPayload);
                console.log("Webhook response status:", res.status);

                // 6. Check if lead was created
                const leadRes = await pool.query("SELECT * FROM leads WHERE email = 'john.test@example.com'");
                if (leadRes.rows.length > 0) {
                    console.log("Lead successfully created! Name:", leadRes.rows[0].name);
                } else {
                    console.log("Lead not found in database.");
                }

            } catch (err) {
                console.error("Test error:", err);
            } finally {
                server.close();
                pool.end();
                process.exit(0);
            }
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
