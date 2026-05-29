const path = require("path");
const express = require("express");
const cors = require("cors");
const { getDb, MONGODB_DB, COLECCION } = require("../api/lib/mongodb");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.MONGODB_URI) {
  console.error("Falta MONGODB_URI en server/.env");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

let col;
let totalPartidas = 0;

async function conectar() {
  const conexion = await getDb();
  col = conexion.col;
  totalPartidas = await col.countDocuments();
  console.log("MongoDB:", MONGODB_DB + "." + COLECCION, "(" + totalPartidas + " registros)");
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: !!col,
    db: MONGODB_DB,
    coleccion: COLECCION,
    total: totalPartidas
  });
});

app.get("/api/partidas", async (req, res) => {
  try {
    const noche = Number(req.query.noche);
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    if (![1, 2].includes(noche)) {
      return res.status(400).json({ error: "noche debe ser 1 o 2" });
    }

    const lista = await col
      .find({ noche })
      .sort({ puntuacion: -1 })
      .limit(limit)
      .project({ _id: 0, usuario: 1, puntuacion: 1 })
      .toArray();

    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al leer ranking" });
  }
});

function leerBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

app.post("/api/partidas", async (req, res) => {
  try {
    const body = leerBody(req);
    const usuario = String(body.usuario || "").trim();
    const noche = Number(body.noche);
    const puntuacion = Number(body.puntuacion);

    if (usuario.length < 2 || usuario.length > 20) {
      return res.status(400).json({ error: "usuario inválido" });
    }
    if (![1, 2].includes(noche)) {
      return res.status(400).json({ error: "noche debe ser 1 o 2" });
    }
    if (!Number.isFinite(puntuacion) || puntuacion < 0 || puntuacion > 999999) {
      return res.status(400).json({ error: "puntuación inválida" });
    }

    const ultimo = await col.find().sort({ id: -1 }).limit(1).project({ id: 1 }).toArray();
    const siguienteId = ultimo.length && ultimo[0].id ? ultimo[0].id + 1 : 1;

    await col.insertOne({
      id: siguienteId,
      usuario,
      noche,
      puntuacion: Math.floor(puntuacion)
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar partida" });
  }
});

conectar()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Servidor en http://localhost:" + PORT);
      console.log("Abre http://localhost:" + PORT + "/menu.html");
    });
  })
  .catch((err) => {
    console.error("No se pudo conectar a MongoDB:", err.message);
    if (/querySrv|ECONNREFUSED/i.test(err.message)) {
      console.error("");
      console.error("Soluciones:");
      console.error("  1. Reinicia: node server.js (ya usa DNS 8.8.8.8 / 1.1.1.1)");
      console.error("  2. En Atlas → Network Access → añade tu IP o 0.0.0.0/0");
      console.error("  3. En server/.env usa MONGODB_URI_STANDARD (cadena sin +srv desde Atlas)");
    }
    process.exit(1);
  });
