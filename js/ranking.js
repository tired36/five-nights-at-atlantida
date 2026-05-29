(function () {
  const REGLAS = {
    1: { subeCadaSeg: 1, subeCantidad: 3, bonusHora: 18, bonusVictoria: 280, penAudio: 28, penPuerta: 40, mult: 1 },
    2: { subeCadaSeg: 1, subeCantidad: 3, bonusHora: 22, bonusVictoria: 300, penAudio: 32, penPuerta: 40, mult: 1.08 }
  };

  let noche = 1;
  let listo = false;
  let fin = false;
  let hora = 0;
  let puntos = 0;
  let pausaPorAudio = false;
  let pausaPorPuerta = false;
  let ticks = 0;

  const reglas = () => REGLAS[noche] || REGLAS[1];

  function puedeSubirPuntos() {
    return !pausaPorAudio && !pausaPorPuerta;
  }

  function calcularPuntos(victoria) {
    const r = reglas();
    let total = puntos + (victoria ? r.bonusVictoria : hora * r.bonusHora);
    if (r.mult !== 1) total = Math.floor(total * r.mult);
    return total < 0 ? 0 : total;
  }

  function pintarPuntos() {
    const el = document.getElementById("rank-pts");
    if (el) el.textContent = calcularPuntos(false) + " pts";
  }

  function avisoPenalizacion(texto) {
    const el = document.getElementById("rank-aviso");
    if (!el) return;
    el.textContent = texto;
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 1800);
  }

  function crearPantallas() {
    if (document.getElementById("rank-ui")) return;

    const estilo = document.createElement("style");
    estilo.textContent =
      "#rank-ui{font-family:monospace;color:#fff;z-index:500}" +
      "#rank-login,#rank-fin{position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center}" +
      "#rank-login form,#rank-fin .box{background:#111;border:1px solid #fff;padding:24px;text-align:center;min-width:220px}" +
      "#rank-login input,#rank-login button,#rank-fin button{width:100%;margin:8px 0;padding:10px;font-family:monospace}" +
      "#rank-pts{position:fixed;top:12px;left:50%;transform:translateX(-50%);font-size:24px;color:#5f5;z-index:60;display:none}" +
      "#rank-aviso{position:fixed;top:46px;left:50%;transform:translateX(-50%);color:#f88;font-size:14px;z-index:60;opacity:0;transition:opacity .8s}";
    document.head.appendChild(estilo);

    const contenedor = document.createElement("div");
    contenedor.id = "rank-ui";
    contenedor.innerHTML =
      '<div id="rank-login"><form>' +
      '<h3>Usuario</h3><input id="rank-nombre" maxlength="20" placeholder="Tu nombre">' +
      '<button type="button" id="rank-start">Jugar</button></form></div>' +
      '<div id="rank-pts">0 pts</div><div id="rank-aviso"></div>' +
      '<div id="rank-fin" style="display:none"><div class="box">' +
      '<h3>Fin</h3><p id="rank-total" style="font-size:32px">0 pts</p>' +
      '<p id="rank-save"></p>' +
      '<button type="button" id="rank-ver">Ranking</button>' +
      '<button type="button" id="rank-menu">Menú</button></div></div>';
    document.body.appendChild(contenedor);

    document.getElementById("rank-start").onclick = () => {
      const nombre = document.getElementById("rank-nombre").value.trim();
      if (nombre.length < 2) { alert("Mínimo 2 letras"); return; }
      localStorage.setItem("fnat_usuario", nombre);
      document.getElementById("rank-login").style.display = "none";
      document.getElementById("rank-pts").style.display = "block";
      listo = true;
      pintarPuntos();
    };

    document.getElementById("rank-menu").onclick = () => { location.href = "menu.html"; };
  }

  window.Ranking = {
    init(numNoche) {
      noche = numNoche;
      listo = false;
      fin = false;
      hora = 0;
      puntos = 0;
      pausaPorAudio = false;
      pausaPorPuerta = false;
      ticks = 0;
      crearPantallas();

      const guardado = localStorage.getItem("fnat_usuario");
      if (guardado) document.getElementById("rank-nombre").value = guardado;

      document.getElementById("rank-login").style.display = "flex";
      document.getElementById("rank-fin").style.display = "none";
      document.getElementById("rank-pts").style.display = "none";
    },

    actualizar(h) {
      if (!listo || fin) return;
      hora = h;
      if (puedeSubirPuntos()) {
        ticks++;
        const r = reglas();
        if (ticks % r.subeCadaSeg === 0) puntos += r.subeCantidad;
      }
      pintarPuntos();
    },

    /** Usas el audio: penalización y no sube hasta que termine (retención + recarga) */
    audioActivado() {
      if (!listo) return;
      const n = reglas().penAudio;
      puntos = Math.max(0, puntos - n);
      pausaPorAudio = true;
      avisoPenalizacion("-" + n + " audio (no sube mientras activo)");
      pintarPuntos();
    },

    audioTerminado() {
      if (!listo) return;
      pausaPorAudio = false;
      pintarPuntos();
    },

    /** Cierras la puerta: -40 y no sube hasta que abras */
    puertaCerrada() {
      if (!listo) return;
      const n = reglas().penPuerta;
      puntos = Math.max(0, puntos - n);
      pausaPorPuerta = true;
      avisoPenalizacion("-" + n + " puerta (no sube mientras cerrada)");
      pintarPuntos();
    },

    /** Abres la puerta: vuelve a subir la puntuación (si el audio no la bloqueó) */
    puertaAbierta() {
      if (!listo) return;
      pausaPorPuerta = false;
      pintarPuntos();
    },

    finPartida(opts) {
      if (fin) return;
      fin = true;

      const victoria = !!opts.victoria;
      const total = calcularPuntos(victoria);
      const usuario = localStorage.getItem("fnat_usuario") || "anon";

      document.getElementById("rank-pts").style.display = "none";
      document.getElementById("rank-total").textContent = total + " pts";
      document.getElementById("rank-save").textContent = "Guardando...";
      document.getElementById("rank-fin").style.display = "flex";
      document.getElementById("rank-ver").onclick = () => {
        location.href = "ranking.html#noche" + noche;
      };

      RankingApi.guardar(usuario, noche, total)
        .then(() => {
          document.getElementById("rank-save").textContent = "Guardado en el ranking.";
        })
        .catch((e) => {
          document.getElementById("rank-save").textContent = "Error: " + (e.message || "sin conexión");
        });
    }
  };
})();
