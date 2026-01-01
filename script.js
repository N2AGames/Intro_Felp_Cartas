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

///#region CONTROL DE AUDIO Y BOTONES
document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('bg-music');
    const muteBtn = document.getElementById('mute-control');
    const muteIcon = document.getElementById('mute-icon');

    const toggleChanelInfoBtn = document.getElementById('toggle-chanel-info');
    const chanelInfo = document.querySelector('.chanel-info');

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

        // Control del botón de mostrar/ocultar info del canal
        toggleChanelInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (chanelInfo.style.display === 'block') {
                chanelInfo.style.display = 'none';
            } else {
                chanelInfo.style.display = 'block';
            }
        });
    }
});
//#endregion

// --------- Stars background (canvas + particles) ---------
(function(){
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0;

    const defaults = {
        count: Math.min(600, Math.max(30, Math.floor((window.innerWidth*window.innerHeight)/60000))),
        size: 3,
        twinkle: 0.6,
        brightness: 1.0,
        hue: 40
    };

    const opts = Object.assign({}, defaults);
    let stars = [];
    let raf = null;
    let startTime = performance.now();

    function resize(){
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const scaleFactor = (window.innerWidth < 700) ? 0.75 : 1.0;
        W = canvas.width = Math.floor(window.innerWidth * dpr * scaleFactor);
        H = canvas.height = Math.floor(window.innerHeight * dpr * scaleFactor);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(1,0,0,1,0,0);
    }

    function makeStar(i){
        const size = (Math.random() * opts.size) + 0.5;
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            size,
            base: Math.random() * 0.8 + 0.2,
            phase: Math.random() * Math.PI * 2,
            drift: (Math.random()-0.5) * 0.02,
            hueOffset: (Math.random()-0.5) * 30
        };
    }

    function initStars(){
        stars = [];
        for (let i=0;i<opts.count;i++) stars.push(makeStar(i));
    }

    function updateAndDraw(now){
        const t = (now - startTime) * 0.001;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';

        for (let s of stars){
            // slight drifting
            s.x += s.drift;
            if (s.x < -50) s.x = W + 50;
            if (s.x > W + 50) s.x = -50;

            // twinkle
            const b = s.base * (0.5 + 0.5 * Math.sin(t * opts.twinkle + s.phase));
            const alpha = Math.max(0, Math.min(1, b * opts.brightness));

            // radial gradient star (soft glow)
            const r = s.size * (1 + 1.2 * b);
            const x = s.x;
            const y = s.y;
            const hue = (opts.hue + s.hueOffset + 360) % 360;
            const col = `hsla(${hue}, 90%, 60%, ${alpha})`;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r*6);
            grad.addColorStop(0, col);
            grad.addColorStop(0.15, `hsla(${hue},90%,65%,${alpha*0.6})`);
            grad.addColorStop(0.35, `hsla(${hue},90%,60%,${alpha*0.15})`);
            grad.addColorStop(1, `hsla(${hue},90%,60%,0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r*6, 0, Math.PI*2);
            ctx.fill();
        }

        raf = requestAnimationFrame(updateAndDraw);
    }

    function start(){
        resize();
        initStars();
        startTime = performance.now();
        if (!raf) raf = requestAnimationFrame(updateAndDraw);
    }

    function stop(){
        if (raf) cancelAnimationFrame(raf); raf = null;
        ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    function setOptions(o){
        if ('count' in o){ opts.count = Math.max(0, Math.min(2000, Math.round(o.count))); initStars(); }
        if ('size' in o) opts.size = Math.max(0.5, Math.min(40, o.size));
        if ('twinkle' in o) opts.twinkle = Math.max(0.01, Math.min(5, o.twinkle));
        if ('brightness' in o) opts.brightness = Math.max(0, Math.min(2, o.brightness));
        if ('hue' in o) opts.hue = ((o.hue % 360) + 360) % 360;
    }

    function getOptions(){ return Object.assign({}, opts); }

    function attachStarControls(){
        const toggle = document.getElementById('stars-toggle');
        const countEl = document.getElementById('stars-count');
        const sizeEl = document.getElementById('stars-size');
        const twinkleEl = document.getElementById('stars-twinkle');
        const brightEl = document.getElementById('stars-bright');
        const hueEl = document.getElementById('stars-hue');
        const reset = document.getElementById('stars-reset');
        const countVal = document.getElementById('stars-count-val');
        const sizeVal = document.getElementById('stars-size-val');
        const twinkleVal = document.getElementById('stars-twinkle-val');
        const brightVal = document.getElementById('stars-bright-val');
        const hueVal = document.getElementById('stars-hue-val');
        if (!countEl) return;

        // init UI
        countEl.value = opts.count; countVal.innerText = opts.count;
        sizeEl.value = opts.size; sizeVal.innerText = opts.size;
        twinkleEl.value = opts.twinkle; twinkleVal.innerText = parseFloat(opts.twinkle).toFixed(2);
        brightEl.value = opts.brightness; brightVal.innerText = parseFloat(opts.brightness).toFixed(2);
        hueEl.value = opts.hue; hueVal.innerText = opts.hue;

        toggle.addEventListener('change', (e)=>{ if (e.target.checked) start(); else stop(); });
        countEl.addEventListener('input', (e)=>{ const v = parseInt(e.target.value,10); countVal.innerText = v; setOptions({count: v}); });
        sizeEl.addEventListener('input', (e)=>{ const v = parseFloat(e.target.value); sizeVal.innerText = v; setOptions({size: v}); });
        twinkleEl.addEventListener('input', (e)=>{ const v = parseFloat(e.target.value); twinkleVal.innerText = v.toFixed(2); setOptions({twinkle: v}); });
        brightEl.addEventListener('input', (e)=>{ const v = parseFloat(e.target.value); brightVal.innerText = v.toFixed(2); setOptions({brightness: v}); });
        hueEl.addEventListener('input', (e)=>{ const v = parseInt(e.target.value,10); hueVal.innerText = v; setOptions({hue: v}); });
        reset.addEventListener('click', ()=>{ countEl.value = defaults.count; sizeEl.value = defaults.size; twinkleEl.value = defaults.twinkle; brightEl.value = defaults.brightness; hueEl.value = defaults.hue; countVal.innerText = defaults.count; sizeVal.innerText = defaults.size; twinkleVal.innerText = defaults.twinkle.toFixed(2); brightVal.innerText = defaults.brightness.toFixed(2); hueVal.innerText = defaults.hue; setOptions(defaults); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachStarControls); else attachStarControls();
    window.addEventListener('resize', () => { resize(); initStars(); });

    // Expose API
    window.startStars = start; window.stopStars = stop; window.setStarOptions = setOptions; window.getStarOptions = getOptions; window.stars = { start, stop, setOptions, getOptions };

    // start by default
    start();
})();