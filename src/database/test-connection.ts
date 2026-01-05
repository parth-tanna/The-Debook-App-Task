import { config } from 'dotenv';
import { Client } from 'pg';

config();

async function testConnection() {
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'debookchallengedb',
    });

    try {
        console.log('Testing database connection...');
        console.log('Config:', {
            host: process.env.DATABASE_HOST || 'localhost',
            port: process.env.DATABASE_PORT || '5432',
            user: process.env.DATABASE_USER || 'postgres',
            database: process.env.DATABASE_NAME || 'debookchallengedb',
        });

        await client.connect();
        console.log('✓ Successfully connected to PostgreSQL');

        const result = await client.query('SELECT version()');
        console.log('PostgreSQL version:', result.rows[0].version);

        await client.end();
        console.log('✓ Connection closed');
    } catch (error) {
        console.error('✗ Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
