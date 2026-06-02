(function () {
  var SVG_CANDADO =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-3 0h-4V7a2 2 0 1 1 4 0v2z"/></svg>';

  var SVG_TROFEO =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5h-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h.5A5 5 0 0 0 11 15.9V18H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2.1A5 5 0 0 0 16.5 13H17a4 4 0 0 0 4-4V7a2 2 0 0 0-2-2zM5 10V8h1v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2zm14 0a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8h4v2z"/></svg>';

  var LOGROS = {
    noche1: {
      key: "fnat_logro_noche1",
      titulo: "Noche 1",
      texto: "Has completado la noche 1",
      descripcion: "Has sobrevivido hasta las 6:00 AM con Germán."
    },
    noche2: {
      key: "fnat_logro_noche2",
      titulo: "Noche 2",
      texto: "Has superado la noche 2",
      descripcion: "Has sobrevivido hasta las 6:00 AM con Alonso."
    },
    demasiadoVeloz: {
      key: "fnat_logro_demasiado_veloz",
      titulo: "Demasiado veloz",
      texto: "Demasiado veloz",
      descripcion:
        "El personaje ha pasado por las salas 4, 3 y 2 en menos de veinte segundos. Se aleja y vuelve a acercarse a una velocidad imposible."
    },
    sinEnergia: {
      key: "fnat_logro_sin_energia",
      titulo: "A oscuras",
      texto: "Sin energía",
      descripcion:
        "Te han matado al quedarte sin energía. Las cámaras y la puerta dejaron de funcionar."
    },
    muerteGerman: {
      key: "fnat_logro_muerte_german",
      titulo: "Visitado por Germán",
      texto: "Germán te ha pillado",
      descripcion: "Germán ha entrado en tu oficina con la puerta abierta."
    },
    muerteAlonso: {
      key: "fnat_logro_muerte_alonso",
      titulo: "Mantecoño",
      texto: "Mantecoño",
      descripcion: "Alonso ha entrado en tu oficina. Mantecoño."
    },
    energia20: {
      key: "fnat_logro_energia_20",
      titulo: "Ahorro energético",
      texto: "Bien ahorrado",
      descripcion: "Has ganado la noche con más del 20% de energía."
    }
  };

  var historialMov = [];
  var estilosInyectados = false;

  function registro(id) {
    return LOGROS[id] || null;
  }

  function estaDesbloqueado(id) {
    var r = registro(id);
    return r && localStorage.getItem(r.key) === "1";
  }

  function secuenciaEnVentana(patron, ventanaMs) {
    for (var i = 0; i < historialMov.length; i++) {
      if (historialMov[i].sala !== patron[0]) continue;
      var ok = true;
      for (var k = 0; k < patron.length; k++) {
        if (!historialMov[i + k] || historialMov[i + k].sala !== patron[k]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      var t0 = historialMov[i].t;
      var t1 = historialMov[i + patron.length - 1].t;
      if (t1 - t0 <= ventanaMs) return true;
    }
    return false;
  }

  function inyectarEstilos() {
    if (estilosInyectados) return;
    estilosInyectados = true;
    var estilo = document.createElement("style");
    estilo.textContent =
      "#logros-esquina{position:fixed;top:12px;right:12px;z-index:500;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none}" +
      ".logro-chip{font-family:monospace;font-size:.75rem;color:#cc0000;text-transform:uppercase;letter-spacing:2px;text-shadow:2px 2px 12px #ff0000;background:rgba(0,0,0,.75);border:1px solid #660000;padding:8px 12px;max-width:220px;text-align:right;line-height:1.3}" +
      "#logro-aviso{position:fixed;top:12px;right:12px;z-index:600;display:flex;flex-direction:column;align-items:flex-end;gap:6px;font-family:monospace;text-transform:uppercase;letter-spacing:2px;opacity:0;transform:translateX(20px);transition:opacity 1.5s,transform 1.5s;pointer-events:none}" +
      "#logro-aviso.visible{opacity:1;transform:translateX(0)}" +
      ".logro-aviso-titulo{font-size:.7rem;color:#888;letter-spacing:3px}" +
      ".logro-aviso-texto{font-size:.9rem;color:#cc0000;text-shadow:2px 2px 20px #ff0000;background:rgba(0,0,0,.9);border:1px solid #cc0000;padding:12px 16px;max-width:280px;text-align:right;line-height:1.35}" +
      ".logro-aviso-desc{font-size:.65rem;color:#aaa;text-transform:none;letter-spacing:0;margin-top:4px}";
    document.head.appendChild(estilo);
  }

  function initEsquina() {
    inyectarEstilos();
    var esquina = document.getElementById("logros-esquina");
    if (!esquina) {
      esquina = document.createElement("div");
      esquina.id = "logros-esquina";
      document.body.appendChild(esquina);
    }
    esquina.innerHTML = "";
    Object.keys(LOGROS).forEach(function (id) {
      if (!estaDesbloqueado(id)) return;
      var chip = document.createElement("div");
      chip.className = "logro-chip";
      chip.textContent = LOGROS[id].texto;
      esquina.appendChild(chip);
    });
    esquina.style.display = esquina.children.length ? "flex" : "none";
  }

  function mostrarAviso(id) {
    var r = registro(id);
    if (!r) return;
    inyectarEstilos();

    var previo = document.getElementById("logro-aviso");
    if (previo) previo.remove();

    var aviso = document.createElement("div");
    aviso.id = "logro-aviso";
    aviso.innerHTML =
      '<span class="logro-aviso-titulo">Logro desbloqueado</span>' +
      '<span class="logro-aviso-texto">' + r.texto + "</span>";
    document.body.appendChild(aviso);

    requestAnimationFrame(function () {
      aviso.classList.add("visible");
    });

    setTimeout(function () {
      aviso.classList.remove("visible");
      setTimeout(function () {
        if (aviso.parentNode) aviso.remove();
      }, 1500);
    }, 6500);

    initEsquina();
  }

  function renderLista(contenedorId) {
    var lista = document.getElementById(contenedorId);
    if (!lista) return;
    lista.innerHTML = "";

    Object.keys(LOGROS).forEach(function (id) {
      var r = LOGROS[id];
      var desbloqueado = estaDesbloqueado(id);
      var item = document.createElement("li");
      item.className = "logro-item " + (desbloqueado ? "desbloqueado" : "bloqueado");

      var icono = document.createElement("span");
      icono.className = "logro-icono";
      icono.innerHTML = desbloqueado ? SVG_TROFEO : SVG_CANDADO;

      var texto = document.createElement("span");
      texto.className = "logro-texto";
      if (desbloqueado) {
        texto.innerHTML = "<strong>" + r.texto + "</strong>";
      } else {
        texto.textContent = "???";
      }

      item.appendChild(icono);
      item.appendChild(texto);
      lista.appendChild(item);
    });
  }

  window.Logros = {
    estaDesbloqueado: estaDesbloqueado,

    desbloquear: function (id) {
      var r = registro(id);
      if (!r || estaDesbloqueado(id)) return false;
      localStorage.setItem(r.key, "1");
      mostrarAviso(id);
      return true;
    },

    registrarMovimientoSala: function (sala) {
      var s = Number(sala);
      if (![1, 2, 3, 4].includes(s)) return;
      var ahora = Date.now();
      historialMov.push({ sala: s, t: ahora });
      historialMov = historialMov.filter(function (e) {
        return ahora - e.t <= 20000;
      });
      if (
        secuenciaEnVentana([4, 3, 2], 20000) ||
        secuenciaEnVentana([2, 3, 4], 20000)
      ) {
        window.Logros.desbloquear("demasiadoVeloz");
      }
    },

    alMorir: function (opts) {
      opts = opts || {};
      if (opts.sinEnergia) return window.Logros.desbloquear("sinEnergia");
      if (opts.noche === 2) return window.Logros.desbloquear("muerteAlonso");
      return window.Logros.desbloquear("muerteGerman");
    },

    initEsquina: initEsquina,

    renderLista: renderLista,

    texto: function (id) {
      var r = registro(id);
      return r ? r.texto : "";
    }
  };
})();
