(function () {
  /** Misma dificultad base para noche 1 y 2 (sin cámaras). */
  window.CONFIG_UNIFICADA = {
    probMovimiento: 0.45,
    probMovimiento5AM: 0.7,
    audioRetieneSeg: 18,
    audioRecargaSeg: 28,
    auraAvisoSeg: 8,
    auraDanoSeg: 11,
    auraDanoEnergia: 1,
    golpePuertaEnergia: 6,
    gasto: {
      base: 0.01,
      camaras: 0,
      linterna: 0,
      puerta: 0.75,
      retenido: 0.06
    }
  };

  function aplicarConfigUnificada(configNoche) {
    if (!configNoche) return;
    var u = window.CONFIG_UNIFICADA;
    configNoche.probMovimiento = u.probMovimiento;
    configNoche.probMovimiento5AM = u.probMovimiento5AM;
    configNoche.audioRetieneSeg = u.audioRetieneSeg;
    configNoche.audioRecargaSeg = u.audioRecargaSeg;
    configNoche.auraAvisoSeg = u.auraAvisoSeg;
    configNoche.auraDanoSeg = u.auraDanoSeg;
    configNoche.auraDanoEnergia = u.auraDanoEnergia;
    configNoche.golpePuertaEnergia = u.golpePuertaEnergia;
    configNoche.gasto = Object.assign({}, configNoche.gasto, u.gasto);
  }

  function mostrarAvisoSinCamaras(esDificil) {
    if (!esDificil) return;

    var prev = document.getElementById("aviso-sin-camaras");
    if (prev) prev.remove();

    var aviso = document.createElement("div");
    aviso.id = "aviso-sin-camaras";
    aviso.innerHTML = "<strong>MODO DIFÍCIL</strong>";
    document.body.appendChild(aviso);

    setTimeout(function () {
      aviso.classList.add("sc-fade");
      setTimeout(function () {
        if (aviso.parentNode) aviso.remove();
      }, 2000);
    }, 5000);
  }

  function inyectarEstilos() {
    if (document.getElementById("estilos-sin-camaras")) return;
    var s = document.createElement("style");
    s.id = "estilos-sin-camaras";
    s.textContent =
      "#aviso-sin-camaras{position:fixed;top:50%;left:14px;transform:translateY(-50%);z-index:550;max-width:220px;padding:14px 16px;font-family:monospace;text-align:left;color:#fff;background:rgba(20,0,0,.92);border:2px solid #a55;box-shadow:0 0 16px rgba(255,80,0,.35);letter-spacing:1px;line-height:1.45;transition:opacity 2s;pointer-events:none}" +
      "#aviso-sin-camaras.sc-fade{opacity:0}" +
      "#aviso-sin-camaras .sc-sub{display:block;margin-top:10px;color:#c96;font-size:.8rem;letter-spacing:0}";
    document.head.appendChild(s);
  }

  /** En modo difícil no hay audio de retención: solo puerta y pistas ambientales. */
  function ocultarControlAudio() {
    var btnAudio = document.getElementById("btn-audio");
    var contadorRet =
      document.getElementById("contador-retencion-oficina") ||
      document.getElementById("contador-retencion");
    if (btnAudio) {
      btnAudio.style.display = "none";
      btnAudio.disabled = true;
    }
    if (contadorRet) contadorRet.style.display = "none";
  }

  function restaurarControlAudio() {
    var btnAudio = document.getElementById("btn-audio");
    var contadorRet =
      document.getElementById("contador-retencion-oficina") ||
      document.getElementById("contador-retencion");
    if (btnAudio) {
      btnAudio.style.display = "none";
      btnAudio.disabled = false;
    }
    if (contadorRet) {
      if (contadorRet.id === "contador-retencion-oficina") {
        contadorRet.id = "contador-retencion";
      }
      contadorRet.style.display = "none";
    }
  }

  window.SinCamaras = {
    activo: false,

    aplicarConfig: aplicarConfigUnificada,

    revertir: function () {
      var panel = document.getElementById("camaras");
      var btnCamaras = document.getElementById("btn-camaras");
      restaurarControlAudio();
      if (panel) panel.style.display = "none";
      if (btnCamaras) btnCamaras.style.display = "";
      window.SinCamaras.activo = false;
    },

    aplicar: function (cfg) {
      cfg = cfg || {};

      if (!(window.FnatSesion && FnatSesion.esDificil())) {
        window.SinCamaras.revertir();
        return;
      }

      window.SinCamaras.activo = true;
      inyectarEstilos();

      if (cfg.config) aplicarConfigUnificada(cfg.config);

      var panel = cfg.panelCamaras;
      var btn = cfg.btnCamaras;
      if (panel) panel.style.display = "none";
      if (btn) btn.style.display = "none";

      ocultarControlAudio();
      mostrarAvisoSinCamaras(true);
    },

    pistaMovimiento: function () {
      var a = document.getElementById("audio-pasos");
      if (a) {
        a.volume = 0.55;
        a.currentTime = 0;
        a.play().catch(function () {});
      }
    }
  };
})();
