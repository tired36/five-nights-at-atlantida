const dns = require("dns");
const { MongoClient } = require("mongodb");
const { safeLogError } = require("./secrets");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

let cache = global._fnatMongo;
if (!cache) {
  cache = global._fnatMongo = { client: null, promise: null };
}

function getMongoUri() {
  return process.env.MONGODB_URI_STANDARD || process.env.MONGODB_URI;
}

function getMongoConfig() {
  return {
    MONGODB_DB: process.env.MONGODB_DB || "FNAA",
    COLECCION: process.env.MONGODB_COLLECTION || "usuarios"
  };
}

async function getDb() {
  const URI = getMongoUri();
  if (!URI) throw new Error("Falta MONGODB_URI");

  if (!cache.promise) {
    const client = new MongoClient(URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    cache.promise = client.connect().then((c) => {
      cache.client = c;
      return c;
    }).catch((err) => {
      cache.promise = null;
      safeLogError("[mongodb] conexión fallida:", err);
      throw new Error("No se pudo conectar a la base de datos");
    });
  }

  await cache.promise;
  const { MONGODB_DB, COLECCION } = getMongoConfig();
  const db = cache.client.db(MONGODB_DB);
  return { db, col: db.collection(COLECCION) };
}

const { MONGODB_DB, COLECCION } = getMongoConfig();

module.exports = { getDb, getMongoUri, getMongoConfig, MONGODB_DB, COLECCION };
