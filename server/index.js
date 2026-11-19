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
api.use(express.json());

const ALLOWED_FIELDS = new Set([
  "name", "image_url", "wheelchair_accessible", "has_shelter", "has_ticket_machine",
]);

function isValid(value){
  try{
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch{
    return false;
  }
}


function toStop(row){
  return {
    id: row.id,
    name: row.name,
    image_url: row.image_url,
    wheelchair_accessible: Boolean(row.wheelchair_accessible),
    has_shelter: Boolean(row.has_shelter),
    has_ticket_machine: Boolean(row.has_ticket_machine),
  };
}

function validateStopInput(body){
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return "Request body must be a JSON obj";

  const extra = Object.keys(body).filter((k) => !ALLOWED_FIELDS.has(k));
  if (extra.length) return `Unknown field: ${extra.join(", ")}`;
  
  if (typeof body.name !== "string" || body.name.trim() === ""){
    return "name must be a non-empty string";
  }
  
  if (body.name.length > 255) return "name mustn't be longer than 255 chars";
  
  for (const f of ["wheelchair_accessible", "has_shelter", "has_ticket_machine"]){
    if (typeof body[f] !== "boolean") return `${f} must be a boolean`;
  }
  
  if (body.image_url !== undefined && body.image_url !== null){
    if (typeof body.image_url !== "string") return "image_url must be a string or null";
    if (body.image_url.length > 255) return "image_url must be 255 chars maximum";
    if(!isValid(body.image_url)) return "image_url must be a valid URL";
  }
  return null;
}

function parseStopId(raw){
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id >= 1 ? id : null;
}


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
        SELECT s.id AS id, s.name AS name, s.image_url AS image_url, s.wheelchair_accessible AS wheelchair_accessible, s.has_shelter AS has_shelter, s.has_ticket_machine AS has_ticket_machine
        FROM stops s
        ORDER BY s.id`);
  } catch (err) {
    console.error("GET /stops failed:", err.code ?? err);
    return res.status(500).json({ error: "Database error" });
  }
  res.json(rows.map(toStop));
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
  const stopId = parseStopId(req.params.stopId);
  if (stopId === null) return res.status(400).json({ error: "Invalid stop ID" });
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
  if (!stop) return res.status(404).json({ error: "Stop not Found" });
  res.json({
    ...toStop(stop),
    is_transfer: Boolean(stop.is_transfer),
    x: stop.x === null ? null : Number(stop.x),
    y: stop.y === null ? null : Number(stop.y),
    has_bench: Boolean(stop.has_bench),
    has_display: Boolean(stop.has_display),
  });
});

api.post("/stops", async (req, res) => {
  const error = validateStopInput(req.body);
  if (error) return res.status(400).json({ error });

  const { name, wheelchair_accessible, has_shelter, has_ticket_machine } = req.body;
  const image_url = req.body.image_url ?? null;

  let result;
  try {
    [result] = await pool.query(
      `INSERT INTO stops (name, image_url, wheelchair_accessible, has_shelter, has_ticket_machine) VALUES (?, ?, ?, ?, ?)`,
      [name , image_url, wheelchair_accessible, has_shelter, has_ticket_machine],
    );
  } catch (err){
    console.error("POST /stops failed: ", err.code ?? err);
    return res.status(500).json({ error: "Database error" });
  }

  res.status(201).json({
    id: result.insertId,
    name,
    image_url,
    wheelchair_accessible,
    has_shelter,
    has_ticket_machine,
  });
});

api.put("/stops/:stopId", async (req, res) => {
  const stopId = parseStopId(req.params.stopId);
  if (stopId === null) return res.status(400).json({ error: "Invalid stop ID" });
  const error = validateStopInput(req.body);
  if (error) return res.status(400).json({ error });

  const { name, wheelchair_accessible, has_shelter, has_ticket_machine } = req.body;
  const image_url = req.body.image_url ?? null;

  let result;
  try {
    [result] = await pool.query(
      `UPDATE stops SET name = ?, image_url = ?, wheelchair_accessible = ?, has_shelter = ?, has_ticket_machine = ? WHERE id = ?`,
      [name , image_url, wheelchair_accessible, has_shelter, has_ticket_machine, stopId],
    );
  } catch (err){
    console.error("PUT /stops failed: ", err.code ?? err);
    return res.status(500).json({ error: "Database error" });
  }
  if(result.affectedRows === 0) return res.status(404).json({ error: "Stop not Found" });

  res.json({
    id: stopId,
    name,
    image_url,
    wheelchair_accessible,
    has_shelter,
    has_ticket_machine,
  });
});

api.delete("/stops/:stopId", async (req, res) =>{
  const stopId = parseStopId(req.params.stopId);
  if (stopId === null) return res.status(400).json({ error: "Invalid stop ID" });


  let result;
  try {
    [result] = await pool.query(
      `DELETE FROM stops WHERE id = ?`,
      [stopId],
    );
  } catch (err){
    console.error("DELETE /stops failed: ", err.code ?? err);
    return res.status(500).json({ error: "Database error" });
  }
  if(result.affectedRows === 0) return res.status(404).json({ error: "Stop not Found" });

  res.status(204).end();
});

api.use((err, _req, res, _next) => {
  if(err.type === "entity.parse.failed") return res.status(400).json({ error:"Invalid JSON"});
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.status ? err.message : "Internal server error" });
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
