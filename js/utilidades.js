// Funciones comunes del juego (ambas noches)
window.Util = {
  /** Busca un elemento por id */
  $(id) {
    return document.getElementById(id);
  },

  /** Muestra texto abajo tipo subtítulo */
  subtitulo(contenedor, timer, texto, duracionMs) {
    clearTimeout(timer.actual);
    contenedor.innerText = texto;
    contenedor.style.display = "block";
    contenedor.style.opacity = "1";
    timer.actual = setTimeout(() => {
      contenedor.style.opacity = "0";
      setTimeout(() => { contenedor.style.display = "none"; }, 400);
    }, duracionMs || 3000);
  },

  /** Actualiza el texto de energía y el color de aviso */
  pintarEnergia(elemento, energia) {
    if (!elemento) return;
    elemento.innerText = "energia: " + Math.floor(energia) + "%";
    if (energia < 20) {
      elemento.style.color = "#ff0000";
      elemento.style.fontWeight = "bold";
      elemento.style.textShadow = "0 0 10px red";
    } else {
      elemento.style.color = "white";
      elemento.style.fontWeight = "normal";
      elemento.style.textShadow = "none";
    }
  },

  /** Para el audio de apagón */
  pararApagon() {
    const apagon = Util.$("audio-powerdown");
    const luz = Util.$("audio-sevalaluz");
    if (apagon) { apagon.pause(); apagon.currentTime = 0; }
    if (luz) { luz.pause(); luz.currentTime = 0; }
  },

  /** Reproduce golpes en la puerta; devuelve función para pararlos */
  golpesEnPuerta() {
    const v1 = Util.$("video-golpes");
    const v2 = Util.$("video-golpes-2");
    if (!v1 || !v2) return null;
    const video = Math.random() < 0.5 ? v1 : v2;
    video.style.display = "block";
    video.currentTime = 0;
    video.loop = true;
    video.play().catch(() => {});
    return () => {
      video.pause();
      video.style.display = "none";
      video.loop = false;
    };
  },

  /** Prepara un video para reproducción fiable */
  prepararVideo(video) {
    if (!video) return;
    video.preload = "auto";
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.loop = false;
  },

  /** Para y oculta todos los videos excepto uno opcional */
  detenerVideos(exceptoId) {
    document.querySelectorAll("video").forEach((v) => {
      if (exceptoId && v.id === exceptoId) return;
      v.onended = null;
      v.ontimeupdate = null;
      v.pause();
      v.loop = false;
      v.style.display = "none";
    });
  },

  /**
   * Reproduce un video una vez y llama alTerminar (con timeout por si onended no dispara).
   * Devuelve función cancelar.
   */
  reproducirVideoUnaVez(video, alTerminar, opts) {
    opts = opts || {};
    if (!video) {
      if (alTerminar) alTerminar();
      return () => {};
    }

    const maxMs = opts.maxMs || 30000;
    let hecho = false;

    function terminar() {
      if (hecho) return;
      hecho = true;
      clearTimeout(timer);
      video.onended = null;
      video.ontimeupdate = null;
      video.pause();
      video.loop = false;
      if (opts.ocultar !== false) video.style.display = "none";
      if (alTerminar) alTerminar();
    }

    Util.detenerVideos(video.id);
    Util.prepararVideo(video);
    video.loop = false;
    if (opts.mostrar !== false) video.style.display = "block";
    video.currentTime = 0;

    function intentarPlay() {
      const p = video.play();
      if (p && p.catch) {
        p.catch(() => {
          video.muted = true;
          video.play().then(() => {
            if (!opts.mantenerMuted) video.muted = false;
          }).catch(terminar);
        });
      }
    }

    video.onended = terminar;
    video.ontimeupdate = () => {
      const d = video.duration;
      if (d && isFinite(d) && video.currentTime >= d - 0.25) terminar();
    };

    const timer = setTimeout(terminar, maxMs);
    intentarPlay();
    return terminar;
  }
};
