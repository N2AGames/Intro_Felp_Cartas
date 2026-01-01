// Configuración de cartas (Imagen + Texto) — ahora con color de fondo para cada carta
const deckData = [
    { image: 'img/pokemons/Agenda2030.png', name: 'Agenda 2030', color: '#3aa76a' },
    { image: 'img/pokemons/Inaki.png', name: 'Iñaki', color: '#4aa3ff' },
    { image: 'img/pokemons/Ramen.png', name: 'Ramen', color: '#ff9a51' },
    { image: 'img/pokemons/Krokocock.png', name: 'Krokocock', color: '#e86d6d' },
    { image: 'img/pokemons/LariosTonic.png', name: 'Larios Tonic', color: '#a05cff' },
    { image: 'img/pokemons/SopaDeAjo.png', name: 'Sopa de ajo', color: '#ffd36b' },
    { image: 'img/pokemons/Tomboy.png', name: 'Tomboy', color: '#6bd3d3' }
];

const container = document.getElementById('deck-container');

// Bucle inicial para crear 5 slots de cartas
for (let i = 0; i < 5; i++) {
    container.innerHTML += `
        <div class="card-container">
            <div class="card" id="card-${i}">
                <div class="card-face">
                    <img src="img/reverso_carta.png" class="back-template">
                </div>
                <div class="card-face card-back">
                    <img src="img/fondo_carta.png" class="back-template">
                    <img id="img-${i}" src="" class="back-content">
                    <div class="back-text">
                        <div class="name-box">
                            <div class="name-left" aria-hidden="true"></div>
                            <div class="name-center">
                                <div id="text-${i}" class="text-display"></div>
                            </div>
                            <div class="name-right" aria-hidden="true"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function tintImage(element, color) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = element.src;

    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const stauration = 0.5;

        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Dibujar imagen original
        ctx.drawImage(img, 0, 0);

        // 2. Obtener los datos de los píxeles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convertir el color Hex/RGB a valores numéricos
        const tint = hexToRgb(color);

        // 3. Iterar sobre los píxeles (de 4 en 4: R, G, B, A)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Umbral para definir qué es "blanco" (255 es blanco puro)
            // Usamos 240 para incluir blancos que no sean perfectos
            const isWhite = r > 240 && g > 240 && b > 240;

            if (!isWhite) {
                // Aplicar el tinte (mezcla simple al 40% como tenías antes)
                data[i]     = r * 0.6 + tint.r * stauration;
                data[i + 1] = g * 0.6 + tint.g * stauration;
                data[i + 2] = b * 0.6 + tint.b * stauration;
            }
        }

        // 4. Volver a poner los píxeles modificados en el canvas
        ctx.putImageData(imageData, 0, 0);
        element.src = canvas.toDataURL();
    };
}

// Función auxiliar para convertir color a RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function flipSequence() {
    // 1. Barajar el mazo para elegir 5 cartas al azar
    const shuffled = [...deckData].sort(() => 0.5 - Math.random());
    const selectedCards = shuffled.slice(0, 5);

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const card = document.getElementById(`card-${i}`);
            const imgElement = document.getElementById(`img-${i}`);
            const textElement = document.getElementById(`text-${i}`);
            const cardBack = card.querySelector('.card-back .back-template');
            const textBoxL = card.querySelector('.back-text .name-left');
            const textBoxC = card.querySelector('.back-text .name-center');
            const textBoxR = card.querySelector('.back-text .name-right');
            // 1. Aplicar el tinte de color al fondo de la carta
            tintImage(cardBack, selectedCards[i].color);
            // 2. Y el del recuadro de texto
            tintImage(textBoxL, selectedCards[i].color);
            tintImage(textBoxC, selectedCards[i].color);
            tintImage(textBoxR, selectedCards[i].color);
            // 3. Cargar los datos de la carta elegida ANTES de que se de la vuelta
            imgElement.src = selectedCards[i].image;
            textElement.innerText = selectedCards[i].name;

            // 4. Lanzar la animación de salto y giro
            card.classList.add('is-flipped');

            setTimeout(() => {
                card.classList.remove('is-flipped');
            }, 8000); // Se quedan abiertas 8 segundos

        }, i * 200); // Salto en ráfaga (0.2s entre cada una)
    }
}

// --- 3. TIEMPO OCULTAS ---
// El ciclo total ahora es más corto tras cerrarse la última carta.
// Sumamos el tiempo de exposición (8000) + la duración del giro.
// Lo ejecutamos cada 12 segundos (antes era proporcionalmente más largo).
setInterval(flipSequence, 12000);
// Primera vez tras un pequeño delay
setTimeout(flipSequence, 1000);

///#region CONTROL DE AUDIO
document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('bg-music');
    const muteBtn = document.getElementById('mute-control');
    const muteIcon = document.getElementById('mute-icon');

    if (music) {
        music.volume = 0.2;
        music.currentTime = 0; // Asegura que empiece en el segundo 0

        // Función para intentar reproducir automáticamente
        const startMusic = () => {
            music.play().then(() => {
                muteIcon.innerText = "🔊";
                muteBtn.style.opacity = "1";
                // Una vez que suena, quitamos los escuchadores globales de inicio
                window.removeEventListener('click', startMusic);
                window.removeEventListener('keydown', startMusic);
            }).catch(err => {
                console.log("Reproducción automática bloqueada. Esperando interacción.");
                muteIcon.innerText = "🔇";
                muteBtn.style.opacity = "0.5";
            });
        };

        // 1. Intentar arrancar ya mismo
        startMusic();

        // 2. Si falla, arrancar al primer clic o tecla (necesario en OBS/Navegadores)
        window.addEventListener('click', startMusic);
        window.addEventListener('keydown', startMusic);

        // 3. Control manual del botón Mute
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita conflictos con el escuchador de ventana
            if (music.paused) {
                startMusic();
            } else {
                music.pause();
                muteIcon.innerText = "🔇";
                muteBtn.style.opacity = "0.5";
            }
        });
    }
});
//#endregion