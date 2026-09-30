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

            const stopsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'data/stops.csv');

            async function seedStops(conn) {
                const [header, ...lines] = (await fs.readFile(stopsPath, 'utf8')).trim().split('\n');
                const keys = header.split(',');
                for (const line of lines) {
                    const row = Object.fromEntries(keys.map((key, i) => [key, line.split(',')[i]]));
                    const filename = row.name
                        .replace(/\s+(\w)/g, (_, char) => char.toUpperCase())
                        .replace(/^./, (char) => char.toLowerCase());
                
                        await conn.query(`
                        INSERT INTO stops
                        (id, name, image_url, is_transfer, x, y, wheelchair_accessible,
                        has_shelter, has_bench, has_ticket_machine, has_display)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        image_url = VALUES(image_url),
                        is_transfer = VALUES(is_transfer),
                        x = VALUES(x),
                        y = VALUES(y),
                        wheelchair_accessible = VALUES(wheelchair_accessible),
                        has_shelter = VALUES(has_shelter),
                        has_bench = VALUES(has_bench),
                        has_ticket_machine = VALUES(has_ticket_machine),
                        has_display = VALUES(has_display)
                    `, [
                        row.id, row.name, `/stops/${filename}.png`, row.is_transfer === 'true',
                        row.x, row.y, row.wheelchair_accessible === 'true',
                        row.has_shelter === 'true', row.has_bench === 'true',
                        row.has_ticket_machine === 'true', row.has_display === 'true',
                    ]);
                }
            }
            await seedStops(conn)
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
