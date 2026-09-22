import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 80
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const api = express.Router();

api.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
});

api.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use(express.static(distDir));

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
});

app.listen(port, () => {
    console.log(`Server's listening on port ${port}`)
});

