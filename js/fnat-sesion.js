(function () {
  var KEY = "fnat_modo_dificil";

  function leerUrl() {
    try {
      var p = new URLSearchParams(window.location.search);
      if (p.get("dificil") === "1") sessionStorage.setItem(KEY, "1");
      if (p.get("dificil") === "0") sessionStorage.removeItem(KEY);
    } catch (e) {}
  }

  leerUrl();

  window.FnatSesion = {
    activarDificil: function () {
      sessionStorage.setItem(KEY, "1");
    },
    desactivarDificil: function () {
      sessionStorage.removeItem(KEY);
    },
    esDificil: function () {
      return sessionStorage.getItem(KEY) === "1";
    },
    ir: function (url) {
      if (!url) return;
      if (sessionStorage.getItem(KEY) === "1") {
        var sep = url.indexOf("?") >= 0 ? "&" : "?";
        url = url + sep + "dificil=1";
      }
      window.location.href = url;
    }
  };
})();
