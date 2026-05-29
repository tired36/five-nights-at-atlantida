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

function cargarTabla(noche, tablaId) {
  mostrarError(tablaId, "Cargando...");
  RankingApi.top10(noche)
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
      aviso.textContent = h.error || "En Vercel: Settings → Environment Variables → MONGODB_URI, MONGODB_DB, MONGODB_COLLECTION → Redeploy";
    } else if (h.error) {
      aviso.textContent = "MongoDB: " + h.error + " (¿Atlas Network Access 0.0.0.0/0?)";
    } else if (h.total === 0) {
      aviso.textContent = "Conectado a " + h.db + "." + h.coleccion + " pero vacío. Usa MONGODB_DB=FNAA";
    }
  })
  .catch(() => {
    const aviso = document.getElementById("aviso");
    aviso.style.display = "block";
    aviso.textContent = "No responde /api/health. ¿Desplegado en Vercel con la carpeta api/?";
  });

cargarTabla(1, "n1");
cargarTabla(2, "n2");

if (location.hash === "#noche2") document.getElementById("t2").scrollIntoView();
if (location.hash === "#noche1") document.getElementById("t1").scrollIntoView();
