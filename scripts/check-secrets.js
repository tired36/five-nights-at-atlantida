#!/usr/bin/env node
/**
 * Impide subir credenciales reales a Git.
 * Uso: npm run check-secrets
 *      npm run check-secrets -- --staged   (solo archivos en staging)
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { uriLooksLikeRealSecret, redactSecrets } = require("../api/lib/secrets");

const root = path.join(__dirname, "..");
const stagedOnly = process.argv.includes("--staged");

const SKIP_DIRS = new Set(["node_modules", ".git"]);
const SCAN_EXT = /\.(js|ts|json|html|md|bat|sh|yml|yaml|env|example|txt)$/i;
const ALLOW_TRACKED = new Set([".env.example", "server/.env.example"]);

const URI_RE = /mongodb(\+srv)?:\/\/[^\s"'<>]+/gi;

function listFiles() {
  if (stagedOnly) {
    try {
      const out = execSync("git diff --cached --name-only --diff-filter=ACM", {
        cwd: root,
        encoding: "utf8"
      });
      return out
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => path.join(root, f));
    } catch {
      console.warn("No es un repo git o no hay staging; escaneando archivos rastreados.");
    }
  }
  const tracked = execSync("git ls-files", { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((f) => path.join(root, f));
  return tracked;
}

function shouldScan(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  if (ALLOW_TRACKED.has(rel)) return true;
  if (rel === ".env" || rel.endsWith("/.env") || rel.includes(".env.local")) return true;
  if (!SCAN_EXT.test(rel)) return false;
  return true;
}

function scanFile(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8");
  const hits = [];
  let m;
  URI_RE.lastIndex = 0;
  while ((m = URI_RE.exec(text))) {
    const uri = m[0];
    if (uriLooksLikeRealSecret(uri)) {
      hits.push({ rel, snippet: redactSecrets(uri) });
    }
  }
  if ((rel === ".env" || rel === "server/.env") && uriLooksLikeRealSecret(text)) {
    hits.push({ rel, snippet: "(archivo .env con credenciales — no debe subirse a Git)" });
  }
  return hits;
}

function main() {
  let files;
  try {
    files = listFiles();
  } catch (e) {
    console.error("Ejecuta desde la raíz del repo git:", e.message);
    process.exit(1);
  }

  const allHits = [];
  if (stagedOnly) {
    for (const file of files) {
      const rel = path.relative(root, file).replace(/\\/g, "/");
      if (rel === ".env" || rel === "server/.env") {
        allHits.push({
          rel,
          snippet: "El archivo .env no debe commitearse. Usa: git reset HEAD " + rel
        });
      }
    }
  }

  for (const file of files) {
    if (!shouldScan(file)) continue;
    const parts = file.split(path.sep);
    if (parts.some((p) => SKIP_DIRS.has(p))) continue;
    allHits.push(...scanFile(file));
  }

  if (allHits.length) {
    console.error("\n⚠️  Posibles SECRETOS detectados (no hagas commit/push):\n");
    allHits.forEach((h) => {
      console.error("  • " + h.rel);
      if (h.snippet) console.error("    " + h.snippet);
    });
    console.error(
      "\nQuita la contraseña del archivo, usa solo .env (ignorado por Git) o variables en Vercel."
    );
    console.error("Ver SECURITY.md\n");
    process.exit(1);
  }

  console.log(
    stagedOnly
      ? "OK: ningún secreto en archivos preparados para commit."
      : "OK: ningún secreto en archivos rastreados por Git."
  );
}

main();
