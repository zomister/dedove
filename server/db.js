import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'dedove',
    password: process.env.DB_PASSWORD || 'dedove',
    database: process.env.DB_NAME || 'dedove',
    charset: 'utf8mb4',
    connectionLimit: 10,
});