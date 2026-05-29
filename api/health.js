const { getDb, MONGODB_DB, COLECCION } = require("./lib/mongodb");

module.exports = async function handler(req, res) {
  if (!process.env.MONGODB_URI) {
    return res.status(200).json({
      ok: false,
      configured: false,
      db: MONGODB_DB,
      coleccion: COLECCION,
      total: 0,
      error: "Falta MONGODB_URI en Vercel → Settings → Environment Variables"
    });
  }

  try {
    const { col } = await getDb();
    const total = await col.countDocuments();
    return res.status(200).json({
      ok: true,
      configured: true,
      db: MONGODB_DB,
      coleccion: COLECCION,
      total
    });
  } catch (err) {
    console.error(err);
    return res.status(200).json({
      ok: false,
      configured: true,
      db: MONGODB_DB,
      coleccion: COLECCION,
      total: 0,
      error: err.message
    });
  }
};
