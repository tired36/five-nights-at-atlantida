/**
 * Prueba ranking modo difícil (1D / 2D) vs normal (1 / 2).
 * Uso: node scripts/test-ranking-dificil.js [baseUrl]
 */
require("../server/preload-env");

const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

async function api(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(BASE + path, opts);
  const text = await r.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { ok: r.ok, status: r.status, data };
}

function ok(msg) {
  console.log("  OK  " + msg);
}
function fail(msg) {
  console.log("  FAIL " + msg);
  process.exitCode = 1;
}

(async () => {
  console.log("=== Prueba ranking difícil ===");
  console.log("API:", BASE);

  const health = await api("GET", "/api/health");
  if (!health.ok || !health.data.ok) {
    fail("Health: " + JSON.stringify(health.data));
    return;
  }
  ok("MongoDB conectado (" + health.data.total + " registros)");

  const stamp = Date.now().toString(36);
  const u1d = "test1d_" + stamp;
  const u2d = "test2d_" + stamp;
  const u1 = "test1_" + stamp;

  const post1d = await api("POST", "/api/partidas", {
    usuario: u1d,
    noche: "1D",
    puntuacion: 1111
  });
  if (!post1d.ok) fail("POST 1D: " + JSON.stringify(post1d.data));
  else ok("POST Noche 1D → " + u1d + " (1111 pts)");

  const post2d = await api("POST", "/api/partidas", {
    usuario: u2d,
    noche: "2D",
    puntuacion: 2222
  });
  if (!post2d.ok) fail("POST 2D: " + JSON.stringify(post2d.data));
  else ok("POST Noche 2D → " + u2d + " (2222 pts)");

  const post1 = await api("POST", "/api/partidas", {
    usuario: u1,
    noche: 1,
    puntuacion: 333
  });
  if (!post1.ok) fail("POST 1: " + JSON.stringify(post1d.data));
  else ok("POST Noche 1 normal → " + u1 + " (333 pts)");

  const get1d = await api("GET", "/api/partidas?noche=1D&limit=50");
  const get2d = await api("GET", "/api/partidas?noche=2D&limit=50");
  const get1 = await api("GET", "/api/partidas?noche=1&limit=50");

  if (!get1d.ok) fail("GET 1D: " + JSON.stringify(get1d.data));
  if (!get2d.ok) fail("GET 2D: " + JSON.stringify(get2d.data));
  if (!get1.ok) fail("GET 1: " + JSON.stringify(get1.data));

  const en1d = (get1d.data || []).find((r) => r.usuario === u1d);
  const en2d = (get2d.data || []).find((r) => r.usuario === u2d);
  const en1 = (get1.data || []).find((r) => r.usuario === u1);
  const filtra1dEnNormal = (get1.data || []).find((r) => r.usuario === u1d);

  if (en1d && en1d.puntuacion === 1111) ok("GET 1D contiene " + u1d);
  else fail("GET 1D no devolvió la partida de prueba");

  if (en2d && en2d.puntuacion === 2222) ok("GET 2D contiene " + u2d);
  else fail("GET 2D no devolvió la partida de prueba");

  if (en1 && en1.puntuacion === 333) ok("GET 1 normal contiene " + u1);
  else fail("GET 1 no devolvió la partida normal");

  if (!filtra1dEnNormal) ok("Ranking normal (noche 1) NO incluye partidas 1D");
  else fail("Mezcla: usuario 1D aparece en ranking noche 1");

  console.log("\n=== Resumen ===");
  console.log("Top 3 Noche 1D:", (get1d.data || []).slice(0, 3));
  console.log("Top 3 Noche 2D:", (get2d.data || []).slice(0, 3));
  if (process.exitCode) console.log("\nHay errores.");
  else console.log("\nTodo correcto. Abre " + BASE + "/ranking.html#1d");
})();
