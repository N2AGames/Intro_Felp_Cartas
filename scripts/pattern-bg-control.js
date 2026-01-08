// Patrón de fondo (SVG dinámico)
function makePatternDataURL(scale, opacity, style='diagonal', stroke='#ffffff'){
    const strokeWidth = Math.max(1, Math.round(scale * 0.04));
    let body = `<rect width='100%' height='100%' fill='none'/>`;

    if (style === 'diagonal'){
        body += `<line x1='0' y1='0' x2='${scale}' y2='${scale}' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${strokeWidth}' stroke-linecap='round'/><line x1='0' y1='${scale}' x2='${scale}' y2='0' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${strokeWidth}' stroke-linecap='round'/>`;
    } else if (style === 'grid'){
        const mid = scale/2;
        body += `<line x1='${mid}' y1='0' x2='${mid}' y2='${scale}' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${strokeWidth}'/><line x1='0' y1='${mid}' x2='${scale}' y2='${mid}' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${strokeWidth}'/>`;
    } else if (style === 'dots'){
        const r = Math.max(1, Math.round(scale * 0.12));
        body += `<circle cx='${scale/2}' cy='${scale/2}' r='${r}' fill='${stroke}' fill-opacity='${opacity}'/>`;
    } else if (style === 'cross'){
        const mid = scale/2;
        body += `<line x1='0' y1='${mid}' x2='${scale}' y2='${mid}' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${strokeWidth}'/><line x1='${mid}' y1='0' x2='${mid}' y2='${scale}' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${strokeWidth}'/>`;
        body += `<line x1='0' y1='0' x2='${scale}' y2='${scale}' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${Math.max(1, Math.round(strokeWidth*0.6))}'/><line x1='0' y1='${scale}' x2='${scale}' y2='0' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='${Math.max(1, Math.round(strokeWidth*0.6))}'/>`;
    }

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${scale}' height='${scale}' viewBox='0 0 ${scale} ${scale}'>${body}</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function updatePatternLayer(enabled, scale, opacity, style, stroke){
    const layer = document.getElementById('pattern-layer');
    if (!layer) return;
    if (!enabled){
        layer.style.backgroundImage = 'none';
        layer.style.opacity = '0';
        return;
    }
    const url = makePatternDataURL(scale, opacity, style, stroke);
    layer.style.backgroundImage = `url("${url}")`;
    layer.style.backgroundSize = `${scale}px ${scale}px`;
    layer.style.opacity = opacity;
    layer.style.display = 'block';
}

function attachPatternControls(){
    const toggle = document.getElementById('pattern-toggle');
    const scaleEl = document.getElementById('pattern-scale');
    const opacityEl = document.getElementById('pattern-opacity');
    const patternBtns = document.querySelectorAll('.pattern-btn');
    const reset = document.getElementById('pattern-reset');
    const scaleVal = document.getElementById('pattern-scale-val');
    const opacityVal = document.getElementById('pattern-opacity-val');
    if (!toggle) return;

    const defaults = { scale: 10, opacity: 0.5, enabled: false, style: 'diagonal' };

    // load from sessionStorage
    var sessionBgPattern = getFromSessionStorage('bgPatternSettings');
    if (!sessionBgPattern) {
        sessionBgPattern = defaults;
    }
    saveToSessionStorage('bgPatternSettings', sessionBgPattern);
    let currentStyle = sessionBgPattern.style;

    // init UI values
    scaleEl.value = sessionBgPattern.scale;
    opacityEl.value = sessionBgPattern.opacity; opacityVal.innerText = parseFloat(sessionBgPattern.opacity).toFixed(2);
    toggle.checked = sessionBgPattern.enabled;
    
    // Marcar el patrón activo por defecto
    patternBtns.forEach(btn => {
        if (btn.dataset.pattern === sessionBgPattern.style) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (e) => {
            // Remover active de todos
            patternBtns.forEach(b => b.classList.remove('active'));
            // Agregar active al clickeado
            e.target.classList.add('active');
            // Actualizar patrón
            currentStyle = e.target.dataset.pattern;

            // Guardar en sessionStorage
            sessionBgPattern.style = currentStyle;
            saveToSessionStorage('bgPatternSettings', sessionBgPattern);

            updatePatternLayer(toggle.checked, parseInt(scaleEl.value,10), parseFloat(opacityEl.value), currentStyle, '#ffffff');
        });
    });

    // listeners
    toggle.addEventListener('change', (e)=>{
        updatePatternLayer(e.target.checked, parseInt(scaleEl.value,10), parseFloat(opacityEl.value), currentStyle, '#ffffff');
        // Guardar en sessionStorage
        sessionBgPattern.enabled = e.target.checked;
        saveToSessionStorage('bgPatternSettings', sessionBgPattern);
    });
    scaleEl.addEventListener('input', (e)=>{ 
        scaleVal.innerText = e.target.value;
        updatePatternLayer(toggle.checked, parseInt(e.target.value,10), parseFloat(opacityEl.value), currentStyle, '#ffffff');
        // Guardar en sessionStorage
        sessionBgPattern.scale = parseInt(e.target.value,10);
        saveToSessionStorage('bgPatternSettings', sessionBgPattern);
    });
    opacityEl.addEventListener('input', (e)=>{ 
        opacityVal.innerText = parseFloat(e.target.value).toFixed(2); 
        updatePatternLayer(toggle.checked, parseInt(scaleEl.value,10), parseFloat(e.target.value), currentStyle, '#ffffff'); 
        // Guardar en sessionStorage
        sessionBgPattern.opacity = parseFloat(e.target.value);
        saveToSessionStorage('bgPatternSettings', sessionBgPattern);
    });
    reset.addEventListener('click', ()=>{ 
        scaleEl.value = defaults.scale; 
        opacityEl.value = defaults.opacity; 
        opacityVal.innerText = parseFloat(defaults.opacity).toFixed(2); 
        currentStyle = defaults.style;
        toggle.checked = defaults.enabled;
        // Actualizar botón activo
        patternBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.pattern === defaults.style) {
                btn.classList.add('active');
            }
        });
        updatePatternLayer(defaults.enabled, defaults.scale, defaults.opacity, defaults.style, '#ffffff');
        // Guardar en sessionStorage
        sessionBgPattern = { ...defaults };
        saveToSessionStorage('bgPatternSettings', sessionBgPattern);
    });

    // init
    updatePatternLayer(toggle.checked, parseInt(scaleEl.value,10), parseFloat(opacityEl.value), currentStyle, '#ffffff');
}