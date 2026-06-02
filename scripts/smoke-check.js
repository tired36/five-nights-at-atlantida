#!/usr/bin/env node
/**
 * Comprobaciones rápidas de humo (sin navegador).
 * Uso: node scripts/smoke-check.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
let errors = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  errors++;
}

function ok(msg) {
  console.log("OK:", msg);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function idsInHtml(htmlPath) {
  const text = read(htmlPath);
  const ids = new Set();
  const re = /\bid\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(text))) ids.add(m[1]);
  return ids;
}

function idsReferencedInJs(jsPath) {
  const text = read(jsPath);
  const ids = new Set();
  const re = /getElementById\s*\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(text))) ids.add(m[1]);
  return ids;
}

/** IDs opcionales (el JS usa fallback con || a otro elemento). */
const OPTIONAL_DOM_IDS = new Set(["contador-retencion-oficina"]);

function checkDomIds(jsFile, htmlFile) {
  const htmlIds = idsInHtml(htmlFile);
  const jsIds = idsReferencedInJs(jsFile);
  const missing = [...jsIds].filter(
    (id) => !OPTIONAL_DOM_IDS.has(id) && !htmlIds.has(id)
  );
  if (missing.length) {
    fail(
      htmlFile +
        " no define IDs usados en " +
        jsFile +
        ": " +
        missing.sort().join(", ")
    );
  } else {
    ok(jsFile + " ↔ " + htmlFile + " (" + jsIds.size + " IDs)");
  }
}

checkDomIds("js/noche1.js", "juego_noche1.html");
checkDomIds("js/noche2.js", "juego_noche2.html");

const sinCamaras = read("js/sin-camaras.js");
if (!/FnatSesion\.esDificil\(\)/.test(sinCamaras)) {
  fail("sin-camaras.js debe comprobar FnatSesion.esDificil() en aplicar()");
} else {
  ok("SinCamaras.aplicar exige modo difícil");
}

for (const js of ["js/noche1.js", "js/noche2.js"]) {
  const t = read(js);
  if (!/function sinCamarasActivo/.test(t) || !/FnatSesion\.esDificil\(\)/.test(t)) {
    fail(js + " debe exigir FnatSesion.esDificil() en sinCamarasActivo()");
  } else {
    ok(js + " sinCamarasActivo con gate de dificultad");
  }
  if (!/gasto \+= g\.camaras/.test(t) || !/gasto \+= g\.linterna/.test(t)) {
    fail(js + " debe sumar gasto por cámaras y linterna");
  }
}

const intro1 = read("video_intro.html");
if (intro1.includes("PERIODICO_FNFA.mp4.mov")) {
  fail("video_intro.html usa ruta incorrecta PERIODICO_FNFA.mp4.mov");
} else if (!intro1.includes("PERIODICO_FNFA.mp4")) {
  fail("video_intro.html debe referenciar PERIODICO_FNFA.mp4");
} else {
  ok("video_intro periodico .mp4");
}

const intro2 = read("video_intro_noche2.html");
if (!/noche2_lore\.html/.test(intro2)) {
  fail("video_intro_noche2 debe enlazar a noche2_lore.html");
} else {
  ok("flujo noche 2: intro → lore");
}

const flows = [
  ["video_intro.html", "noche1_lore.html"],
  ["noche1_lore.html", "normas_noche1.html"],
  ["normas_noche1.html", "juego_noche1.html"],
  ["video_intro_noche2.html", "noche2_lore.html"],
  ["noche2_lore.html", "normas_noche2.html"],
  ["normas_noche2.html", "juego_noche2.html"]
];

for (const [from, to] of flows) {
  const t = read(from);
  if (!t.includes(to)) {
    fail("Flujo roto: " + from + " no enlaza a " + to);
  }
}
ok("cadena intro → lore → normas → juego (noches 1 y 2)");

const menu = read("menu.html");
if (/Logros\.initEsquina/.test(menu)) {
  fail("menu.html no debe llamar Logros.initEsquina()");
} else {
  ok("menú sin chips de logros en esquina");
}

if (!/renderLista\s*\(\s*["']logros-lista["']/.test(menu) || !menu.includes("logro-detalle")) {
  fail("menu.html debe tener panel logro-detalle y renderLista");
} else {
  ok("panel logros interactivo en menú");
}

const logros = read("js/logros.js");
for (const id of [
  "noche1D",
  "noche2D",
  "comoConseguir",
  "mostrarDetalle",
  "coleccionista",
  "eventoPartida",
  "alVictoria"
]) {
  if (!logros.includes(id)) fail("logros.js falta: " + id);
}
if (!errors) ok("logros.js con 1D/2D y detalle");

const ranking = read("js/ranking.js");
if (!/desbloquear\("noche1D"\)/.test(ranking) || !/desbloquear\("noche2D"\)/.test(ranking)) {
  fail("ranking.js debe desbloquear noche1D y noche2D en victoria difícil");
} else {
  ok("desbloqueo logros modo difícil en ranking");
}

const readme = read("README.md");
if (/botón de la cámara.*rojo/i.test(readme)) {
  fail("README no debe prometer botón CAM en rojo");
} else {
  ok("README sin pista CAM roja");
}

if (errors) {
  console.error("\n" + errors + " error(es).");
  process.exit(1);
}
console.log("\nSmoke check completado sin errores.");
