(function () {
  var SVG_CANDADO =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-3 0h-4V7a2 2 0 1 1 4 0v2z"/></svg>';

  var SVG_TROFEO =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5h-2V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h.5A5 5 0 0 0 11 15.9V18H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2.1A5 5 0 0 0 16.5 13H17a4 4 0 0 0 4-4V7a2 2 0 0 0-2-2zM5 10V8h1v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2zm14 0a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8h4v2z"/></svg>';

  var ETIQUETA_DIFICULTAD = {
    facil: "Fácil",
    media: "Media",
    dificil: "Difícil",
    extrema: "Extrema"
  };

  var LOGROS = {
    noche1: {
      key: "fnat_logro_noche1",
      titulo: "Noche 1",
      descripcion: "Has sobrevivido hasta las 6:00 AM con Germán.",
      comoConseguir: "Gana la noche 1 en modo normal llegando a las 6:00 AM.",
      dificultad: "media"
    },
    noche2: {
      key: "fnat_logro_noche2",
      titulo: "Noche 2",
      descripcion: "Has sobrevivido hasta las 6:00 AM con Alonso.",
      comoConseguir: "Gana la noche 2 en modo normal llegando a las 6:00 AM.",
      dificultad: "media"
    },
    noche1D: {
      key: "fnat_logro_noche1_dificil",
      titulo: "Noche 1D",
      descripcion: "Has sobrevivido la primera noche a ciegas, sin cámaras.",
      comoConseguir:
        "Completa la noche 1 en MODO DIFÍCIL (sin cámaras ni audio de retención, solo puerta) hasta las 6:00 AM.",
      dificultad: "extrema"
    },
    noche2D: {
      key: "fnat_logro_noche2_dificil",
      titulo: "Noche 2D",
      descripcion: "Alonso no te ha pillado en la versión más dura de la noche 2.",
      comoConseguir:
        "Completa la noche 2 en MODO DIFÍCIL (sin cámaras ni audio de retención) hasta las 6:00 AM.",
      dificultad: "extrema"
    },
    demasiadoVeloz: {
      key: "fnat_logro_demasiado_veloz",
      titulo: "Demasiado veloz",
      descripcion:
        "Has detectado un movimiento imposible entre salas en muy poco tiempo.",
      comoConseguir:
        "Observa al enemigo recorrer las salas 4→3→2 o 2→3→4 en menos de 20 segundos (requiere cámaras).",
      dificultad: "dificil"
    },
    sinEnergia: {
      key: "fnat_logro_sin_energia",
      titulo: "Sin energía",
      descripcion:
        "Te han matado al quedarte sin energía. Todo a oscuras: cámaras y puerta fuera de servicio.",
      comoConseguir: "Muere al quedarte sin energía durante una partida.",
      dificultad: "media"
    },
    muerteGerman: {
      key: "fnat_logro_muerte_german",
      titulo: "Visitado por Germán",
      descripcion: "Germán ha entrado en tu oficina con la puerta abierta.",
      comoConseguir: "Deja que Germán entre en la oficina en la noche 1.",
      dificultad: "facil"
    },
    muerteAlonso: {
      key: "fnat_logro_muerte_alonso",
      titulo: "Mantecoño",
      descripcion: "Alonso ha entrado en tu oficina. Mantecoño.",
      comoConseguir: "Deja que Alonso entre en la oficina en la noche 2.",
      dificultad: "facil"
    },
    energia20: {
      key: "fnat_logro_energia_20",
      titulo: "Ahorro energético",
      descripcion: "Has ganado la noche con más del 20% de energía.",
      comoConseguir: "Termina una noche con victoria y más del 20% de energía.",
      dificultad: "dificil"
    },
    energiaCritica: {
      key: "fnat_logro_energia_critica",
      titulo: "Por los pelos",
      descripcion: "Has llegado a las 6 AM con la batería casi muerta.",
      comoConseguir: "Gana una noche con un 10% de energía o menos.",
      dificultad: "dificil"
    },
    silencioso: {
      key: "fnat_logro_silencioso",
      titulo: "Sin playlist",
      descripcion: "Has ganado sin usar el audio de retención ni una sola vez.",
      comoConseguir:
        "Gana una noche en modo normal sin pulsar ♫ Usar Audio en toda la partida.",
      dificultad: "dificil"
    },
    audioMaestro: {
      key: "fnat_logro_audio_maestro",
      titulo: "DJ de la muerte",
      descripcion: "Has usado el altavoz de las cámaras para frenar al enemigo.",
      comoConseguir: "Pulsa ♫ Usar Audio al menos una vez en una partida.",
      dificultad: "facil"
    },
    ultimoRecurso: {
      key: "fnat_logro_ultimo_recurso",
      titulo: "Último recurso",
      descripcion: "Has disparado el audio cuando el enemigo ya estaba muy cerca.",
      comoConseguir:
        "Usa el audio de retención con el enemigo en la sala 3 (justo antes del pasillo).",
      dificultad: "media"
    },
    glitch5am: {
      key: "fnat_logro_glitch_5am",
      titulo: "Si nos miras, morirás",
      descripcion: "Los botones de cámara te han mostrado el mensaje a las 5 AM.",
      comoConseguir:
        "Sobrevive hasta las 5 AM con cámaras y presencia el glitch SI NOS MIRAS MORIRAS en los botones CAM.",
      dificultad: "media"
    },
    hastaLas5: {
      key: "fnat_logro_hasta_las_5",
      titulo: "La hora bruja",
      descripcion: "Has aguantado hasta el tramo más peligroso de la noche.",
      comoConseguir: "Llega con vida a las 5:00 AM en cualquier noche.",
      dificultad: "media"
    },
    senalPerdida: {
      key: "fnat_logro_senal_perdida",
      titulo: "Fuera de emisión",
      descripcion: "El panel de cámaras se ha caído en plena madrugada.",
      comoConseguir:
        "Juega una partida normal y vive el fallo del sistema de cámaras a las 5 AM.",
      dificultad: "media"
    },
    auraVictima: {
      key: "fnat_logro_aura",
      titulo: "Mirada letal",
      descripcion:
        "Has mirado demasiado tiempo la cámara del enemigo y te ha drenado energía.",
      comoConseguir:
        "Recibe daño por el aura (mirar demasiado la cámara donde está el enemigo).",
      dificultad: "facil"
    },
    golpePuerta: {
      key: "fnat_logro_golpe_puerta",
      titulo: "Toc, toc",
      descripcion: "El enemigo ha golpeado la puerta cerrada y te ha costado energía.",
      comoConseguir:
        "Que Germán o Alonso golpee la puerta estando cerrada (en la oficina o al cerrar tarde).",
      dificultad: "media"
    },
    apagonTotal: {
      key: "fnat_logro_apagon_puerta",
      titulo: "Apagón blindado",
      descripcion: "Te has quedado sin luz con el portón bajado. Mala combinación.",
      comoConseguir:
        "Muere sin energía mientras la puerta está cerrada (screamer especial).",
      dificultad: "media"
    },
    dobleCorona: {
      key: "fnat_logro_doble_corona",
      titulo: "Doble turno",
      descripcion: "Has completado la noche 1 y la noche 2 en modo normal.",
      comoConseguir: "Gana la noche 1 y después la noche 2 en modo normal.",
      dificultad: "dificil"
    },
    leyendaAtlantida: {
      key: "fnat_logro_leyenda",
      titulo: "Leyenda de Atlántida",
      descripcion: "Has sobrevivido las dos noches en modo difícil. Pocos lo consiguen.",
      comoConseguir: "Gana la noche 1D y la noche 2D.",
      dificultad: "extrema"
    },
    puntuazo: {
      key: "fnat_logro_puntuazo",
      titulo: "Puntuación legendaria",
      descripcion: "Has firmado una de las mejores puntuaciones posibles al ganar.",
      comoConseguir: "Gana una noche con 400 puntos o más al finalizar.",
      dificultad: "dificil"
    },
    coleccionista: {
      key: "fnat_logro_coleccionista",
      titulo: "Museo del miedo",
      descripcion: "Ya dominas una buena parte de los secretos del Atlántida.",
      comoConseguir: "Desbloquea al menos la mitad de todos los logros.",
      dificultad: "media"
    }
  };

  var historialMov = [];
  var estilosInyectados = false;
  var seleccionActual = null;
  var estadoPartida = {
    audioUsado: false
  };

  function registro(id) {
    return LOGROS[id] || null;
  }

  /** Nombre único del logro (lista, detalle y toast). */
  function nombreLogro(r) {
    return r.titulo || "";
  }

  function escaparHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function estaDesbloqueado(id) {
    var r = registro(id);
    return r && localStorage.getItem(r.key) === "1";
  }

  function revisarColeccionista() {
    if (estaDesbloqueado("coleccionista")) return;
    var ids = Object.keys(LOGROS).filter(function (id) {
      return id !== "coleccionista";
    });
    var desbloqueados = ids.filter(estaDesbloqueado).length;
    if (desbloqueados >= Math.ceil(ids.length * 0.5)) {
      desbloquear("coleccionista");
    }
  }

  function desbloquear(id) {
    var r = registro(id);
    if (!r || estaDesbloqueado(id)) return false;
    localStorage.setItem(r.key, "1");
    mostrarAviso(id);
    revisarColeccionista();
    return true;
  }

  function resetPartida() {
    estadoPartida.audioUsado = false;
    historialMov = [];
  }

  function eventoPartida(tipo, data) {
    data = data || {};
    switch (tipo) {
      case "audio":
        estadoPartida.audioUsado = true;
        desbloquear("audioMaestro");
        if (data.pos === 3) desbloquear("ultimoRecurso");
        break;
      case "hora5":
        desbloquear("hastaLas5");
        break;
      case "glitch5am":
        desbloquear("glitch5am");
        break;
      case "aura":
        desbloquear("auraVictima");
        break;
      case "golpePuerta":
        desbloquear("golpePuerta");
        break;
      case "camarasCaidas":
        desbloquear("senalPerdida");
        break;
      case "apagonPuerta":
        desbloquear("apagonTotal");
        break;
      default:
        break;
    }
  }

  function alVictoria(opts) {
    opts = opts || {};
    var e = typeof opts.energia === "number" ? opts.energia : 100;
    var pts = typeof opts.puntos === "number" ? opts.puntos : 0;
    var n = opts.noche;
    var modo = opts.modo || "normal";

    if (e <= 10) desbloquear("energiaCritica");
    if (modo !== "dificil" && !estadoPartida.audioUsado) desbloquear("silencioso");
    if (pts >= 400) desbloquear("puntuazo");

    if (n === 2 && modo === "normal" && estaDesbloqueado("noche1")) {
      desbloquear("dobleCorona");
    }
    if (n === 2 && modo === "dificil" && estaDesbloqueado("noche1D")) {
      desbloquear("leyendaAtlantida");
    }
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
      "#logro-aviso{position:fixed;top:12px;left:50%;z-index:600;max-width:min(220px,calc(100vw - 40px));display:flex;flex-direction:column;align-items:center;gap:6px;font-family:monospace;text-transform:uppercase;letter-spacing:2px;opacity:0;transform:translate(-50%,-20px);transition:opacity 1.5s,transform 1.5s;pointer-events:none}" +
      "#logro-aviso.visible{opacity:1;transform:translate(-50%,0)}" +
      ".logro-aviso-titulo{font-size:.7rem;color:#888;letter-spacing:3px}" +
      ".logro-aviso-texto{font-size:.85rem;color:#cc0000;text-shadow:2px 2px 20px #ff0000;background:rgba(0,0,0,.9);border:1px solid #cc0000;padding:10px 14px;max-width:220px;text-align:center;line-height:1.35;border-radius:8px;}";
    document.head.appendChild(estilo);
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
      '<span class="logro-aviso-texto">' + escaparHtml(nombreLogro(r)) + "</span>";
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
  }

  function limpiarDetalle(contenedorId) {
    var panel = document.getElementById(contenedorId || "logro-detalle");
    if (!panel) return;
    seleccionActual = null;
    panel.className = "logro-detalle--vacio";
    panel.innerHTML =
      '<p class="logro-detalle-placeholder">Pulsa un logro de la lista para ver cómo conseguirlo y qué has desbloqueado.</p>';
    panel.style.display = "block";
  }

  function mostrarDetalle(id, contenedorId) {
    var r = registro(id);
    var panel = document.getElementById(contenedorId || "logro-detalle");
    if (!r || !panel) return;

    seleccionActual = id;
    panel.className = "logro-detalle--activo";
    var desbloqueado = estaDesbloqueado(id);
    var dif = r.dificultad || "media";
    var etiquetaDif = ETIQUETA_DIFICULTAD[dif] || dif;

    panel.innerHTML =
      '<div class="logro-detalle-inner">' +
      '<span class="logro-dificultad logro-dificultad--' +
      dif +
      '">' +
      etiquetaDif +
      "</span>" +
      "<h3 class=\"logro-detalle-titulo\">" +
      escaparHtml(nombreLogro(r)) +
      "</h3>" +
      '<p class="logro-detalle-como"><strong>Cómo conseguirlo:</strong> ' +
      r.comoConseguir +
      "</p>" +
      '<p class="logro-detalle-desc">' +
      (desbloqueado
        ? r.descripcion
        : "Aún no lo has desbloqueado. Sigue las instrucciones de arriba.") +
      "</p>" +
      "</div>";
    panel.style.display = "block";
  }

  function renderLista(contenedorId, detalleId) {
    var lista = document.getElementById(contenedorId);
    if (!lista) return;
    lista.innerHTML = "";
    detalleId = detalleId || "logro-detalle";
    limpiarDetalle(detalleId);

    var ids = Object.keys(LOGROS);
    ids.forEach(function (id) {
      var r = LOGROS[id];
      var desbloqueado = estaDesbloqueado(id);
      var item = document.createElement("li");
      item.className =
        "logro-item " +
        (desbloqueado ? "desbloqueado" : "bloqueado") +
        (seleccionActual === id ? " seleccionado" : "");
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.dataset.logroId = id;

      var icono = document.createElement("span");
      icono.className = "logro-icono";
      icono.innerHTML = desbloqueado ? SVG_TROFEO : SVG_CANDADO;

      var texto = document.createElement("span");
      texto.className = "logro-texto";
      if (desbloqueado) {
        texto.innerHTML = "<strong>" + escaparHtml(nombreLogro(r)) + "</strong>";
      } else {
        texto.textContent = "???";
      }

      item.appendChild(icono);
      item.appendChild(texto);

      function seleccionar(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (seleccionActual === id) {
          mostrarDetalle(id, detalleId);
          return;
        }
        lista.querySelectorAll(".logro-item").forEach(function (el) {
          el.classList.remove("seleccionado");
        });
        item.classList.add("seleccionado");
        mostrarDetalle(id, detalleId);
      }

      item.addEventListener("click", seleccionar);
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          seleccionar(e);
        }
      });

      lista.appendChild(item);
    });
  }

  window.Logros = {
    estaDesbloqueado: estaDesbloqueado,

    desbloquear: desbloquear,
    resetPartida: resetPartida,
    eventoPartida: eventoPartida,
    alVictoria: alVictoria,

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

    renderLista: renderLista,
    mostrarDetalle: mostrarDetalle,
    limpiarDetalle: limpiarDetalle,

    nombre: function (id) {
      var r = registro(id);
      return r ? nombreLogro(r) : "";
    },

    /** @deprecated Usar Logros.nombre */
    texto: function (id) {
      return window.Logros.nombre(id);
    }
  };
})();
