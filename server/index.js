import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const app = express();
const port = Number(process.env.PORT) || 80
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const api = express.Router();

api.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
});

api.get('/teams', async (_req, res) => {
    let rows;
    try {
        [rows] = await pool.query(`
        SELECT t.id AS teamId, t.name AS teamName, m.id AS memberId, m.name AS memberName
        FROM teams t
        LEFT JOIN members m ON m.team_id = t.id
        ORDER BY t.id, m.id`);
    } catch (err) {
        console.error('GET /teams failed:', err.code ?? err);
        return res.status(500).json({ error: 'Database error' });
    }

    const teams = new Map();
    for (const r of rows) {
        if (!teams.has(r.teamId)) {
            teams.set(r.teamId, { id: r.teamId, name: r.teamName, members: [] });
        }
        if (r.memberId) {
            teams.get(r.teamId).members.push({ id: r.memberId, name: r.memberName });
        }
    }
    res.json([...teams.values()]);
});

api.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
app.use(express.static(distDir));
app.use('/api/v1', api);

app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
});

app.listen(port, () => {
    console.log(`Server's listening on port ${port}`)
});

