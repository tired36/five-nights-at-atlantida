const { getDb, getMongoUri, getMongoConfig } = require("./lib/mongodb");
const { aplicarCors } = require("./lib/cors");
const { safeErrorForClient, safeLogError } = require("./lib/secrets");

module.exports = async function handler(req, res) {
  aplicarCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { MONGODB_DB, COLECCION } = getMongoConfig();

  if (!getMongoUri()) {
    const enLocal =
      req.headers.host && /localhost|127\.0\.0\.1/.test(req.headers.host);
    return res.status(200).json({
      ok: false,
      configured: false,
      db: MONGODB_DB,
      coleccion: COLECCION,
      total: 0,
      error: enLocal
        ? "Falta MONGODB_URI en .env (raíz o server/.env). Copia .env.example y reinicia npm run dev."
        : "Falta MONGODB_URI en Vercel → Settings → Environment Variables"
    });
  }

  try {
    const { col } = await getDb();
    const total = await col.countDocuments();
    const host = (req.headers.host || "").toLowerCase();
    const origen = /localhost|127\.0\.0\.1/.test(host)
      ? "local"
      : host.includes("vercel.app")
        ? "vercel"
        : "produccion";
    return res.status(200).json({
      ok: true,
      configured: true,
      origen,
      db: MONGODB_DB,
      coleccion: COLECCION,
      total,
      mensaje:
        "Misma BD Atlas en local y Vercel si MONGODB_URI, MONGODB_DB y MONGODB_COLLECTION coinciden."
    });
  } catch (err) {
    safeLogError("[health]", err);
    return res.status(200).json({
      ok: false,
      configured: true,
      db: MONGODB_DB,
      coleccion: COLECCION,
      total: 0,
      error: safeErrorForClient(err)
    });
  }
};
