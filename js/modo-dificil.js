(function () {
  function esActivo() {
    return window.FnatSesion && FnatSesion.esDificil();
  }

  function mostrarAvisoInicial() {
    var prev = document.getElementById("aviso-modo-dificil");
    if (prev) prev.remove();

    var aviso = document.createElement("div");
    aviso.id = "aviso-modo-dificil";
    aviso.innerHTML =
      "<strong>MODO DIFÍCIL</strong><br>" +
      "Sin cámaras. Guíate por los sonidos y los parpadeos de la luz en la oficina.<br>" +
      "<span class='md-sub'>Casi imposible de ganar. Mucha suerte.</span>";
    document.body.appendChild(aviso);

    setTimeout(function () {
      aviso.classList.add("md-fade");
      setTimeout(function () {
        if (aviso.parentNode) aviso.remove();
      }, 2000);
    }, 9000);
  }

  function inyectarEstilos() {
    if (document.getElementById("estilos-modo-dificil")) return;
    var s = document.createElement("style");
    s.id = "estilos-modo-dificil";
    s.textContent =
      "#aviso-modo-dificil{position:fixed;top:50%;left:14px;transform:translateY(-50%);z-index:550;max-width:220px;padding:14px 16px;font-family:monospace;text-align:left;color:#fff;background:rgba(40,0,0,.92);border:2px solid #f00;box-shadow:0 0 20px rgba(255,0,0,.4);text-transform:uppercase;letter-spacing:1px;line-height:1.45;transition:opacity 2s;pointer-events:none}" +
      "#aviso-modo-dificil.md-fade{opacity:0}" +
      "#aviso-modo-dificil .md-sub{display:block;margin-top:12px;color:#f88;font-size:.85rem;text-transform:none;letter-spacing:1px}" +
      "#badge-modo-dificil{flex-shrink:0;padding:5px 10px;font-family:monospace;font-size:10px;line-height:1.3;color:#f55;background:rgba(0,0,0,.85);border:1px solid #a00;letter-spacing:2px;text-transform:uppercase;pointer-events:none;white-space:nowrap}";
    document.head.appendChild(s);
  }

  window.ModoDificil = {
    esActivo: esActivo,

    aplicarSinCamaras: function (cfg) {
      if (!esActivo()) return;
      cfg = cfg || {};
      inyectarEstilos();

      var panel = cfg.panelCamaras;
      var btn = cfg.btnCamaras;
      var textoNoche = cfg.textoNoche;

      if (panel) panel.style.display = "none";
      if (btn) btn.style.display = "none";

      if (textoNoche) {
        textoNoche.textContent = "Noche " + (cfg.noche || "?") + "D";
        textoNoche.style.color = "#ff4444";
      }

      var badge = document.getElementById("badge-modo-dificil");
      if (!badge) {
        badge = document.createElement("div");
        badge.id = "badge-modo-dificil";
        var bar = document.getElementById("rank-bar");
        (bar || document.body).appendChild(badge);
      }
      badge.textContent = (cfg.noche || "?") + "D · SIN CÁMARAS";

      mostrarAvisoInicial();
    },

    pistaMovimiento: function () {
      if (!esActivo()) return;
      var a = document.getElementById("audio-pasos");
      if (a) {
        a.volume = 0.55;
        a.currentTime = 0;
        a.play().catch(function () {});
      }
    }
  };
})();
