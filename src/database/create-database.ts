import { config } from 'dotenv';
import { Client } from 'pg';

config();

async function createDatabase() {
    // First connect to the default 'postgres' database
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: 'postgres', // Connect to default database first
    });

    try {
        console.log('Connecting to PostgreSQL...');
        await client.connect();
        console.log('✓ Connected to PostgreSQL');

        // Check if database exists
        const dbName = process.env.DATABASE_NAME || 'debookchallengedb';
        const checkDb = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName],
        );

        if (checkDb.rows.length === 0) {
            console.log(`Creating database "${dbName}"...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✓ Database "${dbName}" created successfully`);
        } else {
            console.log(`✓ Database "${dbName}" already exists`);
        }

        await client.end();
        console.log('✓ Setup complete');
    } catch (error) {
        console.error('✗ Setup failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
            });
        }
        process.exit(1);
    }
}

createDatabase();
