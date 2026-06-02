(function () {
  var M = "assets/musica/";
  var V = "assets/videos/";
  var A = V + "animaciones_de_camaras/";

  window.FNAT_ASSETS = {
    musica: {
      sonidoFondo: M + "sonido_de_fondo.mp3",
      pasos: M + "pasos.mp3",
      pasosCorriendo: M + "PASOS_CORRIENDO.mp3",
      risaNino: M + "risa_de_niño.mp3",
      demonioRisa: M + "demonio_risa.mp3",
      respiracionProfunda: M + "respiracion_profunda.mp3",
      respiracionAlonso: M + "respiracion_alonso.mp3",
      respiracionAlonsoFnaf: M + "RESPIRACION_ALONSO_fnaf.mp3",
      cajaAlonso: M + "caja_de_musica_de_alonso.mp3",
      powerdown: M + "powerdown.mp3",
      seVaLaLuz: M + "se_va_la_luz.mp3",
      linterna: M + "linterna.mp3",
      germanAudio: M + "german_audio.mp4",
      audioAlonso: M + "audioalonso.mp3",
      musicaMickey: M + "musica_mickey.mp4",
      tension5am: M + "tension_5_am.mp3",
      tensionCarta: M + "tension_carta.mp3"
    },
    videos: {
      porton: V + "video_porton_bajando.mp4",
      golpes: V + "golpes_en_la_puerta.mp4",
      golpes2: V + "golpes_en_la_puerta_2.mp4",
      screamerGerman: V + "SCREAMER_GERMAN.mp4",
      screamerGerman2: V + "screamer_german_numero_2.mp4",
      screamerAlonso: V + "screamer_alonso.mp4",
      sinEnergiaPuerta: V + "sin_energia_puerta_cerrada.mp4",
      ganar: V + "ganar.mp4",
      intro: V + "intro.mp4",
      germanSala1: A + "germansala1.mp4",
      germanSala2: A + "germansala2.mp4",
      germanSala3: A + "germansala3.mp4",
      alonsoSala1: A + "alonsosala1.mp4"
    }
  };

  /** Asigna src a elementos por id según el mapa de assets del juego */
  window.FNAT_applyGameMedia = function (map) {
    map = map || {};
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && map[id]) el.src = map[id];
    });
  };
})();
