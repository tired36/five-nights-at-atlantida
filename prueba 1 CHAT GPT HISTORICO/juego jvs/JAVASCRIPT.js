const main = document.getElementById("bg-main");

// GLITCH REAL (oculta partes de la imagen superior)
setInterval(() => {

  if (Math.random() < 0.4) {

    // cortar imagen (clip)
    const top = Math.random() * 100;
    const bottom = Math.random() * 100;

    main.style.clipPath = `inset(${top}% 0 ${bottom}% 0)`;

    // mover ligeramente
    main.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;

    setTimeout(() => {
      main.style.clipPath = "inset(0 0 0 0)";
      main.style.transform = "translate(0,0)";
    }, 100);
  }

}, 200);


// BOTONES
function startGame() {
  alert("Iniciando juego...");
}

function continueGame() {
  alert("Continuar...");
}

function options() {
  alert("Opciones...");
}
const musica = document.getElementById('musicaFondo');

// Función para iniciar la música
const iniciarMusica = () => {
  musica.play().catch(error => {
    console.log("El navegador bloqueó el autoplay, esperando interacción.");
  });
  // Removemos el evento para que no se ejecute cada vez que hagan clic
  document.removeEventListener('click', iniciarMusica);
};

// Escuchar el primer clic en cualquier parte del documento
document.addEventListener('click', iniciarMusica);
musica.volume = 0.5; // Ajusta el volumen al 50%
window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("introVideo");
  const intro = document.getElementById("intro");
  const menu = document.getElementById("menu");

  video.addEventListener("ended", () => {
    intro.style.display = "none";
    menu.style.display = "block";
  });
});
video.addEventListener("ended", () => {
  intro.style.opacity = "0";

  setTimeout(() => {
    intro.style.display = "none";
    menu.style.display = "block";
  }, 1000);
});