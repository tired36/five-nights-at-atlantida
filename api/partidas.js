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

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { col } = await getDb();

    if (req.method === "GET") {
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

      return res.status(200).json(lista);
    }

    if (req.method === "POST") {
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

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Error del servidor" });
  }
};
