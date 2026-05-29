const { getDb, MONGODB_DB, COLECCION } = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { col } = await getDb();
    const total = await col.countDocuments();
    return res.status(200).json({ ok: true, db: MONGODB_DB, coleccion: COLECCION, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
