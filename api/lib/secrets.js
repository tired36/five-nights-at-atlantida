/**
 * Evita filtrar contraseñas de MongoDB en logs, respuestas HTTP o errores.
 * Las credenciales solo deben vivir en variables de entorno (.env / Vercel), nunca en el repo.
 */

const PLACEHOLDER_USER = /^(USUARIO|usuario|user|YOUR_USER|<user>|xxx|\*)$/i;
const PLACEHOLDER_PASS = /^(PASSWORD|password|contraseña|YOUR_PASSWORD|<password>|xxx|\*)$/i;

/** Oculta usuario/contraseña en URIs y cadenas similares */
function redactSecrets(text) {
  if (text == null) return "";
  const s = String(text);
  return s
    .replace(/mongodb(\+srv)?:\/\/[^@\s"'<>]+@/gi, "mongodb$1://***:***@")
    .replace(/(password|passwd|pwd|pass)=([^&\s"'<>]+)/gi, "$1=***");
}

/** true si la URI parece contener credenciales reales (no placeholders de .env.example) */
function uriLooksLikeRealSecret(uri) {
  if (!uri || typeof uri !== "string") return false;
  const m = uri.match(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/i);
  if (!m) return false;
  const user = decodeURIComponent(m[2]);
  const pass = decodeURIComponent(m[3]);
  if (PLACEHOLDER_USER.test(user) && PLACEHOLDER_PASS.test(pass)) return false;
  if (user === "USUARIO" && pass === "PASSWORD") return false;
  return pass.length >= 3;
}

/** Mensaje seguro para el cliente (nunca incluye URI ni detalles de auth) */
function safeErrorForClient(err) {
  const raw = err && err.message ? String(err.message) : "Error del servidor";
  const lower = raw.toLowerCase();
  if (
    lower.includes("mongodb") ||
    lower.includes("authentication") ||
    lower.includes("bad auth") ||
    lower.includes("password") ||
    lower.includes("credential") ||
    lower.includes("not authorized") ||
    lower.includes("ssl") ||
    lower.includes("econnrefused") ||
    lower.includes("enotfound") ||
    lower.includes("server selection")
  ) {
    return "Error de conexión con la base de datos. Contacta al administrador.";
  }
  const redacted = redactSecrets(raw);
  if (redacted !== raw) {
    return "Error del servidor.";
  }
  return redacted.length > 120 ? redacted.slice(0, 120) + "…" : redacted;
}

/** Para console.error en servidor: quita contraseñas antes de imprimir */
function safeLogError(prefix, err) {
  const msg = err && err.stack ? err.stack : err && err.message ? err.message : String(err);
  const line = prefix ? prefix + " " + redactSecrets(msg) : redactSecrets(msg);
  console.error(line);
}

module.exports = {
  redactSecrets,
  uriLooksLikeRealSecret,
  safeErrorForClient,
  safeLogError
};
