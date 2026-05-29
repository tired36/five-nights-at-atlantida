const dns = require("dns");
const { MongoClient } = require("mongodb");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const URI = process.env.MONGODB_URI_STANDARD || process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "FNAA";
const COLECCION = process.env.MONGODB_COLLECTION || "usuarios";

let cache = global._fnatMongo;
if (!cache) {
  cache = global._fnatMongo = { client: null, promise: null };
}

async function getDb() {
  if (!URI) throw new Error("Falta MONGODB_URI");

  if (!cache.promise) {
    const client = new MongoClient(URI);
    cache.promise = client.connect().then((c) => {
      cache.client = c;
      return c;
    });
  }

  await cache.promise;
  const db = cache.client.db(MONGODB_DB);
  return { db, col: db.collection(COLECCION) };
}

module.exports = { getDb, MONGODB_DB, COLECCION };
