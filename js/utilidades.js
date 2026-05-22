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
  }
};
