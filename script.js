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

// --------- Smoke effect (ligero, canvas + partículas) ---------
(function(){
    const canvas = document.getElementById('smoke-canvas');
    if (!canvas) return; // Si falta el canvas, salimos
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = window.devicePixelRatio || 1;

    const opts = {
        particleCount: Math.min(120, Math.max(30, Math.floor((window.innerWidth*window.innerHeight)/80000))),
        maxSize: 160,
        speed: 0.25,
        blur: 8
    };

    let particles = [];

    function resize(){
        dpr = window.devicePixelRatio || 1;
        w = canvas.width = Math.floor(window.innerWidth * dpr);
        h = canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle(){
        return {
            x: Math.random()*window.innerWidth,
            y: window.innerHeight + Math.random()*200, // empiezan cerca de la parte baja
            size: (Math.random()*opts.maxSize*0.6) + (opts.maxSize*0.2),
            life: Math.random()*80,
            ttl: Math.random()*300 + 200,
            seed: Math.random()*1000
        };
    }

    function initParticles(){ particles = []; for(let i=0;i<opts.particleCount;i++) particles.push(makeParticle()); }

    let t0 = 0;
    function update(dt){
        t0 += dt;
        for(let p of particles){
            const nx = p.x * 0.002;
            const ny = p.y * 0.002;
            const angle = Math.sin(nx + t0*0.0006 + p.seed) + Math.cos(ny - t0*0.0008 + p.seed*0.5);
            const speed = opts.speed * (0.5 + Math.random()*0.5);
            p.x += Math.cos(angle) * speed * (1 + p.size/120);
            p.y += Math.sin(angle) * speed * (0.6 + p.size/160);
            p.life += 1;
            if (p.life > p.ttl || p.x < -p.size || p.x > window.innerWidth + p.size || p.y < -p.size || p.y > window.innerHeight + p.size){
                p.x = Math.random()*window.innerWidth;
                p.y = window.innerHeight + Math.random()*50;
                p.life = 0;
                p.ttl = Math.random()*300 + 200;
                p.size = (Math.random()*opts.maxSize*0.6) + (opts.maxSize*0.2);
            }
        }
    }

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        for(let p of particles){
            const lifeRatio = p.life / p.ttl;
            const alpha = Math.max(0, 0.18 * (1 - lifeRatio));
            const r = p.size * (0.8 + 0.6*Math.sin(p.seed));
            const x = p.x;
            const y = p.y;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
            grad.addColorStop(0.5, `rgba(200,200,200,${alpha*0.4})`);
            grad.addColorStop(1, `rgba(200,200,200,0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            ctx.fill();
        }
    }

    let raf = null;
    let last = performance.now();
    function frame(now){
        const dt = now - last;
        last = now;
        update(dt);
        draw();
        raf = requestAnimationFrame(frame);
    }

    function start(){
        resize();
        initParticles();
        // aplicar blur inicial
        canvas.style.filter = `blur(${opts.blur}px)`;
        last = performance.now();
        if (!raf) raf = requestAnimationFrame(frame);
    }

    function stop(){
        if (raf) cancelAnimationFrame(raf); raf = null;
        ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    function setOptions(newOpts){
        Object.assign(opts, newOpts);
        if ('particleCount' in newOpts) {
            opts.particleCount = Math.max(10, Math.min(2000, Math.round(opts.particleCount)));
            initParticles();
        }
        if ('maxSize' in newOpts) {
            opts.maxSize = Math.max(4, Math.round(opts.maxSize));
        }
        if ('blur' in newOpts) {
            canvas.style.filter = `blur(${opts.blur}px)`;
        }
    }

    function getOptions(){ return Object.assign({}, opts); }

    function attachControls(){
        const toggle = document.getElementById('smoke-toggle');
        const count = document.getElementById('smoke-count');
        const speedEl = document.getElementById('smoke-speed');
        const size = document.getElementById('smoke-size');
        const blurEl = document.getElementById('smoke-blur');
        const reset = document.getElementById('smoke-reset');
        const countVal = document.getElementById('smoke-count-val');
        const speedVal = document.getElementById('smoke-speed-val');
        const sizeVal = document.getElementById('smoke-size-val');
        const blurVal = document.getElementById('smoke-blur-val');
        if (!count || !speedEl) return; // controles no presentes

        // Inicializar valores en UI
        count.value = opts.particleCount;
        speedEl.value = opts.speed;
        size.value = opts.maxSize;
        blurEl.value = opts.blur;
        countVal.innerText = count.value;
        speedVal.innerText = parseFloat(speedEl.value).toFixed(2);
        sizeVal.innerText = size.value;
        blurVal.innerText = blurEl.value + 'px';

        // Listeners
        toggle.addEventListener('change', (e)=>{ if (e.target.checked) start(); else stop(); });
        count.addEventListener('input', (e)=>{ const v = parseInt(e.target.value,10); countVal.innerText = v; setOptions({particleCount: v}); });
        speedEl.addEventListener('input', (e)=>{ const v = parseFloat(e.target.value); speedVal.innerText = v.toFixed(2); setOptions({speed: v}); });
        size.addEventListener('input', (e)=>{ const v = parseInt(e.target.value,10); sizeVal.innerText = v; setOptions({maxSize: v}); });
        blurEl.addEventListener('input', (e)=>{ const v = parseInt(e.target.value,10); blurVal.innerText = v + 'px'; setOptions({blur: v}); });
        reset.addEventListener('click', ()=>{
            const defaults = { particleCount: Math.min(120, Math.max(30, Math.floor((window.innerWidth*window.innerHeight)/80000))), maxSize:160, speed:0.25, blur:8 };
            count.value = defaults.particleCount;
            speedEl.value = defaults.speed;
            size.value = defaults.maxSize;
            blurEl.value = defaults.blur;
            countVal.innerText = count.value;
            speedVal.innerText = parseFloat(speedEl.value).toFixed(2);
            sizeVal.innerText = size.value;
            blurVal.innerText = blurEl.value + 'px';
            setOptions(defaults);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachControls); else attachControls();

    window.addEventListener('resize', () => { resize(); initParticles(); });

    // Exponer funciones por si se quieren controlar desde la consola
    window.startSmoke = start;
    window.stopSmoke = stop;
    window.setSmokeOptions = setOptions;
    window.getSmokeOptions = getOptions;
    window.smoke = { start, stop, setOptions, getOptions };

    // Arranque automático
    start();
})();