// === NOCHE 1: German ===
var CONFIG_N1 = { probMovimiento: 0.3, probMovimiento5AM: 0.6, audioRetieneSeg: 20, audioRecargaSeg: 30, auraAvisoSeg: 10, auraDanoSeg: 13, auraDanoEnergia: 1, golpePuertaEnergia: 5, gasto: { base: 0.01, camaras: 0.02, linterna: 0.05, puerta: 0.75, retenido: 0.05 } };

function esModoDificil() {
  return window.ModoDificil && ModoDificil.esActivo();
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

    // imagenes de german en cada sala (donde existen)
    var escGerman = {
      1: { osc: "assets/imagenes/escenarios/personajes/german/sala1_oscura.jpg", lin: "assets/imagenes/escenarios/personajes/german/sala1_linterna.jpg" },
      2: { osc: "assets/imagenes/escenarios/personajes/german/sala2_oscura.png", lin: "assets/imagenes/escenarios/personajes/german/sala2_linterna.png" },
      3: { osc: "assets/imagenes/escenarios/personajes/german/sala3_oscura.png", lin: "assets/imagenes/escenarios/personajes/german/sala3_linterna.png" },
      4: { osc: "assets/imagenes/escenarios/personajes/german/sala4_oscura.png", lin: "assets/imagenes/escenarios/personajes/german/sala4_linterna.png" }
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
      Ranking.syncBloqueos(puertaCerrada || animandoPuerta, germanRetenido || audioEnCooldown);
    }
    var hora = 0;
    var energia = 100;

    // german empieza en sala 1, se mueve 1->2->3->4->oficina
    var germanPos = 1;
    var germanRetenido = false;
    var audioEnCooldown = false;

    // contador de segundos mirando la camara de german (para el aura)
    var segMirandoGerman = 0;
    // el hint solo se muestra una vez para no ser pesado
    var hintAuraMostrado = false;
    var juegoTerminado = false;

    // animacion de german saliendo de sala 1
    var animacionGermanActiva = false;
    // animacion de german saliendo de sala 2 (no bloquea el movimiento)
    var animacionGermanSala2Activa = false;

    // probabilidad de movimiento de german (se aumenta a las 5 AM)
    var probabilidadGerman = 0.3;
    var camaraFallo = false;
    var camaraBloqueada = 0; // camara especifica que queda inservible
    var camarasDestruidas = false; // fallo global a las 5 AM

    // =============================================
    // referencias DOM
    // =============================================
    var vistaCam = document.getElementById("vista-camara");
    var panelCamaras = document.getElementById("camaras");
    var videoPuerta = document.getElementById("video-puerta");
    var audioGerman = document.getElementById("audio-german");
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
    var audioGameover = document.getElementById("audio-gameover");

    // =============================================
    // desbloqueo de media para moviles y navegadores estrictos
    // =============================================
    var mediaDesbloqueada = false;
    function desbloquearMedia() {
      if (mediaDesbloqueada) return;
      mediaDesbloqueada = true;
      [videoScreamer, document.getElementById("video-screamer-2"), document.getElementById("video-screamer-especial"), document.getElementById("video-golpes"), document.getElementById("video-golpes-2"), audioGameover, audioGerman, videoPuerta, musicaTension, document.getElementById("audio-pasos-corriendo"), document.getElementById("audio-risa"), document.getElementById("audio-demonio"), document.getElementById("audio-respiracion-amb"), document.getElementById("audio-powerdown"), document.getElementById("audio-sevalaluz"), document.getElementById("audio-linterna")].forEach(function (m) {
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

    // =============================================
    // funcion para iniciar el screamer de german
    // oculta todo, reproduce el video con luces y luego muestra el game over
    // =============================================
    var ultimaPosRegistrada = germanPos;

    function iniciarScreamer(mensaje, usarEspecial) {
      if (juegoTerminado && !usarEspecial) return;
      juegoTerminado = true;

      if (window.Logros) {
        if (mensaje === "te has quedado sin energia..." || usarEspecial) {
          Logros.alMorir({ sinEnergia: true });
        } else {
          Logros.alMorir({ noche: 1 });
        }
      }

      if (intervalParpadeo) {
        clearInterval(intervalParpadeo);
        intervalParpadeo = null;
      }
      var flash = document.getElementById("pantalla-flashes");
      if (flash) flash.style.display = "none";

      document.body.style.filter = "none";
      cerrarCamaras();
      Util.detenerVideos();
      if (!usarEspecial) detenerAudiosApagon();

      document.getElementById("ui-botones").style.display = "none";
      document.getElementById("texto-hora").style.display = "none";
      document.getElementById("texto-noche").style.display = "none";
      document.getElementById("texto-energia").style.display = "none";

      document.getElementById("mensaje-gameover").innerText = mensaje ||
        (usarEspecial ? "te has quedado sin energia..." : "german ha entrado a la oficina...");

      var vid = videoScreamer;
      if (usarEspecial) {
        vid = document.getElementById("video-screamer-especial") || videoScreamer;
      } else if (mensaje !== "te has quedado sin energia..." && Math.random() < 0.5) {
        vid = document.getElementById("video-screamer-2") || videoScreamer;
      }
      if (!vid) return;

      Util.reproducirVideoUnaVez(vid, function () {
        detenerAudiosApagon();
        gameOverDiv.style.display = "flex";
        audioGameover.currentTime = 0;
        audioGameover.play().catch(function () { });
        Ranking.finPartida({ victoria: false, hora: hora, energia: energia });
      }, { maxMs: 18000 });
    }



    // =============================================
    // parpadeo de luces en la oficina (se mantiene mientras este en CAM 4)
    // =============================================
    var intervalParpadeo = null;
    function actualizarEfectosCam4() {
      var flash = document.getElementById("pantalla-flashes");
      if (!flash) return;
      if (germanPos === 4) {
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
        }
      } else {
        if (intervalParpadeo) {
          clearInterval(intervalParpadeo);
          intervalParpadeo = null;
          flash.style.display = "none";
          flash.style.opacity = "0";
        }
      }
    }

    // =============================================
    // muestra un subtitulo estilo netflix durante X segundos
    // =============================================

    // =============================================
    // devuelve la imagen correcta para la sala
    // si german esta ahi muestra la imagen con el
    // =============================================
    function getImg(sala, usarLinterna) {
      if (sala === germanPos) {
        // Usar la imagen de German en la oscuridad para que su presencia sea real pero oculta
        return usarLinterna ? escGerman[sala].lin : escGerman[sala].osc;
      }
      return usarLinterna ? escBase[sala].lin : escBase[sala].osc;
    }

    // =============================================
    // distorsion de camara al terminar una animacion de german
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
      // gestionar visibilidad del video de animacion de german (sala 1)
      var videoAnimGerman = document.getElementById("video-animacion-german");
      if (videoAnimGerman) {
        if (animacionGermanActiva && camActual === 1) {
          videoAnimGerman.style.display = "block";
        } else {
          videoAnimGerman.style.display = "none";
        }
      }

      // gestionar visibilidad del video de animacion de german (sala 2)
      var videoAnimGermanS2 = document.getElementById("video-animacion-german-sala2");
      if (videoAnimGermanS2) {
        if (animacionGermanSala2Activa && camActual === 2) {
          videoAnimGermanS2.style.display = "block";
        } else {
          videoAnimGermanS2.style.display = "none";
        }
      }

      if (camaraFallo) {
        vistaCam.style.backgroundImage = "url('assets/imagenes/menu/glitch.gif')";
        vistaCam.style.filter = "none";
        btnAudio.style.display = "none";
        return;
      }
      if (camaraBloqueada === camActual) {
        vistaCam.style.backgroundImage = "url('assets/imagenes/menu/glitch.gif')";
        vistaCam.style.backgroundColor = "black";
        vistaCam.style.filter = "brightness(0.1) contrast(1.5)";
        btnAudio.style.display = "none";
        return;
      }
      // Aplicar filtro de oscuridad dinamico (mas oscuro en salas lejanas)
      var brilloBase = 0.35;
      if (camActual === 3) brilloBase = 0.32;
      if (camActual === 4) brilloBase = 0.25;

      var filtroOscuridad = linterna ? "none" : "brightness(" + brilloBase + ") contrast(1.1)";

      vistaCam.style.filter = filtroOscuridad;
      if (videoAnimGerman) videoAnimGerman.style.filter = filtroOscuridad;
      if (videoAnimGermanS2) videoAnimGermanS2.style.filter = filtroOscuridad;

      vistaCam.style.backgroundImage = "url('" + getImg(camActual, linterna) + "')";
      // mostrar boton audio solo en la camara de german y sin cooldown
      if (camActual === germanPos && !audioEnCooldown) {
        btnAudio.style.display = "block";
        btnAudio.disabled = false;
      } else {
        btnAudio.style.display = "none";
      }
    }

    // =============================================
    // resalta en rojo el boton de la camara donde esta german
    // =============================================


    // =============================================
    // cambiar camara activa
    // =============================================
    function cambiarCam(num) {
      if (esModoDificil()) return;
      camActual = num;
      linterna = false;
      segMirandoGerman = 0; // resetear contador de aura al cambiar
      document.querySelectorAll(".btn-cam").forEach(function (b) { b.classList.remove("activo"); });
      document.getElementById("btn-cam-" + num).classList.add("activo");
      actualizarCamara();
    }

    function abrirCamaras() {
      if (esModoDificil()) return;
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
      segMirandoGerman = 0;
      contadorRet.style.display = "none";
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
    // aura de german: si llevas 13 segundos seguidos mirando su camara
    // te quita 5 de energia de golpe y el ciclo se repite
    // a los 10 segundos muestra un hint (solo la primera vez)
    // =============================================
    setInterval(function () {
      // si no hay camaras abiertas o no miras a german, resetear
      if (panelCamaras.style.display !== "block" || camActual !== germanPos) {
        segMirandoGerman = 0;
        return;
      }

      segMirandoGerman++;

      // hint de aviso la primera vez, a los 10 segundos
      if (segMirandoGerman === 10 && !hintAuraMostrado) {
        hintAuraMostrado = true;
        mostrarSub("Cuidado... si lo sigues mirando te quitara energia", 3000);
      }

      // a los 13 segundos: drenar 1 de energia y reiniciar el ciclo
      if (segMirandoGerman >= 13) {
        segMirandoGerman = 0;
        energia -= 1;
        if (energia < 0) energia = 0;
        actualizarUIEnergia();
        mostrarSub("El aura de German te ha quitado 1 de energia", 2500);
        if (energia <= 0) apagarTodo();
      }
    }, 1000);

    // =============================================
    // mecanica de audio: retiene a german 20s, cooldown 30s
    // =============================================
    function usarAudio() {
      if (audioEnCooldown || germanRetenido || energia <= 0) return;
      Ranking.audioActivado();

      // reproducir audio de german
      audioGerman.currentTime = 0;
      audioGerman.play().catch(function () { });

      germanRetenido = true;
      audioEnCooldown = true;
      syncRankingEstado();
      btnAudio.disabled = true;
      contadorRet.style.display = "block";

      var segundos = 20;
      segRet.innerText = segundos;
      var iv = setInterval(function () {
        segundos--;
        segRet.innerText = segundos;
        if (segundos <= 0) {
          clearInterval(iv);
          germanRetenido = false;
          syncRankingEstado();
          contadorRet.style.display = "none";
          // cooldown de 30s antes de poder usar el audio de nuevo
          setTimeout(function () {
            audioEnCooldown = false;
            syncRankingEstado();
            if (panelCamaras.style.display === "block") actualizarCamara();
          }, 30000);
        }
      }, 1000);

      actualizarCamara();
    }

    // =============================================
    // movimiento de german: cada 10s tiene 30% de avanzar
    // ruta: sala1 -> sala2 -> sala3 -> sala4 -> oficina
    // al llegar a sala4 y la puerta esta cerrada, se va a sala aleatoria
    // =============================================
    // Movimiento normal de German (Sala 1 -> 2 -> 3 -> 4) cada 10s
    setInterval(function () {
      if (germanRetenido || energia <= 0 || juegoTerminado || animacionGermanActiva || germanPos >= 4) return;
      if (Math.random() > probabilidadGerman) return;

      var siguiente = germanPos + 1;

      // si german sale de sala 1, reproducir la animacion en cam 1
      if (germanPos === 1) {
        var videoAnimGerman = document.getElementById("video-animacion-german");
        animacionGermanActiva = true;
        // mostrar el video si el jugador esta viendo cam 1
        if (panelCamaras.style.display === "block") actualizarCamara();

        if (videoAnimGerman) {
          Util.reproducirVideoUnaVez(videoAnimGerman, function () {
            animacionGermanActiva = false;
            germanPos = siguiente;
            distorsionCamara();
            actualizarEfectosCam4();
            if (panelCamaras.style.display === "block") actualizarCamara();
          }, { maxMs: 12000 });
        } else {
          // si no hay video, mover directamente
          animacionGermanActiva = false;
          germanPos = siguiente;
          actualizarEfectosCam4();
          if (panelCamaras.style.display === "block") actualizarCamara();
        }
        return;
      }

      // si german sale de sala 2, reproducir la animacion en cam 2 (sin bloquear el movimiento)
      if (germanPos === 2) {
        var videoAnimS2 = document.getElementById("video-animacion-german-sala2");
        if (videoAnimS2) {
          animacionGermanSala2Activa = true;
          // german avanza de inmediato, el video es solo visual
          germanPos = siguiente;
          actualizarEfectosCam4();
          if (panelCamaras.style.display === "block") actualizarCamara();

          Util.reproducirVideoUnaVez(videoAnimS2, function () {
            animacionGermanSala2Activa = false;
            distorsionCamara();
            if (panelCamaras.style.display === "block") actualizarCamara();
          }, { maxMs: 12000 });
        } else {
          germanPos = siguiente;
          actualizarEfectosCam4();
          if (panelCamaras.style.display === "block") actualizarCamara();
        }
        return;
      }

      // si german sale de sala 3, glitch y mover sin video
      if (germanPos === 3) {
        germanPos = siguiente;
        actualizarEfectosCam4();
        distorsionCamara();
        if (panelCamaras.style.display === "block") actualizarCamara();
        return;
      }

      // german avanza a la siguiente sala (sin animacion)
      germanPos = siguiente;
      actualizarEfectosCam4();
      if (panelCamaras.style.display === "block") actualizarCamara();

    }, 10000);

    setInterval(function () {
      if (germanPos !== ultimaPosRegistrada) {
        ultimaPosRegistrada = germanPos;
        if (window.Logros) Logros.registrarMovimientoSala(germanPos);
        if (esModoDificil() && germanPos < 4) ModoDificil.pistaMovimiento();
      }
    }, 250);

    setInterval(function () {
      if (germanPos !== 4 || germanRetenido || energia <= 0 || juegoTerminado) return;

      // Reproducir sonido de pasos para avisar del ataque inminente
      var audioPasos = document.getElementById("audio-pasos-corriendo");
      if (audioPasos) {
        audioPasos.currentTime = 0;
        audioPasos.play().catch(function () { });
      }

      // Dar una ventana de 2 segundos para reaccionar y cerrar la puerta
      setTimeout(function () {
        if (germanPos !== 4 || germanRetenido || energia <= 0 || juegoTerminado) return;

        if (puertaCerrada) {
          // Si la puerta ya esta cerrada, German choca inmediatamente
          var detenerV = reproducirGolpes();

          // drena energia y se va
          energia -= 5;
          if (energia < 0) energia = 0;
          actualizarUIEnergia();
          mostrarSub("German ha golpeado la puerta! Pierdes 5% de energia", 4000);
          if (energia <= 0) apagarTodo();

          var salaRandom = Math.floor(Math.random() * 3) + 1; // 1, 2 o 3
          setTimeout(function () {
            germanPos = salaRandom;
            actualizarEfectosCam4();
            if (panelCamaras.style.display === "block") actualizarCamara();

            // Detener los golpes 1 segundo despues de que se haya ido
            setTimeout(function () {
              if (detenerV) detenerV();
            }, 1000);
          }, 2000);
        } else if (animandoPuerta) {
          // Si se esta cerrando, no hacemos nada aqui.
          // La funcion togglePuerta() se encargara de German cuando el video termine.
        } else {
          // puerta abierta y sin cerrar: inicia the screamer (muerte)
          iniciarScreamer();
        }
      }, 2000);
    }, 13000);

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
          if (germanPos === 4) {
            var detenerV = reproducirGolpes();
            energia -= 5;
            if (energia < 0) energia = 0;
            actualizarUIEnergia();
            mostrarSub("German estaba en la puerta y la golpeo! Pierdes 5% de energia", 4000);
            if (energia <= 0) apagarTodo();
            var salaRandom = Math.floor(Math.random() * 3) + 1;
            setTimeout(function () {
              germanPos = salaRandom;
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
      var gasto = 0.01;
      if (panelCamaras.style.display === "block") gasto += 0.02;
      if (linterna) gasto += 0.05;
      if (puertaCerrada || animandoPuerta) gasto += 0.75;
      if (germanRetenido) gasto += 0.05;
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

      var murioConPuertaCerrada = puertaCerrada || animandoPuerta;

      panelCamaras.style.display = "none";
      if (cancelarVideoPuerta) {
        cancelarVideoPuerta();
        cancelarVideoPuerta = null;
      }
      videoPuerta.style.display = "none";
      videoPuerta.pause();
      if (audioGerman) audioGerman.pause();
      musicaTension.pause();
      linterna = false;
      puertaCerrada = false;
      animandoPuerta = false;
      syncRankingEstado();

      // Efecto de "luz pobre" y parpadeo en lugar de negro total
      document.body.style.transition = "filter 2s";
      document.body.style.filter = "brightness(0.05) contrast(1.2)";

      // Iniciar un pequeÃ±o parpadeo residual de la luz de la oficina
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

            // El screamer salta DURANTE la mÃºsica de "se va la luz"
            // (entre 4 y 8 segundos despuÃ©s de empezar la mÃºsica)
            var tiempoParaSusto = 4000 + Math.random() * 4000;
            setTimeout(function () {
              iniciarScreamer("te has quedado sin energia...", murioConPuertaCerrada);
            }, tiempoParaSusto);
          } else {
            setTimeout(function () {
              iniciarScreamer("te has quedado sin energia...", murioConPuertaCerrada);
            }, 3000);
          }
        };
      } else {
        // Fallback si no cargan los audios
        setTimeout(function () {
          iniciarScreamer("te has quedado sin energia...");
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

        if (window.Logros) {
          Logros.desbloquear("noche1");
          if (energia > 20) Logros.desbloquear("energia20");
        }

        // ocultar todo
        cerrarCamaras();
        document.getElementById("ui-botones").style.display = "none";
        document.getElementById("texto-hora").style.display = "none";
        document.getElementById("texto-noche").style.display = "none";
        document.getElementById("texto-energia").style.display = "none";
        
        document.querySelectorAll("audio").forEach(function (a) { a.pause(); });
        Util.detenerVideos();
        var videoGanar = document.getElementById("video-ganar");
        function irAlMenu() {
          Ranking.finPartida({ victoria: true, hora: 6, energia: energia });
          window.location.href = "menu.html";
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
          probabilidadGerman = 0.6; // mas agresivo
          musicaTension.src = "assets/musica/tension 5 am.mp3";
          musicaTension.load();
          musicaTension.play().catch(function () { });
          mostrarSub("Â¡Son las 5 AM! German se ha vuelto extremadamente agresivo...", 5000);

          // evento: destruccion aleatoria de camaras en los proximos 30 segundos
          if (esModoDificil()) return;
          var delayDestruccion = Math.random() * 30000;
          setTimeout(function () {
            camarasDestruidas = true;
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
            mostrarSub("ADVERTENCIA: SISTEMA DE CÃMARAS DESTRUIDO", 6000);

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
              mostrarSub("SISTEMA DE CÃMARAS REINICIADO", 3000);
            }, 15000);
          }, delayDestruccion);
        }
      }
    }, 60000);

    // =============================================
    // parpadeo aleatorio de luces en la oficina (ambiente corto)
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0 || germanPos === 4) return;

      // Probabilidad dinamica: 15% base, 30% a partir de las 4 AM
      var probLuz = (hora >= 4) ? 0.30 : 0.15;

      if (Math.random() < probLuz) {
        var flashAmbiente = document.getElementById("pantalla-flashes");
        flashAmbiente.style.display = "block";
        flashAmbiente.style.opacity = "0.3";
        setTimeout(function () {
          if (germanPos !== 4) {
            flashAmbiente.style.opacity = "0";
            setTimeout(function () { flashAmbiente.style.display = "none"; }, 100);
          }
        }, 80 + Math.random() * 150);
      }
    }, 3000);

    // =============================================
    // parpadeo LARGO aleatorio (efecto tension, independiente de cam 4)
    // igual al efecto de cam 4 pero ocurre de forma random durante la partida
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0 || germanPos === 4) return;

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
          if (germanPos !== 4 && !intervalParpadeo) {
            flashLargo.style.opacity = "0";
            setTimeout(function () { flashLargo.style.display = "none"; }, 200);
          }
        }, duracion);
      }
    }, 20000);

    // =============================================
    // fallo aleatorio de camaras (3 segundos con sonido)
    // =============================================
    setInterval(function () {
      if (esModoDificil()) return;
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
    // bloqueo severo de una camara (70% cada 2 min)
    // =============================================
    setInterval(function () {
      if (juegoTerminado || energia <= 0) return;
      // 30% de probabilidad cada 2 minutos
      if (Math.random() < 0.3) {
        camaraBloqueada = Math.floor(Math.random() * 4) + 1; // elige una camara 1-4

        // alternar entre varios sonidos de terror
        var listaSonidos = ["audio-demonio", "audio-pasos-corriendo", "audio-risa", "audio-respiracion-amb"];
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
    }, 12000);

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
        var b = 0.2 + Math.random() * 0.9; // Brillo muy variable para dar miedo
        vistaCam.style.filter = "brightness(" + b + ")";
      } else if (linterna && energia >= 30) {
        // Asegurar que vuelve a la normalidad si la energÃ­a sube (aunque no suele subir)
        // o si simplemente estaba parpadeando y ya no
        if (vistaCam.style.filter.includes("brightness")) {
          vistaCam.style.filter = "none";
        }
      }
    }, 60);

    if (esModoDificil()) {
      ModoDificil.aplicarSinCamaras({
        noche: 1,
        panelCamaras: panelCamaras,
        btnCamaras: document.getElementById("btn-camaras"),
        textoNoche: document.getElementById("texto-noche")
      });
      Ranking.init(1, { modo: "dificil" });
    } else {
      Ranking.init(1);
    }
    if (window.Logros) Logros.initEsquina();