function initBalatroShader() {
    // --- CONFIGURACIÓN DEL BALATRO SHADER ---
    let defaults = {
        active: true,
        speed: 1,
        intensity: 2.0,
        distortion: 1.6,
        colorShift: 0.7
    };

    let balatroSettings = getFromSessionStorage('balatroSettings');
    if (!balatroSettings) {
        balatroSettings = defaults;
    }
    saveToSessionStorage('balatroSettings', balatroSettings);

    if(balatroSettings.active) {
        // Cambiar fondo a azul oscuro
        setBgColor('#0f3460');
        disableColors();
    }

    // Referencias y listeners
    const balatroCanvas = document.getElementById('balatro-canvas');
    const gl = balatroCanvas.getContext('webgl');

    const bToggle = document.getElementById('balatro-toggle');
    const bSpeed = document.getElementById('balatro-speed');
    const bIntensity = document.getElementById('balatro-intensity');
    const bDistortion = document.getElementById('balatro-distortion');
    const bColorShift = document.getElementById('balatro-colorshift');
    const bSpeedVal = document.getElementById('balatro-speed-val');
    const bIntensityVal = document.getElementById('balatro-intensity-val');
    const bDistortionVal = document.getElementById('balatro-distortion-val');
    const bColorShiftVal = document.getElementById('balatro-colorshift-val');

    // Inicializar valores en UI
    bToggle.checked = balatroSettings.active;
    bSpeed.value = balatroSettings.speed;
    bIntensity.value = balatroSettings.intensity;
    bDistortion.value = balatroSettings.distortion;
    bColorShift.value = balatroSettings.colorShift;
    
    bSpeedVal.innerText = bSpeed.value;
    bIntensityVal.innerText = bIntensity.value;
    bDistortionVal.innerText = bDistortion.value;
    bColorShiftVal.innerText = bColorShift.value;

    bToggle.onchange = (e) => {
        balatroSettings.active = e.target.checked;
        saveToSessionStorage('balatroSettings', balatroSettings);
        
        if (e.target.checked) {
            // Cambiar fondo a blanco
            setBgColor('#0f3460');
            disableColors();
        } else {
            enableColors();
        }
    };
    bSpeed.oninput = (e) => {
        balatroSettings.speed = parseFloat(e.target.value);
        bSpeedVal.innerText = e.target.value;
        saveToSessionStorage('balatroSettings', balatroSettings);
    };
    bIntensity.oninput = (e) => {
        balatroSettings.intensity = parseFloat(e.target.value);
        bIntensityVal.innerText = e.target.value;
        saveToSessionStorage('balatroSettings', balatroSettings);
    };
    bDistortion.oninput = (e) => {
        balatroSettings.distortion = parseFloat(e.target.value);
        bDistortionVal.innerText = e.target.value;
        saveToSessionStorage('balatroSettings', balatroSettings);
    };
    bColorShift.oninput = (e) => {
        balatroSettings.colorShift = parseFloat(e.target.value);
        bColorShiftVal.innerText = e.target.value;
        saveToSessionStorage('balatroSettings', balatroSettings);
    };
    document.getElementById('balatro-reset').onclick = () => {
        balatroSettings = { active: true, speed: 0.5, intensity: 1.0, distortion: 1.0, colorShift: 0.0 };
        bToggle.checked = true;
        bSpeed.value = 0.5; bSpeedVal.innerText = 0.5;
        bIntensity.value = 1.0; bIntensityVal.innerText = 1.0;
        bDistortion.value = 1.0; bDistortionVal.innerText = 1.0;
        bColorShift.value = 0.0; bColorShiftVal.innerText = 0.0;
        saveToSessionStorage('balatroSettings', balatroSettings);
    };

    // --- SHADERS ---
    const vs = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
    const fs = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_speed;
    uniform float u_intensity;
    uniform float u_distortion;
    uniform float u_colorShift;
    uniform bool u_active;

    void main() {
        if (!u_active) { discard; }
        
        vec2 screen_coords = gl_FragCoord.xy;
        float pixel_size = length(u_resolution.xy) / 700.0;
        vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * u_resolution.xy) / length(u_resolution.xy);
        
        // Tiempos separados: uno para rotación (fijo), otro para el efecto (controlable)
        float t = u_time * u_speed;
        float rotationTime = u_time * 0.15; // Velocidad de rotación 50% más lenta
        
        // Calcular distancia desde el centro
        float dist = length(uv);
        
        // Crear rotación espiral basada en la distancia al centro (velocidad fija)
        float spiralRotation = dist * 2.0 - rotationTime;
        float cosR = cos(spiralRotation);
        float sinR = sin(spiralRotation);
        
        // Aplicar rotación espiral
        vec2 rotatedUV = vec2(
            uv.x * cosR - uv.y * sinR,
            uv.x * sinR + uv.y * cosR
        );
        
        rotatedUV *= 15.0 * u_distortion;
        vec2 uv2 = vec2(rotatedUV.x + rotatedUV.y);

        for(int i=0; i < 10; i++) {
            uv2 += sin(max(rotatedUV.x, rotatedUV.y)) + rotatedUV;
            rotatedUV += 0.5 * vec2(cos(5.11 + 0.35 * uv2.y + t), sin(uv2.x - 0.11 * t));
            rotatedUV -= 1.0 * cos(rotatedUV.x + rotatedUV.y) - 1.0 * sin(rotatedUV.x * 0.7 - rotatedUV.y);
        }

        float intensity = min(1.0, max(0.0, length(rotatedUV) * 0.015)) * u_intensity;
        
        // Dos tintas: roja y azul oscuro (color del fondo #0f3460)
        vec3 redInk = vec3(1.0, 0.0, 0.1);              // Tinta roja
        vec3 blueInk = vec3(0.059, 0.204, 0.376);       // Tinta azul oscuro (color fondo)
        
        // Crear zonas más definidas que se mezclan parcialmente
        // Usar una función más abrupta para mantener las tintas más separadas
        float inkSeparation = sin(intensity * 8.0 + u_colorShift * 6.28) * 0.5 + 0.5;
        inkSeparation = smoothstep(0.3, 0.7, inkSeparation); // Transición más abrupta
        
        // Mezclar las dos tintas de forma más visible
        vec3 finalColor = mix(blueInk, redInk, inkSeparation);
        
        // Ajustar intensidad para que las tintas sean más opacas
        finalColor *= intensity * 1.5;
        finalColor = pow(finalColor, vec3(0.9));
        float alpha = smoothstep(0.05, 0.7, intensity);
        
        gl_FragColor = vec4(finalColor, alpha);
    }`;

    // --- BOILERPLATE WEBGL ---
    function createShader(gl, type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(s));
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
    const intensityLoc = gl.getUniformLocation(program, "u_intensity");
    const distortionLoc = gl.getUniformLocation(program, "u_distortion");
    const colorShiftLoc = gl.getUniformLocation(program, "u_colorShift");
    const activeLoc = gl.getUniformLocation(program, "u_active");

    function render(time) {
        if (balatroCanvas.width !== window.innerWidth || balatroCanvas.height !== window.innerHeight) {
            balatroCanvas.width = window.innerWidth;
            balatroCanvas.height = window.innerHeight;
            gl.viewport(0, 0, balatroCanvas.width, balatroCanvas.height);
        }

        gl.useProgram(program);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resLoc, balatroCanvas.width, balatroCanvas.height);
        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform1f(speedLoc, balatroSettings.speed);
        gl.uniform1f(intensityLoc, balatroSettings.intensity);
        gl.uniform1f(distortionLoc, balatroSettings.distortion);
        gl.uniform1f(colorShiftLoc, balatroSettings.colorShift);
        gl.uniform1i(activeLoc, balatroSettings.active);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
