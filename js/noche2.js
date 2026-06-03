// === NOCHE 2: Alonso ===
var CONFIG_N2 = { probMovimiento: 0.6, probMovimiento5AM: 0.8, probConCaja: 0.9, audioRetieneSeg: 15, audioRecargaSeg: 25, auraAvisoSeg: 7, auraDanoSeg: 10, auraDanoEnergia: 2, golpePuertaEnergia: 7, gasto: { base: 0.01, camaras: 0.04, linterna: 0.08, puerta: 0.75, retenido: 0.08 } };

function esModoDificil() {
  return window.ModoDificil && ModoDificil.esActivo();
}

function sinCamarasActivo() {
  return !!(window.SinCamaras && SinCamaras.activo && window.FnatSesion && FnatSesion.esDificil());
}

function mostrarSub(texto, duracion) { Util.subtitulo(subtitulo, subTimer, texto, duracion); }
function actualizarUIEnergia() { Util.pintarEnergia(textoEnergia, energia); }
function detenerAudiosApagon() { Util.pararApagon(); }
function reproducirGolpes() { return Util.golpesEnPuerta(); }
// =============================================
    // 4 salas: 1, 2, 3, 4
    // imagenes base sin personaje
    // =============================================
    var escBase = {
      1: { osc: "assets/imagenes/escenarios/sala1/sala1_oscura.jpeg", lin: "assets/imagenes/escenarios/sala1/sala1_linterna.jpeg" },
      2: { osc: "assets/imagenes/escenarios/sala2/sala2_oscura.jpeg", lin: "assets/imagenes/escenarios/sala2/sala2_linterna.png" },
      3: { osc: "assets/imagenes/escenarios/sala3/sala3_oscura.png", lin: "assets/imagenes/escenarios/sala3/sala3_linterna.png" },
      4: { osc: "assets/imagenes/escenarios/sala4/sala4_oscura.png", lin: "assets/imagenes/escenarios/sala4/sala4_linterna.png" }
    };

    // imagenes de alonso en cada sala (donde existen)
    // sala4 no tiene imagen de alonso, se usa imagen base sin personaje
    var escAlonso = {
      1: { osc: "assets/imagenes/escenarios/personajes/alonso/sala1_oscura.jpeg", lin: "assets/imagenes/escenarios/personajes/alonso/sala1_linterna.png" },
      2: { osc: "assets/imagenes/escenarios/personajes/alonso/sala2_oscura.jpeg", lin: "assets/imagenes/escenarios/personajes/alonso/sala2_linterna.png" },
      3: { osc: "assets/imagenes/escenarios/personajes/alonso/sala3_oscura.jpg", lin: "assets/imagenes/escenarios/personajes/alonso/sala3_linterna.jpg" },
      4: { osc: "assets/imagenes/escenarios/personajes/alonso/sala4_oscura.jpg", lin: "assets/imagenes/escenarios/personajes/alonso/sala4_linterna.jpg" }
    };

    // =============================================
    // estado del juego
    // =============================================
    var camActual = 1;
    var linterna = false;
    var puertaCerrada = false;
    var animandoPuerta = false;
    var cancelarVideoPuerta = null;

    function syncRankingEstado() {
      Ranking.syncBloqueos(puertaCerrada || animandoPuerta, alonsoRetenido || audioEnCooldown);
    }
    var hora = 0;
    var energia = 100;

    // alonso empieza en sala 1, se mueve 1->2->3->4->oficina
    var alonsoPos = 1;
    var alonsoRetenido = false;
    var audioEnCooldown = false;

    // contador de segundos mirando la camara de alonso (para el aura)
    var segMirandoAlonso = 0;
    // el hint solo se muestra una vez para no ser pesado
    var hintAuraMostrado = false;
    var juegoTerminado = false;

    // probabilidad de movimiento de alonso (se aumenta a las 5 AM)
    var probabilidadAlonso = 0.6;
    var camaraFallo = false;
    var camaraBloqueada = 0; // camara especifica que queda inservible
    var cajaMusicaActiva = false;
    var camarasDestruidas = false; // fallo global a las 5 AM
    // animacion de alonso saliendo de sala 1 (no bloquea el movimiento)
    var animacionAlonsoSala1Activa = false;

    // =============================================
    // referencias DOM
    // =============================================
    var vistaCam = document.getElementById("vista-camara");
    var panelCamaras = document.getElementById("camaras");
    var videoPuerta = document.getElementById("video-puerta");
    var audioAlonso = document.getElementById("audio-alonso");
    var btnPuerta = document.getElementById("btn-puerta");
    var textoHora = document.getElementById("texto-hora");
    var textoEnergia = document.getElementById("texto-energia");
    var btnAudio = document.getElementById("btn-audio");
    var contadorRet = document.getElementById("contador-retencion");
    var segRet = document.getElementById("seg-retencion");
    var gameOverDiv = document.getElementById("pantalla-gameover");
    var subtitulo = document.getElementById("subtitulo");
    var subTimer = { actual: null };
    var musicaTension = document.getElementById("musica-tension");


    // referencias para el screamer
    var videoScreamer = document.getElementById("video-screamer");
    var pantallaFlashes = document.getElementById("pantalla-flashes");
    var audioGameover = document.getElementById("audio-gameover");

    // =============================================
    // desbloqueo de media para moviles y navegadores estrictos
    // =============================================
    var mediaDesbloqueada = false;
    function desbloquearMedia() {
      if (mediaDesbloqueada) return;
      mediaDesbloqueada = true;
      [videoScreamer, document.getElementById("video-golpes"), document.getElementById("video-golpes-2"), audioGameover, audioAlonso, videoPuerta, musicaTension, document.getElementById("audio-respiracion"), document.getElementById("audio-pasos-corriendo"), document.getElementById("audio-risa"), document.getElementById("audio-demonio"), document.getElementById("audio-respiracion-fnaf"), document.getElementById("audio-caja"), document.getElementById("audio-powerdown"), document.getElementById("audio-sevalaluz"), document.getElementById("audio-linterna")].forEach(function (m) {
        if (!m) return;
        m.muted = true;
        var p = m.play();
        if (p !== undefined) {
          p.then(function () {
            m.pause();
            m.muted = false;
            if (m.id === "musica-tension") {
              m.volume = 0.15;
              m.play().catch(function () { });
            } else {
              m.currentTime = 0;
            }
          }).catch(function () { });
        }
      });
    }
    document.addEventListener("click", desbloquearMedia, { once: true });
    document.addEventListener("touchstart", desbloquearMedia, { once: true });

    document.querySelectorAll("video").forEach(function (v) { Util.prepararVideo(v); });

    var apagonIniciado = false;
    var intervalScreamerLuces = null;

    // =============================================
    // funcion para iniciar el screamer de alonso
    // oculta todo, reproduce el video con luces y luego muestra el game over
    // =============================================
    var ultimaPosRegistrada = alonsoPos;

    function iniciarScreamer(mensaje, usarEspecial) {
      if (juegoTerminado && !usarEspecial) return;
      juegoTerminado = true;

      if (window.Logros) {
        if (mensaje === "te has quedado sin energia..." || usarEspecial) {
          if (usarEspecial) Logros.eventoPartida("apagonPuerta");
          Logros.alMorir({ sinEnergia: true });
        } else {
          Logros.alMorir({ noche: 2 });
        }
      }

      if (intervalParpadeo) {
        clearInterval(intervalParpadeo);
        intervalParpadeo = null;
      }
      if (intervalScreamerLuces) {
        clearInterval(intervalScreamerLuces);
        intervalScreamerLuces = null;
      }

      var flashParpadeo = document.getElementById("pantalla-parpadeo");
      var flashResp = document.getElementById("pantalla-respiracion");
      var audioResp = document.getElementById("audio-respiracion");
      if (flashParpadeo) {
        flashParpadeo.style.display = "none";
        flashParpadeo.style.opacity = "0";
      }
      if (flashResp) {
        flashResp.style.display = "none";
        flashResp.classList.remove("efecto-respiracion");
      }
      if (audioResp) {
        audioResp.pause();
        audioResp.currentTime = 0;
      }
      if (pantallaFlashes) {
        pantallaFlashes.style.display = "none";
        pantallaFlashes.style.opacity = "0";
      }

      document.body.style.filter = "none";
      cerrarCamaras();
      Util.detenerVideos();
      if (!usarEspecial) detenerAudiosApagon();

      document.getElementById("ui-botones").style.display = "none";
      document.getElementById("texto-hora").style.display = "none";
      document.getElementById("texto-noche").style.display = "none";
      document.getElementById("texto-energia").style.display = "none";

      var msgEl = document.getElementById("mensaje-gameover");
      if (msgEl) {
        msgEl.innerText = mensaje ||
          (usarEspecial ? "te has quedado sin energia..." : "alonso ha entrado a la oficina...");
      }

      var vid = videoScreamer;
      if (usarEspecial) {
        vid = document.getElementById("video-screamer-especial") || videoScreamer;
      }

      var audioCaja = document.getElementById("audio-caja");
      if (audioCaja) {
        audioCaja.pause();
        document.querySelectorAll("audio").forEach(function (a) { a.muted = false; });
      }

      function mostrarGameOverTrasScreamer() {
        detenerAudiosApagon();
        if (intervalScreamerLuces) clearInterval(intervalScreamerLuces);
        if (pantallaFlashes) pantallaFlashes.style.display = "none";
        gameOverDiv.style.display = "flex";
        if (audioGameover) {
          audioGameover.currentTime = 0;
          audioGameover.play().catch(function () { });
        }
        Ranking.finPartida({ victoria: false, hora: hora, energia: energia });
      }

      if (!vid) {
        mostrarGameOverTrasScreamer();
        return;
      }

      Util.reproducirVideoUnaVez(vid, mostrarGameOverTrasScreamer, { maxMs: 18000 });
    }



    // =============================================
    // parpadeo de luces en la oficina (se mantiene mientras este en CAM 4)
    // =============================================
    var intervalParpadeo = null;
    function actualizarEfectosCam4() {
      var flash = document.getElementById("pantalla-parpadeo");
      var respVisual = document.getElementById("pantalla-respiracion");
      var audioResp = document.getElementById("audio-respiracion");

      if (!flash || !respVisual) return;

      if (alonsoPos === 4) {
        // efecto parpadeo negro
        if (!intervalParpadeo) {
          flash.style.display = "block";
          intervalParpadeo = setInterval(function () {
            flash.style.opacity = (flash.style.opacity === "0" || flash.style.opacity === "") ? "0.4" : "0";
          }, 100);

          // reproducir audio de pasos al llegar
          var audioPasos = document.getElementById("audio-pasos");
          if (audioPasos) {
            audioPasos.currentTime = 0;
            audioPasos.play().catch(function () { });
          }

          // iniciar respiracion visual y sonora
          respVisual.style.display = "block";
          respVisual.classList.add("efecto-respiracion");
          if (audioResp) {
            audioResp.volume = 0.6;
            audioResp.play().catch(function () { });
          }
        }
      } else {
        if (intervalParpadeo) {
          clearInterval(intervalParpadeo);
          intervalParpadeo = null;
          flash.style.display = "none";
          flash.style.opacity = "0";

          // detener respiracion visual y sonora
          respVisual.style.display = "none";
          respVisual.classList.remove("efecto-respiracion");
          if (audioResp) {
            audioResp.pause();
            audioResp.currentTime = 0;
          }
        }
      }
    }

    // =============================================
    // muestra un subtitulo estilo netflix durante X segundos
    // =============================================

    // =============================================
    // devuelve la imagen correcta para la sala
    // si alonso esta ahi muestra la imagen con el
    // =============================================
    function getImg(sala, usarLinterna) {
      if (sala === alonsoPos) {
        // Usar la imagen de Alonso en la oscuridad para que su presencia sea real pero oculta
        return usarLinterna ? escAlonso[sala].lin : escAlonso[sala].osc;
      }
      return usarLinterna ? escBase[sala].lin : escBase[sala].osc;
    }

    // =============================================
    // distorsion de camara al terminar una animacion
    // =============================================
    function distorsionCamara() {
      // Solo mostrar el glitch si el jugador tiene las camaras subidas
      if (panelCamaras.style.display !== "block") return;

      var estatica = document.getElementById("pantalla-estatica");
      if (!estatica) return;
      estatica.style.display = "block";
      estatica.style.opacity = "1";
      setTimeout(function () {
        estatica.style.opacity = "0";
        setTimeout(function () { estatica.style.display = "none"; }, 200);
      }, 350);
    }

    // =============================================
    // actualiza la imagen de la camara y el boton de audio
    // =============================================
    function actualizarCamara() {
      if (sinCamarasActivo()) return;
      // gestionar visibilidad del video de animacion de alonso (sala 1)
      var videoAnimAlonsoS1 = document.getElementById("video-animacion-alonso-sala1");
      if (videoAnimAlonsoS1) {
        if (animacionAlonsoSala1Activa && camActual === 1) {
          videoAnimAlonsoS1.style.display = "block";
        } else {
          videoAnimAlonsoS1.style.display = "none";
        }
      }
      if (camaraFallo) {
        vistaCam.style.backgroundImage = "url('assets/imagenes/menu/glitch.gif')";
        vistaCam.style.filter = "none";
        if (btnAudio) btnAudio.style.display = "none";
        return;
      }
      if (camaraBloqueada === camActual) {
        vistaCam.style.backgroundImage = "url('assets/imagenes/menu/glitch.gif')";
        vistaCam.style.backgroundColor = "black";
        vistaCam.style.filter = "brightness(0.1) contrast(1.5)";
        if (btnAudio) btnAudio.style.display = "none";
        return;
      }
      // Aplicar filtro de oscuridad dinamico (mas oscuro en salas lejanas)
      var brilloBase = 0.35;
      if (camActual === 3) brilloBase = 0.32;
      if (camActual === 4) brilloBase = 0.22;

      var filtroOscuridad = linterna ? "none" : "brightness(" + brilloBase + ") contrast(1.1)";

      vistaCam.style.filter = filtroOscuridad;
      if (videoAnimAlonsoS1) videoAnimAlonsoS1.style.filter = filtroOscuridad;

      vistaCam.style.backgroundImage = "url('" + getImg(camActual, linterna) + "')";
      // mostrar boton audio solo en la camara de alonso y sin cooldown
      if (btnAudio) {
        if (camActual === alonsoPos && !audioEnCooldown) {
          btnAudio.style.display = "block";
          btnAudio.disabled = false;
        } else {
          btnAudio.style.display = "none";
        }
      }
    }

    // =============================================


    // =============================================
    // cambiar camara activa
    // =============================================
    function cambiarCam(num) {
      if (sinCamarasActivo()) return;
      camActual = num;
      linterna = false;
      segMirandoAlonso = 0; // resetear contador de aura al cambiar
      document.querySelectorAll(".btn-cam").forEach(function (b) { b.classList.remove("activo"); });
      document.getElementById("btn-cam-" + num).classList.add("activo");
      actualizarCamara();
    }

    function abrirCamaras() {
      if (sinCamarasActivo()) return;
      if (energia <= 0 || camarasDestruidas) return;
      panelCamaras.style.display = "block";
      actualizarCamara();
    }

    function cerrarCamaras() {
      // flash de estatica al bajar camaras para generar inseguridad
      var estatica = document.getElementById("pantalla-estatica");
      if (estatica) {
        estatica.style.display = "block";
        setTimeout(function () { estatica.style.display = "none"; }, 200);
      }

      panelCamaras.style.display = "none";
      linterna = false;
      segMirandoAlonso = 0;
      if (contadorRet) contadorRet.style.display = "none";
    }

    // linterna: mantener clic o touch sobre la camara
    vistaCam.addEventListener("mousedown", function () {
      if (energia > 0) {
        linterna = true;
        var aLin = document.getElementById("audio-linterna");
        if (aLin) { aLin.currentTime = 0; aLin.play().catch(function () { }); }
        actualizarCamara();
      }
    });
    vistaCam.addEventListener("mouseup", function () { linterna = false; actualizarCamara(); });
    vistaCam.addEventListener("mouseleave", function () { linterna = false; actualizarCamara(); });
    vistaCam.addEventListener("touchstart", function (e) {
      e.preventDefault();
      if (energia > 0) {
        linterna = true;
        var aLin = document.getElementById("audio-linterna");
        if (aLin) { aLin.currentTime = 0; aLin.play().catch(function () { }); }
        actualizarCamara();
      }
    });
    vistaCam.addEventListener("touchend", function (e) { e.preventDefault(); linterna = false; actualizarCamara(); });

    // =============================================
    // aura de alonso: si llevas 10 segundos seguidos mirando su camara
    // te quita 8 de energia de golpe y el ciclo se repite
    // a los 7 segundos muestra un hint (solo la primera vez)
    // =============================================
    setInterval(function () {
      if (sinCamarasActivo()) return;
      // si no hay camaras abiertas o no miras a alonso, resetear
      if (panelCamaras.style.display !== "block" || camActual !== alonsoPos) {
        segMirandoAlonso = 0;
        return;
      }

      segMirandoAlonso++;

      // hint de aviso la primera vez, a los 7 segundos
      if (segMirandoAlonso === 7 && !hintAuraMostrado) {
        hintAuraMostrado = true;
        mostrarSub("Cuidado... si lo sigues mirando te quitara energia", 3000);
      }

      // a los 10 segundos: drenar 2 de energia y reiniciar el ciclo
      if (segMirandoAlonso >= 10) {
        segMirandoAlonso = 0;
        energia -= 2;
        if (energia < 0) energia = 0;
        actualizarUIEnergia();
        mostrarSub("El aura de Alonso te ha quitado 2 de energia", 2500);
        if (window.Logros) Logros.eventoPartida("aura");
        if (energia <= 0) apagarTodo();
      }
    }, 1000);

    // =============================================
    // mecanica de audio: retiene a alonso 15s, cooldown 25s
    // =============================================
    function usarAudio() {
      if (sinCamarasActivo()) return;
      if (audioEnCooldown || alonsoRetenido || energia <= 0 || alonsoPos >= 4) return;
      if (window.Logros) Logros.eventoPartida("audio", { pos: alonsoPos });
      Ranking.audioActivado();

      audioAlonso.currentTime = 0;
      audioAlonso.play().catch(function () { });

      alonsoRetenido = true;
      audioEnCooldown = true;
      syncRankingEstado();
      btnAudio.disabled = true;
      contadorRet = document.getElementById("contador-retencion-oficina") || contadorRet;
      if (contadorRet) contadorRet.style.display = "block";

      var segundos = CONFIG_N2.audioRetieneSeg;
      var segRecarga = CONFIG_N2.audioRecargaSeg;
      if (segRet) segRet.innerText = segundos;
      var iv = setInterval(function () {
        segundos--;
        if (segRet) segRet.innerText = segundos;
        if (segundos <= 0) {
          clearInterval(iv);
          alonsoRetenido = false;
          syncRankingEstado();
          if (contadorRet) contadorRet.style.display = "none";
          setTimeout(function () {
            audioEnCooldown = false;
            syncRankingEstado();
            if (window.Ranking) Ranking.audioTerminado();
          }, segRecarga * 1000);
        }
      }, 1000);
    }

    // =============================================
    // movimiento de alonso: cada 10s tiene 60% de avanzar
    // ruta: sala1 -> sala2 -> sala3 -> sala4 -> oficina
    // al llegar a sala4 y la puerta esta cerrada, se va a sala aleatoria
    // =============================================
    function intentarMoverAlonso() {
      if (alonsoRetenido || energia <= 0 || juegoTerminado) return;

      // si la caja de musica esta activa, la probabilidad de exito es casi total
      var probActual = cajaMusicaActiva ? 0.9 : probabilidadAlonso;
      if (Math.random() > probActual) return;

      var siguiente = alonsoPos + 1;

      if (siguiente > 4) {
        // Reproducir sonido de pasos para avisar del ataque inminente
        var audioPasos = document.getElementById("audio-pasos-corriendo");
        if (audioPasos) {
          audioPasos.currentTime = 0;
          audioPasos.play().catch(function () { });
        }

        // Damos al menos 2 segundos extra para reaccionar (o 3 si la musica esta activa)
        var delayExtra = (cajaMusicaActiva) ? 3000 : 2000;

        setTimeout(function () {
          if (juegoTerminado || energia <= 0 || alonsoPos !== 4) return;

          if (puertaCerrada) {
            // Si la puerta ya esta cerrada, Alonso choca inmediatamente
            var detenerV = reproducirGolpes();

            energia -= CONFIG_N2.golpePuertaEnergia;
            if (energia < 0) energia = 0;
            actualizarUIEnergia();
            if (window.Logros) Logros.eventoPartida("golpePuerta");
            mostrarSub("Alonso ha golpeado la puerta! Pierdes " + CONFIG_N2.golpePuertaEnergia + "% de energia", 4000);
            if (energia <= 0) apagarTodo();

            var salaRandom = Math.floor(Math.random() * 3) + 1;
            setTimeout(function () {
              alonsoPos = salaRandom;
              actualizarEfectosCam4();
              if (panelCamaras.style.display === "block") actualizarCamara();

              // Detener los golpes 1 segundo despues de que se haya ido
              setTimeout(function () {
                if (detenerV) detenerV();
              }, 1000);
            }, 2000);
          } else if (animandoPuerta) {
            // Si se esta cerrando, no hacemos nada aqui.
            // La funcion togglePuerta() se encargara de Alonso cuando el video termine.
          } else {
            iniciarScreamer();
          }
        }, delayExtra);
        return;
      }

      // si alonso sale de sala 1, reproducir la animacion en cam 1 (sin bloquear el movimiento)
      if (alonsoPos === 1) {
        var videoAnimS1 = document.getElementById("video-animacion-alonso-sala1");
        if (videoAnimS1) {
          animacionAlonsoSala1Activa = true;
          // alonso avanza de inmediato, el video es solo visual
          alonsoPos = siguiente;
          actualizarEfectosCam4();
          if (panelCamaras.style.display === "block") actualizarCamara();

          Util.reproducirVideoUnaVez(videoAnimS1, function () {
            animacionAlonsoSala1Activa = false;
            distorsionCamara();
            if (panelCamaras.style.display === "block") actualizarCamara();
          }, { maxMs: 12000 });
        } else {
          alonsoPos = siguiente;
          actualizarEfectosCam4();
          if (panelCamaras.style.display === "block") actualizarCamara();
        }
        return;
      }

      alonsoPos = siguiente;
      actualizarEfectosCam4();
      if (panelCamaras.style.display === "block") actualizarCamara();
    }

    // bucle normal de movimiento (cada 10s)
    setInterval(intentarMoverAlonso, 10000);

    setInterval(function () {
      if (alonsoPos !== ultimaPosRegistrada) {
        ultimaPosRegistrada = alonsoPos;
        if (window.Logros) Logros.registrarMovimientoSala(alonsoPos);
        if (sinCamarasActivo() && alonsoPos < 4) SinCamaras.pistaMovimiento();
      }
    }, 250);

    // bucle de agresividad extrema (cada 2s) solo activo con la caja de musica
    setInterval(function () {
      if (cajaMusicaActiva && alonsoPos !== 4) intentarMoverAlonso();
    }, 2000);


    // =============================================
    // puerta: cierre con video y apertura
    // =============================================
    function togglePuerta() {
      if (energia <= 0 || animandoPuerta) return;

      if (!puertaCerrada) {
        Ranking.puertaCerrada();
        animandoPuerta = true;
        syncRankingEstado();
        btnPuerta.innerText = "Cerrando...";
        if (cancelarVideoPuerta) cancelarVideoPuerta();
        cancelarVideoPuerta = Util.reproducirVideoUnaVez(videoPuerta, function () {
          if (juegoTerminado || apagonIniciado) return;
          document.body.style.backgroundImage = "url('assets/imagenes/escenarios/sala_principal/oficina_porton.png')";
          puertaCerrada = true;
          animandoPuerta = false;
          syncRankingEstado();
          btnPuerta.innerText = "Abrir Puerta";
          if (alonsoPos === 4) {
            var detenerV = reproducirGolpes();
            energia -= CONFIG_N2.golpePuertaEnergia;
            if (energia < 0) energia = 0;
            actualizarUIEnergia();
            if (window.Logros) Logros.eventoPartida("golpePuerta");
            mostrarSub("Alonso estaba en la puerta y la golpeo! Pierdes " + CONFIG_N2.golpePuertaEnergia + "% de energia", 4000);
            if (energia <= 0) apagarTodo();
            var salaRandom = Math.floor(Math.random() * 3) + 1;
            setTimeout(function () {
              alonsoPos = salaRandom;
              actualizarEfectosCam4();
              if (panelCamaras.style.display === "block") actualizarCamara();
              setTimeout(function () { if (detenerV) detenerV(); }, 1000);
            }, 2000);
          }
        }, { maxMs: 10000 });
      } else {
        if (cancelarVideoPuerta) {
          cancelarVideoPuerta();
          cancelarVideoPuerta = null;
        }
        document.body.style.backgroundImage = "url('assets/imagenes/escenarios/sala_principal/oficina.png')";
        puertaCerrada = false;
        animandoPuerta = false;
        btnPuerta.innerText = "Cerrar Puerta";
        syncRankingEstado();
      }
    }

    // =============================================
    // gasto de energia cada segundo
    // =============================================
    setInterval(function () {
      if (energia <= 0 || juegoTerminado) return;
      var g = CONFIG_N2.gasto;
      var gasto = g.base;
      if (panelCamaras.style.display === "block") gasto += g.camaras;
      if (linterna && panelCamaras.style.display === "block") gasto += g.linterna;
      if (puertaCerrada || animandoPuerta) gasto += g.puerta;
      if (alonsoRetenido) gasto += g.retenido;
      energia -= gasto;
      if (energia < 0) energia = 0;
      actualizarUIEnergia();
      syncRankingEstado();
      Ranking.actualizar(hora);
      if (energia <= 0) apagarTodo();
    }, 1000);

    // =============================================
    // apagon al quedarse sin energia
    // =============================================
    function apagarTodo() {
      if (juegoTerminado || apagonIniciado) return;
      apagonIniciado = true;
      mostrarSub("¡No tienes energía!", 4000);

      var puertaAntes = puertaCerrada;
      panelCamaras.style.display = "none";
      if (cancelarVideoPuerta) {
        cancelarVideoPuerta();
        cancelarVideoPuerta = null;
      }
      videoPuerta.style.display = "none";
      videoPuerta.pause();
      if (audioAlonso) audioAlonso.pause();
      musicaTension.pause();

      // detener musica de la caja y restaurar audios
      var audioCaja = document.getElementById("audio-caja");
      if (audioCaja) {
        audioCaja.pause();
        var todosAudios = document.querySelectorAll('audio');
        todosAudios.forEach(function (a) { a.muted = false; });
      }
      linterna = false;
      puertaCerrada = false;
      animandoPuerta = false;
      syncRankingEstado();

      // Efecto de "luz pobre" y parpadeo en lugar de negro total
      document.body.style.transition = "filter 2s";
      document.body.style.filter = "brightness(0.05) contrast(1.2)";

      // Iniciar un pequeño parpadeo residual de la luz de la oficina
      var flickerApagon = setInterval(function () {
        if (juegoTerminado) {
          clearInterval(flickerApagon);
          return;
        }
        var b = 0.02 + Math.random() * 0.08;
        document.body.style.filter = "brightness(" + b + ") contrast(1.2)";
      }, 150);

      // Secuencia de audios
      var pwrDown = document.getElementById("audio-powerdown");
      var lzOut = document.getElementById("audio-sevalaluz");

      if (pwrDown) {
        pwrDown.play().catch(function () { });
        pwrDown.onended = function () {
          if (lzOut) {
            lzOut.play().catch(function () { });

            // El screamer salta DURANTE la musica de "se va la luz"
            var tiempoParaSusto = 4000 + Math.random() * 4000;
            setTimeout(function () {
              iniciarScreamer("te has quedado sin energia...", puertaAntes);
            }, tiempoParaSusto);
          } else {
            setTimeout(function () {
              iniciarScreamer("te has quedado sin energia...", puertaAntes);
            }, 3000);
          }
        };
      } else {
        setTimeout(function () {
          iniciarScreamer("te has quedado sin energia...", puertaAntes);
        }, 3000);
      }
    }

    // =============================================
    // reloj: 1 hora cada minuto real, ganar a las 6AM
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0) return;
      hora++;
      if (hora >= 6) {
        juegoTerminado = true;

        // ocultar todo
        cerrarCamaras();
        document.getElementById("ui-botones").style.display = "none";
        document.getElementById("texto-hora").style.display = "none";
        document.getElementById("texto-noche").style.display = "none";
        document.getElementById("texto-energia").style.display = "none";
        musicaTension.pause();

        // detener musica de la caja
        var audioCaja = document.getElementById("audio-caja");
        if (audioCaja) audioCaja.pause();

        document.querySelectorAll("audio").forEach(function (a) { a.pause(); });
        Util.detenerVideos();
        var videoGanar = document.getElementById("video-ganar");
        function irAlMenu() {
          Promise.resolve(Ranking.finPartida({ victoria: true, hora: 6, energia: energia })).finally(
            function () {
              if (window.FnatSesion) FnatSesion.ir("menu.html");
              else window.location.href = "menu.html";
            }
          );
        }
        if (videoGanar) {
          Util.reproducirVideoUnaVez(videoGanar, irAlMenu, { maxMs: 20000, ocultar: false });
          videoGanar.onerror = irAlMenu;
        } else {
          irAlMenu();
        }
      } else {
        textoHora.innerText = hora + ":00 AM";
        Ranking.actualizar(hora);

        // mecanica de las 5 AM
        if (hora === 5) {
          if (window.Logros) Logros.eventoPartida("hora5");
          probabilidadAlonso = CONFIG_N2.probMovimiento5AM;
          musicaTension.src = window.FNAT_ASSETS
            ? FNAT_ASSETS.musica.tension5am
            : "assets/musica/tension_5_am.mp3";
          musicaTension.load();
          musicaTension.play().catch(function () { });
          mostrarSub("¡Son las 5 AM! Alonso se ha vuelto extremadamente agresivo...", 5000);

          // evento: destruccion aleatoria de camaras en los proximos 30 segundos
          if (sinCamarasActivo()) return;
          var delayDestruccion = Math.random() * 30000;
          setTimeout(function () {
            camarasDestruidas = true;
            if (window.Logros) Logros.eventoPartida("camarasCaidas");
            cerrarCamaras();
            var btnC = document.getElementById("btn-camaras");
            if (btnC) {
              btnC.innerText = "SISTEMA CORRUPTO";
              btnC.style.color = "#ff0000";
              btnC.style.borderColor = "#ff0000";
              btnC.style.boxShadow = "0 0 10px red";
            }
            // efecto glitch visual al destruir el sistema
            var estatica = document.getElementById("pantalla-estatica");
            if (estatica) {
              estatica.style.display = "block";
              setTimeout(function () { estatica.style.display = "none"; }, 1000);
            }
            var aCorr = document.getElementById("audio-pasos-corriendo");
            if (aCorr) aCorr.play().catch(function () { });
            mostrarSub("ADVERTENCIA: SISTEMA DE CAMARAS DESTRUIDO", 6000);

            // Reparacion automatica tras 15 segundos
            setTimeout(function () {
              if (juegoTerminado) return;
              camarasDestruidas = false;
              if (btnC) {
                btnC.innerText = "Subir Camaras";
                btnC.style.color = "";
                btnC.style.borderColor = "";
                btnC.style.boxShadow = "";
              }
              mostrarSub("SISTEMA DE CAMARAS REINICIADO", 3000);
            }, 15000);
          }, delayDestruccion);
        }
      }
    }, 60000);

    // =============================================
    // parpadeo aleatorio de luces en la oficina (ambiente)
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0 || alonsoPos === 4) return;

      // Probabilidad dinamica: 15% base, 30% a partir de las 4 AM
      var probLuz = (hora >= 4) ? 0.30 : 0.15;

      if (Math.random() < probLuz) {
        var flashAmbiente = document.getElementById("pantalla-parpadeo");
        flashAmbiente.style.display = "block";
        flashAmbiente.style.opacity = "0.3";
        setTimeout(function () {
          if (alonsoPos !== 4) { // no apagar si alonso acaba de llegar
            flashAmbiente.style.opacity = "0";
            setTimeout(function () { flashAmbiente.style.display = "none"; }, 100);
          }
        }, 80 + Math.random() * 150);
      }
    }, 3000);

    // =============================================
    // fallo aleatorio de camaras (3 segundos con sonido)
    // =============================================
    setInterval(function () {
      if (sinCamarasActivo()) return;
      if (juegoTerminado || energia <= 0 || camaraFallo || panelCamaras.style.display !== "block") return;

      // probabilidad dinamica: aumenta a partir de las 3 AM
      var prob = (hora >= 3) ? 0.25 : 0.08;

      if (Math.random() < prob) {
        camaraFallo = true;
        var audioCorr = document.getElementById("audio-pasos-corriendo");
        if (audioCorr) {
          audioCorr.currentTime = 0;
          audioCorr.play().catch(function () { });
        }
        actualizarCamara();
        setTimeout(function () {
          camaraFallo = false;
          if (panelCamaras.style.display === "block") actualizarCamara();
        }, 3000);
      }
    }, 15000);



    // =============================================
    // glitch de mensajes en camaras (5 AM)
    // =============================================
    setInterval(function () {
      if (sinCamarasActivo()) return;
      if (juegoTerminado || energia <= 0 || hora < 5) return;
      // 30% de probabilidad cada 12 segundos
      if (Math.random() < 0.3) {
        var b1 = document.getElementById("btn-cam-1");
        var b2 = document.getElementById("btn-cam-2");
        var b3 = document.getElementById("btn-cam-3");
        var b4 = document.getElementById("btn-cam-4");
        if (!b1 || !b2 || !b3 || !b4) return;

        // Cambiar a mensajes de terror y color rojo
        [b1, b2, b3, b4].forEach(function (b) {
          b.style.color = "#ff0000";
          b.style.borderColor = "#ff0000";
          b.style.textShadow = "0 0 5px red";
        });
        b1.innerText = "SI";
        b2.innerText = "NOS";
        b3.innerText = "MIRAS";
        b4.innerText = "MORIRAS";
        if (window.Logros) Logros.eventoPartida("glitch5am");

        setTimeout(function () {
          b1.innerText = "CAM 1";
          b2.innerText = "CAM 2";
          b3.innerText = "CAM 3";
          b4.innerText = "CAM 4";
          [b1, b2, b3, b4].forEach(function (b) {
            b.style.color = "";
            b.style.borderColor = "";
            b.style.textShadow = "";
          });
        }, 3000);
      }
    }, 12000);

    // =============================================
    // sonidos de ambiente aleatorios (pasos o risa)
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0) return;
      // 30% de probabilidad cada minuto
      if (Math.random() < 0.3) {
        var randomSound = Math.random() < 0.5 ? "audio-pasos-corriendo" : "audio-risa";
        var a = document.getElementById(randomSound);
        if (a) {
          a.currentTime = 0;
          a.play().catch(function () { });
        }
      }
    }, 60000);

    // =============================================
    // parpadeo LARGO aleatorio (efecto tension, independiente de cam 4)
    // igual al efecto de cam 4 pero ocurre de forma random durante la partida
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0 || alonsoPos === 4) return;

      // Probabilidad dinamica: 12% base, 25% a partir de las 3 AM
      var probLargo = (hora >= 3) ? 0.25 : 0.12;

      if (Math.random() < probLargo) {
        var flashLargo = document.getElementById("pantalla-flashes");
        if (!flashLargo || intervalParpadeo) return; // no interferir con el efecto de cam 4

        // duracion aleatoria entre 600ms y 1400ms
        var duracion = 600 + Math.random() * 800;

        flashLargo.style.display = "block";
        flashLargo.style.opacity = "0.5";

        // reproducir audio de pasos con 50% de probabilidad
        if (Math.random() < 0.5) {
          var audioPasosRandom = document.getElementById("audio-pasos");
          if (audioPasosRandom) {
            audioPasosRandom.currentTime = 0;
            audioPasosRandom.play().catch(function () { });
          }
        }

        setTimeout(function () {
          if (alonsoPos !== 4 && !intervalParpadeo) {
            flashLargo.style.opacity = "0";
            setTimeout(function () { flashLargo.style.display = "none"; }, 200);
          }
        }, duracion);
      }
    }, 20000);

    // =============================================
    // bloqueo severo de una camara (70% cada 2 min)
    // =============================================
    setInterval(function () {
      if (sinCamarasActivo()) return;
      if (juegoTerminado || energia <= 0) return;
      // 30% de probabilidad cada 2 minutos
      if (Math.random() < 0.3) {
        camaraBloqueada = Math.floor(Math.random() * 4) + 1; // elige una camara 1-4

        // alternar entre varios sonidos de terror
        var listaSonidos = ["audio-demonio", "audio-pasos-corriendo", "audio-risa", "audio-respiracion-fnaf"];
        var idAzar = listaSonidos[Math.floor(Math.random() * listaSonidos.length)];
        var a = document.getElementById(idAzar);

        if (a) {
          a.currentTime = 0;
          a.play().catch(function () { });
        }
        if (panelCamaras.style.display === "block") actualizarCamara();

        // dura 15 segundos
        setTimeout(function () {
          camaraBloqueada = 0;
          if (panelCamaras.style.display === "block") actualizarCamara();
        }, 15000);
      }
    }, 120000);

    // =============================================
    // respiracion aleatoria de alonso (4 AM en adelante)
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0 || hora < 4) return;
      // 40% de probabilidad cada 20 segundos
      if (Math.random() < 0.4) {
        var a = document.getElementById("audio-respiracion-fnaf");
        if (a) {
          a.currentTime = 0;
          a.play().catch(function () { });
        }
      }
    }, 20000);

    setInterval(function () {
      if (juegoTerminado || energia <= 0 || hora < 5 || cajaMusicaActiva) return;
      // 50% de probabilidad cada 20 segundos
      if (Math.random() < 0.5) {
        var audioCaja = document.getElementById("audio-caja");
        if (audioCaja) {
          cajaMusicaActiva = true;

          // Silenciar todos los demas audios para que solo se oiga la caja
          var todosAudios = document.querySelectorAll('audio');
          todosAudios.forEach(function (a) {
            if (a.id !== "audio-caja") {
              a.muted = true;
            }
          });

          audioCaja.volume = 1.0; // Volumen maximo para la caja
          document.body.classList.add("glitch-caja-activa");
          mostrarSub("¡La caja de musica de Alonso esta sonando! Se ha vuelto loco...", 5000);

          audioCaja.currentTime = 0;
          audioCaja.play().catch(function () { });

          audioCaja.onended = function () {
            cajaMusicaActiva = false;
            // Restaurar el sonido de los demas audios
            todosAudios.forEach(function (a) {
              a.muted = false;
            });
            document.body.classList.remove("glitch-caja-activa");
            mostrarSub("La musica se ha detenido...", 3000);
          };
        }
      }
    }, 20000);

    // =============================================
    // efecto reloj roto (5 AM)
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0 || hora < 5) return;

      var clock = document.getElementById("texto-hora");
      if (!clock) return;

      // 40% de probabilidad cada 4 segundos de glitch visual
      if (Math.random() < 0.4) {
        var glitches = ["5:?? AM", "??:?? AM", "6:66 AM", "#$:%& AM", "ERROR", "5:-- AM", "88:88"];
        var originalText = "5:00 AM";
        clock.innerText = glitches[Math.floor(Math.random() * glitches.length)];
        clock.style.color = "#ff3333";
        clock.style.textShadow = "0 0 8px red";

        setTimeout(function () {
          if (hora === 5 && !juegoTerminado) {
            clock.innerText = "5:00 AM";
            clock.style.color = "white";
            clock.style.textShadow = "none";
          }
        }, 600 + Math.random() * 1200);
      }
    }, 4000);

    // =============================================
    // Parpadeo de linterna (baja energia < 30%)
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0 || camaraFallo || (typeof camaraBloqueada !== 'undefined' && camaraBloqueada !== 0)) return;

      if (linterna && energia < 30) {
        // Generar un parpadeo aleatorio si la energia es baja
        var b = 0.2 + Math.random() * 0.9;
        vistaCam.style.filter = "brightness(" + b + ")";
      } else if (linterna && energia >= 30) {
        if (vistaCam.style.filter.includes("brightness")) {
          vistaCam.style.filter = "none";
        }
      }
    }, 60);

    if (window.SinCamaras) SinCamaras.revertir();
    if (esModoDificil()) {
      SinCamaras.aplicar({
        noche: 2,
        config: CONFIG_N2,
        panelCamaras: panelCamaras,
        btnCamaras: document.getElementById("btn-camaras"),
        textoNoche: document.getElementById("texto-noche")
      });
    }
    btnAudio = document.getElementById("btn-audio");
    contadorRet =
      document.getElementById("contador-retencion") || contadorRet;
    probabilidadAlonso = CONFIG_N2.probMovimiento;

    if (window.Logros) Logros.resetPartida();

    if (esModoDificil()) {
      ModoDificil.aplicarExtras({ noche: 2, textoNoche: document.getElementById("texto-noche") });
      Ranking.init(2, { modo: "dificil" });
    } else {
      Ranking.init(2);
    }