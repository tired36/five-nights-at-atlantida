// Lógica de ranking.html
function mostrarError(tablaId, mensaje) {
  document.getElementById(tablaId).innerHTML =
    "<tr><td colspan='3'>" + mensaje + "</td></tr>";
}

function cargarTabla(noche, tablaId) {
  SupabaseRank.top10(noche)
    .then((lista) => {
      if (!lista.length) {
        mostrarError(tablaId, "Sin datos");
        return;
      }
      document.getElementById(tablaId).innerHTML = lista.map((fila, i) =>
        "<tr><td>" + (i + 1) + "</td><td>" + fila.usuario + "</td><td>" + fila.puntuacion + "</td></tr>"
      ).join("");
    })
    .catch((e) => mostrarError(tablaId, e.message || "Error"));
}

cargarTabla(1, "n1");
cargarTabla(2, "n2");

if (location.hash === "#noche2") document.getElementById("t2").scrollIntoView();
if (location.hash === "#noche1") document.getElementById("t1").scrollIntoView();
