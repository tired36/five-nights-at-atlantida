(function () {
  function esActivo() {
    return window.FnatSesion && FnatSesion.esDificil();
  }

  window.ModoDificil = {
    esActivo: esActivo,

    aplicarExtras: function (cfg) {
      if (!esActivo()) return;
      cfg = cfg || {};
      var textoNoche = cfg.textoNoche;
      if (textoNoche) {
        textoNoche.textContent = "Noche " + (cfg.noche || "?") + "D";
        textoNoche.style.color = "#ff4444";
      }
    }
  };
})();
