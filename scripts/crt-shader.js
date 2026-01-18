// --------- CRT TV Shader (Efecto Televisor Antiguo) ---------
let crtShaderInitialized = false;
let crtShaderInstance = null;

function setupCRTControls() {
    const defaults = {
        enabled: true,
        scanlines: 0.2,
        distortion: 0.05,
        vignette: 0.2,
        noise: 0.03,
        flicker: 0.01,
        rgbShift: 0.001,
        brightness: 1.0
    };

    let crtConfig = getFromSessionStorage('crtSettings');
    if (!crtConfig) {
        crtConfig = defaults;
    }
    saveToSessionStorage('crtSettings', crtConfig);

    const toggle = document.getElementById('crt-toggle');
    if (toggle) {
        toggle.checked = crtConfig.enabled;
        toggle.onchange = (e) => {
            crtConfig.enabled = e.target.checked;
            saveToSessionStorage('crtSettings', crtConfig);
            
            if (e.target.checked && !crtShaderInitialized) {
                initCRTShader();
            } else if (crtShaderInstance) {
                if (e.target.checked) {
                    crtShaderInstance.start();
                } else {
                    crtShaderInstance.stop();
                }
            }
        };
    }

    // Configurar controles de sliders
    const controls = [
        { id: 'crt-scanlines', key: 'scanlines', min: 0, max: 1, step: 0.01 },
        { id: 'crt-distortion', key: 'distortion', min: 0, max: 0.5, step: 0.01 },
        { id: 'crt-vignette', key: 'vignette', min: 0, max: 1, step: 0.01 },
        { id: 'crt-noise', key: 'noise', min: 0, max: 0.3, step: 0.01 },
        { id: 'crt-flicker', key: 'flicker', min: 0, max: 0.15, step: 0.01 },
        { id: 'crt-rgbshift', key: 'rgbShift', min: 0, max: 0.01, step: 0.0001 },
        { id: 'crt-brightness', key: 'brightness', min: 0.5, max: 1.5, step: 0.01 }
    ];

    controls.forEach(({ id, key, min, max, step }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-val`);
        
        if (slider && valueDisplay) {
            slider.min = min;
            slider.max = max;
            slider.step = step;
            slider.value = crtConfig[key];
            valueDisplay.textContent = crtConfig[key].toFixed(step < 0.001 ? 4 : 2);
            
            slider.oninput = (e) => {
                const val = parseFloat(e.target.value);
                crtConfig[key] = val;
                valueDisplay.textContent = val.toFixed(step < 0.001 ? 4 : 2);
                saveToSessionStorage('crtSettings', crtConfig);
                
                if (crtShaderInstance) {
                    crtShaderInstance.updateConfig(crtConfig);
                }
            };
        }
    });

    // Botón de reset
    const resetBtn = document.getElementById('crt-reset');
    if (resetBtn) {
        resetBtn.onclick = () => {
            Object.assign(crtConfig, defaults);
            saveToSessionStorage('crtSettings', crtConfig);
            
            controls.forEach(({ id, key, step }) => {
                const slider = document.getElementById(id);
                const valueDisplay = document.getElementById(`${id}-val`);
                if (slider && valueDisplay) {
                    slider.value = crtConfig[key];
                    valueDisplay.textContent = crtConfig[key].toFixed(step < 0.001 ? 4 : 2);
                }
            });
            
            if (crtShaderInstance) {
                crtShaderInstance.updateConfig(crtConfig);
            }
        };
    }

    if (crtConfig.enabled && !crtShaderInitialized) {
        initCRTShader();
    }
}

function initCRTShader() {
    if (crtShaderInitialized) return;
    crtShaderInitialized = true;

    const canvas = document.getElementById('crt-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const defaults = {
        enabled: true,
        scanlines: 0.2,
        distortion: 0.05,
        vignette: 0.2,
        noise: 0.03,
        flicker: 0.01,
        rgbShift: 0.001,
        brightness: 1.0
    };

    let crtConfig = getFromSessionStorage('crtSettings');
    if (!crtConfig) {
        crtConfig = defaults;
    }
    saveToSessionStorage('crtSettings', crtConfig);

    const opts = Object.assign({}, crtConfig);
    let raf = null;
    let time = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }

    resize();
    window.addEventListener('resize', resize);

    // Función para generar ruido
    function drawNoise(ctx, width, height, intensity) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 255 * intensity;
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = noise * 0.5; // A
        }
        
        return imageData;
    }

    function render() {
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Parpadeo (flicker)
        const flicker = opts.flicker > 0 ? (1 - Math.random() * opts.flicker) : 1;
        ctx.globalAlpha = flicker;
        
        // Líneas de escaneo (scanlines)
        if (opts.scanlines > 0) {
            ctx.fillStyle = 'rgba(128, 128, 128, ' + opts.scanlines + ')';
            const lineHeight = 2;
            const spacing = 4;
            
            for (let y = 0; y < h; y += spacing) {
                ctx.fillRect(0, y, w, lineHeight);
            }
        }
        
        // Ruido (noise)
        if (opts.noise > 0) {
            const noiseData = drawNoise(ctx, Math.floor(w / 4), Math.floor(h / 4), opts.noise);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = noiseData.width;
            tempCanvas.height = noiseData.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(noiseData, 0, 0);
            
            ctx.globalAlpha = 1;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCanvas, 0, 0, w, h);
        }
        
        // Viñeta (vignette)
        if (opts.vignette > 0) {
            const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 0, 0, ' + (opts.vignette * 0.3) + ')');
            gradient.addColorStop(1, 'rgba(0, 0, 0, ' + opts.vignette + ')');
            
            ctx.globalAlpha = 1;
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);
        }
        
        // Distorsión CRT (curvatura de pantalla)
        if (opts.distortion > 0) {
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            
            const waveOffset = Math.sin(time * 0.1) * 5;
            
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(0, h / 2);
                
                for (let x = 0; x < w; x++) {
                    const y = h / 2 + Math.sin(x * 0.02 + time * 0.05 + i) * opts.distortion * 50 + waveOffset;
                    ctx.lineTo(x, y);
                }
                
                ctx.stroke();
            }
        }
        
        // Desplazamiento RGB (chromatic aberration)
        if (opts.rgbShift > 0) {
            ctx.globalAlpha = 0.3;
            const shift = opts.rgbShift * w;
            
            ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
            ctx.fillRect(shift, 0, w, h);
            
            ctx.fillStyle = 'rgba(0, 0, 255, 0.05)';
            ctx.fillRect(-shift, 0, w, h);
        }
        
        // Ajuste de brillo general
        if (opts.brightness < 1) {
            const darknessFactor = 1 - opts.brightness;
            ctx.globalAlpha = darknessFactor * 0.5;
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, w, h);
        }
        
        time += 0.1;
    }

    function loop() {
        render();
        raf = requestAnimationFrame(loop);
    }

    crtShaderInstance = {
        start: () => {
            if (raf === null) {
                loop();
            }
        },
        stop: () => {
            if (raf !== null) {
                cancelAnimationFrame(raf);
                raf = null;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        },
        updateConfig: (newConfig) => {
            Object.assign(opts, newConfig);
        }
    };

    if (crtConfig.enabled) {
        crtShaderInstance.start();
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCRTControls);
} else {
    setupCRTControls();
}
