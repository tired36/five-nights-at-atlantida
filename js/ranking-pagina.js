function esc(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mostrarError(tablaId, mensaje) {
  document.getElementById(tablaId).innerHTML =
    "<tr><td colspan='3'>" + esc(mensaje) + "</td></tr>";
}

function cargarTabla(nocheId, tablaId) {
  mostrarError(tablaId, "Cargando...");
  RankingApi.top10(nocheId)
    .then((lista) => {
      if (!lista.length) {
        mostrarError(tablaId, "Sin partidas en el top 10");
        return;
      }
      document.getElementById(tablaId).innerHTML = lista.map((fila, i) =>
        "<tr><td>" + (i + 1) + "</td><td>" + esc(fila.usuario) + "</td><td>" + fila.puntuacion + "</td></tr>"
      ).join("");
    })
    .catch((e) => mostrarError(tablaId, e.message || "Error"));
}

const apiBase = (window.API_URL || "").replace(/\/$/, "");
fetch(apiBase + "/api/health")
  .then((r) => r.json())
  .then((h) => {
    const aviso = document.getElementById("aviso");
    if (h.ok && h.total > 0) return;

    aviso.style.display = "block";
    if (!h.configured) {
      aviso.textContent =
        h.error ||
        "Falta MONGODB_URI. Local: copia .env.example a .env y npm run dev. Vercel: Environment Variables.";
    } else if (h.error) {
      aviso.textContent = "MongoDB: " + h.error + " (local: revisa .env y reinicia npm run dev; Atlas: 0.0.0.0/0)";
    } else if (h.total === 0) {
      aviso.textContent = "Conectado a " + h.db + "." + h.coleccion + " pero vacío. Usa MONGODB_DB=FNAA";
    }
  })
  .catch(() => {
    const aviso = document.getElementById("aviso");
    aviso.style.display = "block";
    aviso.textContent =
      "No responde /api/health. Local: ejecuta npm run dev (o dev.bat) y usa http://localhost:3000. Internet: despliega en Vercel con api/.";
  });

cargarTabla(1, "n1");
cargarTabla(2, "n2");
cargarTabla("1D", "d1");
cargarTabla("2D", "d2");

function irA(hash) {
  var el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (location.hash === "#noche2") irA("#t2");
if (location.hash === "#noche1") irA("#t1");
if (location.hash === "#2d" || location.hash === "#dificil-noche2") irA("#t2d");
if (location.hash === "#1d" || location.hash === "#dificil-noche1") irA("#t1d");
if (location.hash === "#dificil") irA("#dificil");
