#!/usr/bin/env node
/**
 * Comprueba que los src de assets en HTML/JS existen en disco.
 * Uso: node scripts/verify-assets.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const exts = /\.(html|js)$/i;
const srcRe = /(?:src|href)\s*=\s*["'](assets\/[^"']+)["']/gi;
const urlRe = /url\s*\(\s*['"]?(assets\/[^'")\s]+)['"]?\s*\)/gi;
const strRe = /["'](assets\/(?:musica|videos|imagenes)[^"']+)["']/gi;

const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (exts.test(name)) files.push(p);
  }
}
walk(root);

const missing = new Set();
const checked = new Set();

function checkAsset(rel) {
  if (!rel || checked.has(rel)) return;
  checked.add(rel);
  const full = path.join(root, rel.split("?")[0].split("#")[0]);
  if (!fs.existsSync(full)) missing.add(rel);
}

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  while ((m = srcRe.exec(text))) checkAsset(m[1]);
  while ((m = urlRe.exec(text))) checkAsset(m[1]);
  while ((m = strRe.exec(text))) checkAsset(m[1]);
}

if (missing.size) {
  console.error("Assets no encontrados (" + missing.size + "):");
  [...missing].sort().forEach((a) => console.error("  -", a));
  process.exit(1);
}
console.log("OK: " + checked.size + " rutas assets verificadas.");
