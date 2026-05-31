(function () {
  var LOGROS = {
    noche1: {
      key: "fnat_logro_noche1",
      texto: "has completado la noche 1"
    }
  };

  var estilosInyectados = false;

  function registro(id) {
    return LOGROS[id] || null;
  }

  function estaDesbloqueado(id) {
    var r = registro(id);
    return r && localStorage.getItem(r.key) === "1";
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
      ".logro-aviso-texto{font-size:.9rem;color:#cc0000;text-shadow:2px 2px 20px #ff0000;background:rgba(0,0,0,.9);border:1px solid #cc0000;padding:12px 16px;max-width:260px;text-align:right;line-height:1.35}";
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
    }, 5500);

    initEsquina();
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

    initEsquina: initEsquina,

    texto: function (id) {
      var r = registro(id);
      return r ? r.texto : "";
    }
  };
})();
