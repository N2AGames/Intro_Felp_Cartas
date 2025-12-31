// Configuración de cartas (Imagen + Texto)
const deckData = [
    { image: 'img/pokemons/Agenda2030.png', name: 'Agenda 2030' },
    { image: 'img/pokemons/Inaki.png', name: 'Iñaki' },
    { image: 'img/pokemons/Ramen.png', name: 'Ramen' },
    { image: 'img/pokemons/Krokocock.png', name: 'Krokocock' },
    { image: 'img/pokemons/LariosTonic.png', name: 'Larios Tonic' },
    { image: 'img/pokemons/SopaDeAjo.png', name: 'Sopa de ajo' },
    { image: 'img/pokemons/Tomboy.png', name: 'Tomboy' }
];

const container = document.getElementById('deck-container');

// Bucle inicial para crear 6 slots de cartas
for (let i = 0; i < 6; i++) {
    container.innerHTML += `
        <div class="card-container">
            <div class="card" id="card-${i}">
                <div class="card-face card-front">
                    <img src="img/reverso_carta.png">
                </div>
                <div class="card-face card-back">
                    <img src="img/fondo_carta.png" class="back-template">
                    <img id="img-${i}" src="" class="back-content">
                    <div id="text-${i}" class="back-text"></div>
                </div>
            </div>
        </div>
    `;
}

function flipSequence() {
    // 1. Barajar el mazo para elegir 6 cartas al azar
    const shuffled = [...deckData].sort(() => 0.5 - Math.random());
    const selectedCards = shuffled.slice(0, 6);

    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const card = document.getElementById(`card-${i}`);
            const imgElement = document.getElementById(`img-${i}`);
            const textElement = document.getElementById(`text-${i}`);

            // 2. Cargar los datos de la carta elegida ANTES de que se de la vuelta
            imgElement.src = selectedCards[i].image;
            textElement.innerText = selectedCards[i].name;

            // 3. Lanzar la animación de salto y giro
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