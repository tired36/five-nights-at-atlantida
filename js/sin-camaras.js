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
    var prev = document.getElementById("aviso-sin-camaras");
    if (prev) prev.remove();

    var aviso = document.createElement("div");
    aviso.id = "aviso-sin-camaras";
    if (esDificil) {
      aviso.innerHTML =
        "<strong>MODO DIFÍCIL</strong><br>" +
        "Sin cámaras. Sonidos y parpadeos en la oficina.<br>" +
        "<span class='sc-sub'>Casi imposible. Mucha suerte.</span>";
    } else {
      aviso.innerHTML =
        "<strong>SIN CÁMARAS</strong><br>" +
        "Noche 1 y 2 iguales: guíate por sonidos y luces en la oficina.<br>" +
        "<span class='sc-sub'>Puerta y audio son tu defensa.</span>";
    }
    document.body.appendChild(aviso);

    setTimeout(function () {
      aviso.classList.add("sc-fade");
      setTimeout(function () {
        if (aviso.parentNode) aviso.remove();
      }, 2000);
    }, esDificil ? 9000 : 7000);
  }

  function inyectarEstilos() {
    if (document.getElementById("estilos-sin-camaras")) return;
    var s = document.createElement("style");
    s.id = "estilos-sin-camaras";
    s.textContent =
      "#aviso-sin-camaras{position:fixed;top:50%;left:14px;transform:translateY(-50%);z-index:550;max-width:220px;padding:14px 16px;font-family:monospace;text-align:left;color:#fff;background:rgba(20,0,0,.92);border:2px solid #a55;box-shadow:0 0 16px rgba(255,80,0,.35);letter-spacing:1px;line-height:1.45;transition:opacity 2s;pointer-events:none}" +
      "#aviso-sin-camaras.sc-fade{opacity:0}" +
      "#aviso-sin-camaras .sc-sub{display:block;margin-top:10px;color:#c96;font-size:.8rem;letter-spacing:0}" +
      "#ui-botones #btn-audio{display:block!important;position:static;width:auto;max-width:280px;flex:1;min-width:140px;background:rgba(0,60,0,.85);border:2px solid #4f4;color:#4f4}" +
      "#contador-retencion-oficina{position:fixed;bottom:78px;left:50%;transform:translateX(-50%);z-index:11;color:#4f4;font-family:monospace;font-size:14px;background:rgba(0,0,0,.7);padding:6px 12px;display:none}";
    document.head.appendChild(s);
  }

  function moverAudioAOficina() {
    var btnAudio = document.getElementById("btn-audio");
    var uiBotones = document.getElementById("ui-botones");
    var contadorRet = document.getElementById("contador-retencion");
    if (!btnAudio || !uiBotones || btnAudio.dataset.enOficina === "1") return;

    btnAudio.dataset.enOficina = "1";
    btnAudio.style.display = "block";
    uiBotones.appendChild(btnAudio);

    if (contadorRet) {
      contadorRet.id = "contador-retencion-oficina";
      contadorRet.style.display = "none";
      document.body.appendChild(contadorRet);
    }
  }

  window.SinCamaras = {
    activo: true,

    aplicarConfig: aplicarConfigUnificada,

    aplicar: function (cfg) {
      cfg = cfg || {};
      inyectarEstilos();

      if (cfg.config) aplicarConfigUnificada(cfg.config);

      var panel = cfg.panelCamaras;
      var btn = cfg.btnCamaras;
      if (panel) panel.style.display = "none";
      if (btn) btn.style.display = "none";

      moverAudioAOficina();
      mostrarAvisoSinCamaras(!!(window.FnatSesion && FnatSesion.esDificil()));
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
