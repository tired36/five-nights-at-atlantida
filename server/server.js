require("./preload-env");

const path = require("path");
const express = require("express");
const cors = require("cors");
const { getMongoUri } = require("../api/lib/mongodb");
const partidasHandler = require("../api/partidas");
const healthHandler = require("../api/health");

const PORT = Number(process.env.PORT) || 3000;

if (!getMongoUri()) {
  console.error("Falta MONGODB_URI.");
  console.error("Copia .env.example a .env (raíz) o server/.env y pon tu cadena de Atlas.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (req, res) => healthHandler(req, res));
app.all("/api/partidas", (req, res) => partidasHandler(req, res));

app.listen(PORT, () => {
  console.log("API local (misma lógica que Vercel):");
  console.log("  Juego:  http://localhost:" + PORT + "/menu.html");
  console.log("  Health: http://localhost:" + PORT + "/api/health");
  console.log("");
  console.log("También puedes abrir el HTML con Live Server; la API seguirá en :3000");
});
