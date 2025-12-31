// Configuración de cartas (Imagen + Texto)
const deckData = [
    { image: 'img/pokemons/Agenda2030.png', name: 'Agenda 2030' },
    { image: 'img/pokemons/Inaki.png', name: 'Iñaki' },
    { image: 'img/pokemons/Ramen.png', name: 'Ramen' }
];

const container = document.getElementById('deck-container');

// Generar las 6 cartas
for (let i = 0; i < 6; i++) {
    const data = deckData[i % deckData.length];
    
    container.innerHTML += `
        <div class="card-container">
            <div class="card" id="card-${i}">
                <div class="card-face card-front">
                    <img src="img/reverso_carta.png">
                </div>
                <div class="card-face card-back">
                    <img src="img/fondo_carta.png" class="back-template">
                    <img id="img-${i}" src="${data.image}" class="back-content">
                    <div id="text-${i}" class="back-text">${data.name}</div>
                </div>
            </div>
        </div>
    `;
}

let nextImageIndex = 6; // Empezamos a contar desde la que no se ha mostrado

function flipSequence() {
    for (let i = 0; i < 6; i++) {
        // --- 1. VELOCIDAD DE LA OLA ---
        // Reducido de 600ms a 200ms para que salten casi seguidas
        setTimeout(() => {
            const card = document.getElementById(`card-${i}`);
            card.classList.add('is-flipped');

            // --- 2. TIEMPO DE EXPOSICIÓN ---
            // Aumentado a 8 segundos para que el streamer y el chat las vean bien
            setTimeout(() => {
                card.classList.remove('is-flipped');
                
                // Cambiamos imagen y texto cuando la carta está de espaldas
                setTimeout(() => {
                    const nextData = deckData[nextImageIndex % deckData.length];
                    document.getElementById(`img-${i}`).src = nextData.image;
                    document.getElementById(`text-${i}`).innerText = nextData.name;
                    nextImageIndex++;
                }, 300);

            }, 8000); // Tiempo que se queda la carta a la vista

        }, i * 200); // Tiempo entre cada carta
    }
}

// --- 3. TIEMPO OCULTAS ---
// El ciclo total ahora es más corto tras cerrarse la última carta.
// Sumamos el tiempo de exposición (8000) + la duración del giro.
// Lo ejecutamos cada 12 segundos (antes era proporcionalmente más largo).
setInterval(flipSequence, 12000);
// Primera vez tras un pequeño delay
setTimeout(flipSequence, 1000);