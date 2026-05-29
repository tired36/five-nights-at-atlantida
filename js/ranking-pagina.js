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
        mostrarError(tablaId, "Sin datos (¿servidor en marcha con node server.js?)");
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
    if (!h.ok || !h.total) {
      const aviso = document.getElementById("aviso");
      aviso.style.display = "block";
      aviso.textContent = "API sin datos. Revisa variables MONGODB_* en Vercel o ejecuta node server.js en local.";
    }
  })
  .catch(() => {
    const aviso = document.getElementById("aviso");
    aviso.style.display = "block";
    aviso.textContent = "No hay conexión con la API. En local: node server.js. En internet: despliega en Vercel con MONGODB_URI.";
  });

cargarTabla(1, "n1");
cargarTabla(2, "n2");

if (location.hash === "#noche2") document.getElementById("t2").scrollIntoView();
if (location.hash === "#noche1") document.getElementById("t1").scrollIntoView();
