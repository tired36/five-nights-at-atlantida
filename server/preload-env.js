const path = require("path");

// Raíz primero; server/.env solo sobrescribe si hace falta algo local
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config({ path: path.join(__dirname, ".env") });
