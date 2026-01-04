// --------- Stars background (canvas + particles) ---------
(function(){
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0;

    const defaults = {
        count: Math.min(600, Math.max(600, Math.floor((window.innerWidth*window.innerHeight)/60000))),
        size: 10,
        twinkle: 1.3,
        brightness: 1.8,
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
        if ('size' in o){
            const prev = opts.size;
            opts.size = Math.max(0.5, Math.min(40, o.size));
            // Ajustamos los tamaños existentes para reflejar el cambio inmediatamente
            if (typeof stars !== 'undefined' && stars && stars.length){
                const scaleFactor = (prev > 0) ? (opts.size / prev) : 1;
                for (let s of stars) s.size = Math.max(0.5, s.size * scaleFactor);
            }
        }
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
})();