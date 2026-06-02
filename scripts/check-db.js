/**
 * Comprueba que .env apunta a MongoDB (la misma BD que debe usar Vercel).
 */
require("../server/preload-env");
const { getDb, getMongoUri, getMongoConfig } = require("../api/lib/mongodb");

async function main() {
  const cfg = getMongoConfig();
  const uri = getMongoUri();

  console.log("=== Comprobación base de datos ===\n");

  if (!uri) {
    console.error("Falta MONGODB_URI.");
    console.error("Copia .env.example → .env en la raíz y reinicia npm run dev");
    process.exit(1);
  }

  console.log("URI:        " + (uri.includes("PASSWORD") ? "(ejemplo — pon tu .env real)" : "configurada"));
  console.log("Base:       " + cfg.MONGODB_DB);
  console.log("Colección:  " + cfg.COLECCION);
  console.log("");

  try {
    const { col } = await getDb();
    const total = await col.countDocuments();
    const ultimas = await col
      .find({})
      .sort({ id: -1 })
      .limit(3)
      .project({ _id: 0, usuario: 1, noche: 1, puntuacion: 1 })
      .toArray();

    console.log("Conexión:   OK");
    console.log("Registros:  " + total);
    if (ultimas.length) {
      console.log("\nÚltimas partidas guardadas:");
      ultimas.forEach((p) => {
        console.log("  - " + p.usuario + " | noche " + p.noche + " | " + p.puntuacion + " pts");
      });
    }
    console.log("\nLocal y Vercel comparten esta misma BD si usan las mismas variables.");
    console.log("Health: http://localhost:3000/api/health (con npm run dev)");
  } catch (err) {
    console.error("Error:", err.message);
    console.error("\nRevisa Atlas Network Access (0.0.0.0/0) y la URI en .env");
    process.exit(1);
  }
}

main();
