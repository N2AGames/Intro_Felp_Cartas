// Configuración de cartas (Imagen + Texto) — ahora con color de fondo para cada carta
const deckData = [
    { image: 'img/pokemons/Agenda2030.png', name: 'Agenda 2030', color: '#214586' },
    { image: 'img/pokemons/Inaki.png', name: 'Iñaki', color: '#8f0000' },
    { image: 'img/pokemons/Ramen.png', name: 'Ramen', color: '#25bb00' },
    { image: 'img/pokemons/Krokocock.png', name: 'Krokocock', color: '#330000' },
    { image: 'img/pokemons/LariosTonic.png', name: 'Larios Tonic', color: '#a05cff' },
    { image: 'img/pokemons/SopaDeAjo.png', name: 'Sopa de ajo', color: '#ffd36b' },
    { image: 'img/pokemons/Tomboy.png', name: 'Tomboy', color: '#c94000' }
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
                            <div class="name-left"><img src="img/name_box_l.png" alt=""/></div>
                            <div class="name-center">
                                <img src="img/name_box.png" alt="" class="name-center-img"/>
                                <div id="text-${i}" class="text-display name-center-text"></div>
                            </div>
                            <div class="name-right"><img src="img/name_box_r.png" alt=""/></div>
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
        
        const stauration = 0.4;

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
                // Aplicar el tinte (mezcla simple al porcentaje establecido)
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
            const textBoxL = card.querySelector('.back-text .name-left').querySelector('img');
            const textBoxC = card.querySelector('.back-text .name-center').querySelector('img');
            const textBoxR = card.querySelector('.back-text .name-right').querySelector('img');
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