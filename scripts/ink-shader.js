function initInkShader() {
    // --- CONFIGURACIÓN DE TINTAS ---
    let defaults = {
        active: false,
        speed: 0.3,
        opacity: 0.6,
        scale: 2.5,
        color1: '#8b3a8f',
        color2: '#1e5a8e'
    };

    let inkSettings = getFromSessionStorage('inkSettings');
    if (!inkSettings) {
        inkSettings = defaults;
    }
    saveToSessionStorage('inkSettings', inkSettings);

    // Referencias y listeners
    const inkCanvas = document.getElementById('ink-canvas');
    const gl = inkCanvas.getContext('webgl');

    const iToggle = document.getElementById('ink-toggle');
    const iSpeed = document.getElementById('ink-speed');
    const iOpacity = document.getElementById('ink-opacity');
    const iScale = document.getElementById('ink-scale');
    const iColor1 = document.getElementById('ink-color1');
    const iColor2 = document.getElementById('ink-color2');
    const iSpeedVal = document.getElementById('ink-speed-val');
    const iOpacityVal = document.getElementById('ink-opacity-val');
    const iScaleVal = document.getElementById('ink-scale-val');

    // Inicializar valores en UI
    iToggle.checked = inkSettings.active;
    iSpeed.value = inkSettings.speed;
    iOpacity.value = inkSettings.opacity;
    iScale.value = inkSettings.scale;
    iColor1.value = inkSettings.color1;
    iColor2.value = inkSettings.color2;
    
    iSpeedVal.innerText = iSpeed.value;
    iOpacityVal.innerText = iOpacity.value;
    iScaleVal.innerText = iScale.value;

    iToggle.onchange = (e) => {
        inkSettings.active = e.target.checked;
        saveToSessionStorage('inkSettings', inkSettings);
    };
    iSpeed.oninput = (e) => {
        inkSettings.speed = parseFloat(e.target.value);
        iSpeedVal.innerText = e.target.value;
        saveToSessionStorage('inkSettings', inkSettings);
    };
    iOpacity.oninput = (e) => {
        inkSettings.opacity = parseFloat(e.target.value);
        iOpacityVal.innerText = e.target.value;
        saveToSessionStorage('inkSettings', inkSettings);
    };
    iScale.oninput = (e) => {
        inkSettings.scale = parseFloat(e.target.value);
        iScaleVal.innerText = e.target.value;
        saveToSessionStorage('inkSettings', inkSettings);
    };
    iColor1.oninput = (e) => {
        inkSettings.color1 = e.target.value;
        saveToSessionStorage('inkSettings', inkSettings);
    };
    iColor2.oninput = (e) => {
        inkSettings.color2 = e.target.value;
        saveToSessionStorage('inkSettings', inkSettings);
    };
    document.getElementById('ink-reset').onclick = () => {
        inkSettings = { ...defaults };
        iToggle.checked = defaults.active;
        iSpeed.value = defaults.speed; iSpeedVal.innerText = defaults.speed;
        iOpacity.value = defaults.opacity; iOpacityVal.innerText = defaults.opacity;
        iScale.value = defaults.scale; iScaleVal.innerText = defaults.scale;
        iColor1.value = defaults.color1;
        iColor2.value = defaults.color2;
        saveToSessionStorage('inkSettings', inkSettings);
    };

    // --- SHADERS ---
    const vs = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
    
    const fs = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_speed;
    uniform float u_opacity;
    uniform float u_scale;
    uniform bool u_active;
    uniform vec3 u_color1;
    uniform vec3 u_color2;

    // Función de hash para generar valores pseudo-aleatorios
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // Noise de Perlin simplificado
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        
        // Suavizado cúbico
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Fractal Brownian Motion para detalles más orgánicos
    float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
        }
        
        return value;
    }

    void main() {
        if (!u_active) { discard; }
        
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        uv.x *= aspect;
        
        float t = u_time * u_speed;
        
        // Crear dos capas de fluidos con movimientos diferentes
        vec2 fluid1 = vec2(
            fbm(uv * u_scale + vec2(t * 0.4, t * 0.3)),
            fbm(uv * u_scale + vec2(t * 0.3, -t * 0.4))
        );
        
        vec2 fluid2 = vec2(
            fbm((uv + vec2(100.0)) * u_scale + vec2(-t * 0.35, t * 0.25)),
            fbm((uv + vec2(200.0)) * u_scale + vec2(t * 0.25, t * 0.35))
        );
        
        // Distorsionar el espacio UV con los fluidos
        vec2 distorted1 = uv + fluid1 * 0.3;
        vec2 distorted2 = uv + fluid2 * 0.3;
        
        // Generar patrones de tinta
        float ink1 = fbm(distorted1 * u_scale * 2.0 + t * 0.1);
        float ink2 = fbm(distorted2 * u_scale * 2.0 - t * 0.15);
        
        // Crear el factor de mezcla con variación espacial y temporal
        float mixFactor = fbm(uv * u_scale * 1.5 + vec2(sin(t * 0.2), cos(t * 0.3)));
        mixFactor = smoothstep(0.3, 0.7, mixFactor);
        
        // Mezclar los dos colores de tinta
        vec3 finalColor = mix(u_color1, u_color2, mixFactor);
        
        // Agregar variación de intensidad
        float intensity = (ink1 + ink2) * 0.5;
        intensity = smoothstep(0.2, 0.8, intensity);
        
        finalColor *= 0.7 + intensity * 0.3;
        
        // Calcular alpha con suavizado en los bordes
        float alpha = intensity * u_opacity;
        
        gl_FragColor = vec4(finalColor, alpha);
    }`;

    // --- BOILERPLATE WEBGL ---
    function createShader(gl, type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(s));
            gl.deleteShader(s);
            return null;
        }
        return s;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const speedLoc = gl.getUniformLocation(program, "u_speed");
    const opacLoc = gl.getUniformLocation(program, "u_opacity");
    const scaleLoc = gl.getUniformLocation(program, "u_scale");
    const activeLoc = gl.getUniformLocation(program, "u_active");
    const color1Loc = gl.getUniformLocation(program, "u_color1");
    const color2Loc = gl.getUniformLocation(program, "u_color2");

    // Función para convertir hex a RGB normalizado
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : [1, 1, 1];
    }

    // Habilitar blending para transparencia
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function render(time) {
        if (inkCanvas.width !== window.innerWidth || inkCanvas.height !== window.innerHeight) {
            inkCanvas.width = window.innerWidth;
            inkCanvas.height = window.innerHeight;
            gl.viewport(0, 0, inkCanvas.width, inkCanvas.height);
        }

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resLoc, inkCanvas.width, inkCanvas.height);
        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform1f(speedLoc, inkSettings.speed);
        gl.uniform1f(opacLoc, inkSettings.opacity);
        gl.uniform1f(scaleLoc, inkSettings.scale);
        gl.uniform1i(activeLoc, inkSettings.active);
        
        const color1 = hexToRgb(inkSettings.color1);
        const color2 = hexToRgb(inkSettings.color2);
        gl.uniform3f(color1Loc, color1[0], color1[1], color1[2]);
        gl.uniform3f(color2Loc, color2[0], color2[1], color2[2]);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
