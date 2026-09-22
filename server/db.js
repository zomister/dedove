import mysql from 'mysql2/promise';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'dedove',
    password: process.env.DB_PASSWORD || 'dedove',
    database: process.env.DB_NAME || 'dedove',
    charset: 'utf8mb4',
};

export const pool = mysql.createPool({ ...config, connectionLimit: 10 });

const schemaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');

// MySQL container can start slower than the app, so retry until it accepts connections
export async function initDb({ retries = 30, delayMs = 2000 } = {}) {
    const schema = await fs.readFile(schemaPath, 'utf8');
    for (let attempt = 1; attempt <= retries; attempt++) {
        let conn;
        try {
            conn = await mysql.createConnection({ ...config, multipleStatements: true });
            await conn.query(schema);
            console.log('Database schema applied');
            return;
        } catch (err) {
            console.warn(`DB init attempt ${attempt}/${retries} failed:`, err.code ?? err.message);
            await new Promise((r) => setTimeout(r, delayMs));
        } finally {
            await conn?.end().catch(() => {});
        }
    }
    console.error('Giving up on DB init');
}
