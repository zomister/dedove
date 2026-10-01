import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, initDb } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 80;
const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const api = express.Router();

api.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

api.get("/teams", async (_req, res) => {
  let rows;
  try {
    [rows] = await pool.query(`
        SELECT t.id AS teamId, t.name AS teamName, m.id AS memberId, m.name AS memberName
        FROM teams t
        LEFT JOIN members m ON m.team_id = t.id
        ORDER BY t.id, m.id`);
  } catch (err) {
    console.error("GET /teams failed:", err.code ?? err);
    return res.status(500).json({ error: "Database error" });
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

api.get("/stops", async (_req, res) => {
  let rows;
  try {
    [rows] = await pool.query(`
        SELECT s.id AS id, s.name AS name, s.image_url AS image_url
        FROM stops s
        ORDER BY s.id`);
  } catch (err) {
    console.error("GET /stops failed:", err.code ?? err);
    return res.status(500).json({ error: "Database error" });
  }
  const stops = new Map();
  for (const r of rows) {
    stops.set(r.id, { id: r.id, name: r.name, image_url: r.image_url });
  }
  res.json([...stops.values()]);
});

api.get("/stops/search", async (req, res) => {
  let rows;
  try {
    [rows] = await pool.query(`
       SELECT s.id AS id, s.name AS name, s.image_url AS image_url, s.is_transfer AS is_transfer,
        s.x AS x, s.y AS y, s.wheelchair_accessible AS wheelchair_accessible, s.has_shelter AS has_shelter,
        s.has_bench AS has_bench, s.has_ticket_machine AS has_ticket_machine, s.has_display AS has_display
        FROM stops s`);
  } catch (err) {
    console.error("GET /stops failed:", err.code ?? err);
    return res.status(500).json({ error: "Database error" });
  }
  const stops = new Map();
  for (const r of rows) {
    stops.set(r.id, { id: r.id, name: r.name, image_url: r.image_url, is_transfer: r.is_transfer, x: r.x, y: r.y, wheelchair_accessible: r.wheelchair_accessible, has_shelter: r.has_shelter, has_bench: r.has_bench, has_ticket_machine: r.has_ticket_machine, has_display: r.has_display });
  }
  res.json([...stops.values()]);
});

api.get("/stops/:stopId", async (req, res) => {
  const stopId = Number(req.params.stopId);
  let rows;
  try {
    [rows] = await pool.query(
      `
        SELECT s.id AS id, s.name AS name, s.image_url AS image_url, s.is_transfer AS is_transfer,
        s.x AS x, s.y AS y, s.wheelchair_accessible AS wheelchair_accessible, s.has_shelter AS has_shelter,
        s.has_bench AS has_bench, s.has_ticket_machine AS has_ticket_machine, s.has_display AS has_display
        FROM stops s
        WHERE s.id = ?`,
      [stopId],
    );
  } catch (err) {
    console.error(`GET /stops/${stopId} failed:`, err.code ?? err);
    return res.status(500).json({ error: "Database error" });
  }
  const stop = rows[0];
  if (!stop) return res.status(404).json({ error: "Not Found" });
  res.json(stop);
});


api.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});
app.use(express.static(distDir));
app.use("/api/v1", api);

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Server's listening on port ${port}`);
});

initDb();
