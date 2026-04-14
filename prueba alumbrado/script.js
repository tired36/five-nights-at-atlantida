// 1. CONFIGURACIÓN DE IMÁGENES (Cambia los nombres aquí)
const assets = {
    roomDark: 'img/sala_oscura.jpg',
    roomLight: 'img/sala_luz.jpg',
    enemyDark: 'img/pje_oscura.jpg',
    enemyLight: 'img/pje_luz.jpg'
};

// 2. VARIABLES DE ESTADO
let isLightOn = false;
let hasEnemy = false;

// Elementos del DOM
const office = document.getElementById('office');
const sndOn = document.getElementById('snd-light-on');
const sndOff = document.getElementById('snd-light-off');

// 3. PRECARGA DE IMÁGENES (Evita parpadeos)
function preloadImages() {
    for (let key in assets) {
        const img = new Image();
        img.src = assets[key];
    }
}
preloadImages();

// 4. LÓGICA DE LA ESCENA
function updateScene() {
    let currentImg = "";

    if (!hasEnemy) {
        currentImg = isLightOn ? assets.roomLight : assets.roomDark;
    } else {
        currentImg = isLightOn ? assets.enemyLight : assets.enemyDark;
    }

    office.style.backgroundImage = `url('${currentImg}')`;
}

// 5. EVENTOS DE MOUSE
window.addEventListener('mousedown', () => {
    isLightOn = true;
    sndOn.currentTime = 0; // Reinicia el sonido si haces click rápido
    sndOn.play();
    updateScene();
});

window.addEventListener('mouseup', () => {
    isLightOn = false;
    sndOff.currentTime = 0;
    sndOff.play();
    updateScene();
});
window.addEventListener('mousedown', () => {
    // Esto inicia el ambiente la primera vez que el usuario interactúa
    document.getElementById('ambience').play();

    isLightOn = true;
    // ... resto del código
});

// 6. CICLO DEL PERSONAJE (Aparición aleatoria)
// Cada 3 segundos, hay un 20% de probabilidad de que aparezca o desaparezca
setInterval(() => {
    const chance = Math.random();

    if (chance < 0.20) {
        hasEnemy = !hasEnemy; // Cambia el estado (aparece/desaparece)
        updateScene();

        // Debug para saber si está ahí (quitar al terminar)
        if (hasEnemy) console.log("El personaje ha entrado...");
    }
}, 3000);

// Inicializar la primera imagen
updateScene();