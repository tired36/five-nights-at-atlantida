(function () {
  const REGLAS = {
    1: { subeCadaSeg: 1, subeCantidad: 3, bonusHora: 18, bonusVictoria: 280, penAudio: 28, penPuerta: 40, mult: 1 },
    2: { subeCadaSeg: 1, subeCantidad: 3, bonusHora: 22, bonusVictoria: 300, penAudio: 32, penPuerta: 40, mult: 1.08 }
  };

  let noche = 1;
  let modo = "normal";
  let listo = false;
  let fin = false;
  let nombreUsuario = "";
  let hora = 0;
  let puntos = 0;
  let pausaPorAudio = false;
  let pausaPorPuerta = false;
  let ticks = 0;

  const reglas = () => REGLAS[noche] || REGLAS[1];

  function idNocheRanking() {
    return modo === "dificil" ? noche + "D" : noche;
  }

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

  function mostrarBarraPuntos(visible) {
    const bar = document.getElementById("rank-bar");
    if (bar) bar.style.display = visible ? "flex" : "none";
  }

  function avisoPenalizacion(texto) {
    const el = document.getElementById("rank-aviso");
    if (!el) return;
    el.textContent = texto;
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 1800);
  }

  function empezarPartida() {
    const nombre = document.getElementById("rank-nombre").value.trim();
    if (nombre.length < 2) { alert("Mínimo 2 letras"); return; }
    nombreUsuario = nombre;
    localStorage.setItem("fnat_usuario", nombre);
    document.getElementById("rank-login").style.display = "none";
    mostrarBarraPuntos(true);
    listo = true;
    pintarPuntos();
  }

  function crearPantallas() {
    if (document.getElementById("rank-ui")) return;

    const estilo = document.createElement("style");
    estilo.textContent =
      "#rank-ui{font-family:monospace;color:#fff;z-index:500}" +
      "#rank-login,#rank-fin{position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center}" +
      "#rank-login form,#rank-fin .box{background:#111;border:1px solid #fff;padding:24px;text-align:center;min-width:220px}" +
      "#rank-login input,#rank-login button,#rank-fin button{width:100%;margin:8px 0;padding:10px;font-family:monospace}" +
      "#rank-bar{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:60;display:none;align-items:center;gap:14px;flex-wrap:nowrap}" +
      "#rank-pts{font-size:24px;color:#5f5;white-space:nowrap}" +
      "#rank-aviso{position:fixed;top:50px;left:50%;transform:translateX(-50%);color:#f88;font-size:14px;z-index:60;opacity:0;transition:opacity .8s}";
    document.head.appendChild(estilo);

    const contenedor = document.createElement("div");
    contenedor.id = "rank-ui";
    contenedor.innerHTML =
      '<div id="rank-login"><form>' +
      '<h3>Usuario</h3><input id="rank-nombre" maxlength="20" placeholder="Tu nombre">' +
      '<button type="button" id="rank-start">Jugar</button></form></div>' +
      '<div id="rank-bar"><div id="rank-pts">0 pts</div></div><div id="rank-aviso"></div>' +
      '<div id="rank-fin" style="display:none"><div class="box">' +
      '<h3>Fin</h3><p id="rank-usuario" style="font-size:18px;color:#aaa"></p>' +
      '<p id="rank-total" style="font-size:32px">0 pts</p>' +
      '<p id="rank-save"></p>' +
      '<button type="button" id="rank-ver">Ranking</button>' +
      '<button type="button" id="rank-menu">Menú</button></div></div>';
    document.body.appendChild(contenedor);

    document.getElementById("rank-start").onclick = empezarPartida;

    const formLogin = document.querySelector("#rank-login form");
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      empezarPartida();
    });

    document.getElementById("rank-menu").onclick = () => { location.href = "menu.html"; };
  }

  function leerNombre() {
    if (nombreUsuario.length >= 2) return nombreUsuario;
    return "";
  }

  window.Ranking = {
    init(numNoche, opts) {
      opts = opts || {};
      noche = numNoche;
      modo = opts.modo === "dificil" ? "dificil" : "normal";
      listo = false;
      fin = false;
      hora = 0;
      puntos = 0;
      pausaPorAudio = false;
      pausaPorPuerta = false;
      ticks = 0;
      crearPantallas();

      nombreUsuario = localStorage.getItem("fnat_usuario") || "";
      document.getElementById("rank-nombre").value = nombreUsuario;

      document.getElementById("rank-login").style.display = "flex";
      document.getElementById("rank-fin").style.display = "none";
      mostrarBarraPuntos(false);
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

    /** Sincroniza pausas con el estado real del juego (evita que los pts queden bloqueados) */
    syncBloqueos(puertaBloqueada, audioBloqueado) {
      if (!listo) return;
      pausaPorPuerta = !!puertaBloqueada;
      pausaPorAudio = !!audioBloqueado;
    },

    /** Usas el audio: penalización y no sube hasta que termine (retención + recarga) */
    audioActivado() {
      if (!listo) return;
      const n = reglas().penAudio;
      puntos = Math.max(0, puntos - n);
      avisoPenalizacion("-" + n + " audio (no sube mientras activo)");
      pintarPuntos();
    },

    audioTerminado() {},

    /** Cierras la puerta: -40 y no sube mientras esté bajada o bajando */
    puertaCerrada() {
      if (!listo) return;
      const n = reglas().penPuerta;
      puntos = Math.max(0, puntos - n);
      avisoPenalizacion("-" + n + " puerta (no sube mientras cerrada)");
      pintarPuntos();
    },

    puertaAbierta() {},

    finPartida(opts) {
      if (fin) return;
      fin = true;

      const victoria = !!opts.victoria;
      const total = calcularPuntos(victoria);
      const usuario = leerNombre();

      if (!usuario) {
        mostrarBarraPuntos(false);
        document.getElementById("rank-fin").style.display = "none";
        document.getElementById("rank-login").style.display = "flex";
        alert("Escribe tu nombre (mínimo 2 letras) y pulsa Jugar antes de terminar.");
        fin = false;
        return;
      }

      nombreUsuario = usuario;
      localStorage.setItem("fnat_usuario", usuario);

      if (victoria && noche === 1) {
        if (window.Logros) Logros.desbloquear("noche1");
        else localStorage.setItem("fnat_logro_noche1", "1");
      }
      if (victoria && typeof opts.energia === "number" && opts.energia > 20) {
        if (window.Logros) Logros.desbloquear("energia20");
        else localStorage.setItem("fnat_logro_energia_20", "1");
      }
      if (victoria && noche === 2) {
        if (window.Logros) Logros.desbloquear("noche2");
        else localStorage.setItem("fnat_logro_noche2", "1");
      }

      mostrarBarraPuntos(false);

      const idRank = idNocheRanking();
      const promesaGuardado = RankingApi.guardar(usuario, idRank, total);

      if (!victoria) {
        return promesaGuardado.catch(() => {});
      }

      document.getElementById("rank-usuario").textContent = usuario;
      document.getElementById("rank-total").textContent = total + " pts";
      document.getElementById("rank-save").textContent = "Guardando...";
      document.getElementById("rank-fin").style.display = "flex";
      document.getElementById("rank-ver").onclick = () => {
        location.href =
          modo === "dificil"
            ? "ranking.html#" + noche + "d"
            : "ranking.html#noche" + noche;
      };

      return promesaGuardado
        .then(() => {
          const donde =
            modo === "dificil"
              ? "Guardado en ranking modo difícil (Noche " + idRank + ")."
              : "Guardado en ranking Noche " + idRank + ".";
          document.getElementById("rank-save").textContent = donde;
        })
        .catch((e) => {
          document.getElementById("rank-save").textContent = "Error: " + (e.message || "sin conexión");
        });
    }
  };
})();
