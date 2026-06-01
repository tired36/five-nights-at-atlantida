const { getDb } = require("./lib/mongodb");

function leerBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

/** 1, 2, 1D, 2D (también acepta noche 1 + modo dificil por compatibilidad) */
function parseNoche(raw, modoOpcional) {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (s === "1D") return { id: "1D", base: 1, dificil: true };
  if (s === "2D") return { id: "2D", base: 2, dificil: true };

  const n = Number(s);
  if (n === 1 || n === 2) {
    const modo =
      modoOpcional === "dificil" || modoOpcional === true ? "dificil" : "normal";
    if (modo === "dificil") return { id: n + "D", base: n, dificil: true };
    return { id: n, base: n, dificil: false };
  }
  return null;
}

function filtroBusqueda(parsed) {
  if (parsed.dificil) {
    return {
      $or: [{ noche: parsed.id }, { noche: parsed.base, modo: "dificil" }]
    };
  }
  return {
    noche: parsed.base,
    $or: [{ modo: { $exists: false } }, { modo: "normal" }]
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { col } = await getDb();

    if (req.method === "GET") {
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const parsed = parseNoche(req.query.noche, req.query.modo);

      if (!parsed) {
        return res.status(400).json({ error: "noche debe ser 1, 2, 1D o 2D" });
      }

      const lista = await col
        .find(filtroBusqueda(parsed))
        .sort({ puntuacion: -1 })
        .limit(limit)
        .project({ _id: 0, usuario: 1, puntuacion: 1 })
        .toArray();

      return res.status(200).json(lista);
    }

    if (req.method === "POST") {
      const body = leerBody(req);
      const usuario = String(body.usuario || "").trim();
      const puntuacion = Number(body.puntuacion);
      const parsed = parseNoche(body.noche, body.modo);

      if (usuario.length < 2 || usuario.length > 20) {
        return res.status(400).json({ error: "usuario inválido" });
      }
      if (!parsed) {
        return res.status(400).json({ error: "noche debe ser 1, 2, 1D o 2D" });
      }
      if (!Number.isFinite(puntuacion) || puntuacion < 0 || puntuacion > 999999) {
        return res.status(400).json({ error: "puntuación inválida" });
      }

      const ultimo = await col.find().sort({ id: -1 }).limit(1).project({ id: 1 }).toArray();
      const siguienteId = ultimo.length && ultimo[0].id ? ultimo[0].id + 1 : 1;

      await col.insertOne({
        id: siguienteId,
        usuario,
        noche: parsed.id,
        puntuacion: Math.floor(puntuacion)
      });

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Error del servidor" });
  }
};
