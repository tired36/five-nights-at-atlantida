/* Ranking simple + Supabase */
(function () {
  var URL = "https://jyjrhjgzircwcevtmsbd.supabase.co";
  var KEY = "sb_publishable_Mrkm6TMkllKp3Q8pF6IM9A_7S7tktbG";

  var noche = 1;
  var penalizaciones = 0;
  var listo = false;
  var terminado = false;
  var horaAct = 0;
  var energiaAct = 100;

  function puntos(victoria, hora, energia) {
    var p = (victoria ? 1000 : hora * 100) + Math.floor(energia) * 3 - penalizaciones;
    if (p < 0) p = 0;
    if (noche === 2) p = Math.floor(p * 1.2);
    return p;
  }

  function crearUI() {
    if (document.getElementById("rank-ui")) return;

    var css = document.createElement("style");
    css.textContent =
      "#rank-ui{font-family:monospace;color:#fff;z-index:500}" +
      "#rank-login,#rank-fin{position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center}" +
      "#rank-login form,#rank-fin .box{background:#111;border:1px solid #fff;padding:24px;text-align:center}" +
      "#rank-login input,#rank-login button,#rank-fin button{display:block;width:100%;margin:8px 0;padding:10px;font-family:monospace}" +
      "#rank-pts{position:fixed;top:12px;left:50%;transform:translateX(-50%);font-size:26px;color:#5f5;z-index:60;display:none}" +
      "#rank-aviso{position:fixed;top:48px;left:50%;transform:translateX(-50%);color:#f88;font-size:16px;z-index:60;opacity:0;transition:opacity .8s}";
    document.head.appendChild(css);

    var d = document.createElement("div");
    d.id = "rank-ui";
    d.innerHTML =
      '<div id="rank-login"><form onsubmit="return false">' +
      "<h3>Usuario</h3><input id='rank-nombre' maxlength='20' placeholder='Tu nombre'>" +
      "<button type='button' id='rank-start'>Jugar</button></form></div>" +
      '<div id="rank-pts">0 pts</div><div id="rank-aviso"></div>' +
      '<div id="rank-fin" style="display:none"><div class="box">' +
      "<h3>Fin</h3><p id='rank-total' style='font-size:32px'>0 pts</p>" +
      "<p id='rank-save'></p>" +
      "<button type='button' id='rank-ver'>Ranking</button>" +
      "<button type='button' onclick=\"location.href='menu.html'\">Menú</button></div></div>";
    document.body.appendChild(d);

    document.getElementById("rank-start").onclick = function () {
      var n = document.getElementById("rank-nombre").value.trim();
      if (n.length < 2) { alert("Mínimo 2 letras"); return; }
      localStorage.setItem("fnat_usuario", n);
      document.getElementById("rank-login").style.display = "none";
      document.getElementById("rank-pts").style.display = "block";
      listo = true;
      Ranking.actualizar(0, 100);
    };
  }

  function aviso(texto) {
    var el = document.getElementById("rank-aviso");
    el.textContent = texto;
    el.style.opacity = "1";
    setTimeout(function () { el.style.opacity = "0"; }, 2000);
  }

  function guardar(datos) {
    return fetch(URL + "/rest/v1/partidas", {
      method: "POST",
      headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
  }

  window.Ranking = {
    init: function (numNoche) {
      noche = numNoche;
      penalizaciones = 0;
      listo = false;
      terminado = false;
      crearUI();
      var n = localStorage.getItem("fnat_usuario");
      if (n) document.getElementById("rank-nombre").value = n;
      document.getElementById("rank-login").style.display = "flex";
      document.getElementById("rank-fin").style.display = "none";
      document.getElementById("rank-pts").style.display = "none";
    },

    actualizar: function (hora, energia) {
      if (!listo || terminado) return;
      horaAct = hora;
      energiaAct = energia;
      document.getElementById("rank-pts").textContent = puntos(false, hora, energia) + " pts";
    },

    penalizarAudio: function () {
      if (!listo) return;
      penalizaciones += 40;
      aviso("-40 audio");
      document.getElementById("rank-pts").textContent = puntos(false, horaAct, energiaAct) + " pts";
    },

    penalizarPuerta: function () {
      if (!listo) return;
      penalizaciones += 25;
      aviso("-25 puerta");
      document.getElementById("rank-pts").textContent = puntos(false, horaAct, energiaAct) + " pts";
    },

    tickPuertaCerrada: function () {},

    finPartida: function (opts) {
      if (terminado) return;
      terminado = true;
      var victoria = !!opts.victoria;
      var hora = opts.hora || 0;
      var energia = opts.energia || 0;
      var total = puntos(victoria, hora, energia);
      var user = localStorage.getItem("fnat_usuario") || "anon";

      document.getElementById("rank-pts").style.display = "none";
      document.getElementById("rank-total").textContent = total + " pts";
      document.getElementById("rank-save").textContent = "Guardando...";
      document.getElementById("rank-fin").style.display = "flex";
      document.getElementById("rank-ver").onclick = function () {
        location.href = "ranking.html#noche" + noche;
      };

      guardar({
        usuario: user,
        noche: noche,
        puntuacion: total,
        victoria: victoria,
        hora_final: hora,
        energia_final: Math.floor(energia)
      }).then(function (r) {
        document.getElementById("rank-save").textContent = r.ok ? "Guardado." : "Error al guardar.";
      }).catch(function () {
        document.getElementById("rank-save").textContent = "Sin conexión.";
      });
    }
  };
})();
