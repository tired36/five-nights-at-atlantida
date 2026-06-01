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
    .catch(() => mostrarError(tablaId, "No se pudo cargar el ranking"));
}

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
