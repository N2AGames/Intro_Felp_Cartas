function initSmokeShader() {
    // --- CONFIGURACIÓN DEL HUMO ---
    let defaults = {
        active: true,
        speed: 0.15,
        opacity: 0.5
    };

    let smokeSettings = getFromSessionStorage('smokeSettings');
    if (!smokeSettings) {
        smokeSettings = defaults;
    }
    saveToSessionStorage('smokeSettings', smokeSettings);

    // Referencias y listeners
    const smokeCanvas = document.getElementById('smoke-canvas');
    const gl = smokeCanvas.getContext('webgl');

    const sToggle = document.getElementById('smoke-toggle');
    const sSpeed = document.getElementById('smoke-speed');
    const sOpacity = document.getElementById('smoke-opacity');
    const sSpeedVal = document.getElementById('smoke-speed-val');
    const sOpacityVal = document.getElementById('smoke-opacity-val');

    // Inicializar valores en UI
    sToggle.checked = smokeSettings.active;
    sSpeed.value = smokeSettings.speed;
    sOpacity.value = smokeSettings.opacity;
    
    sSpeedVal.innerText = sSpeed.value;
    sOpacityVal.innerText = sOpacity.value;

    sToggle.onchange = (e) => {
        smokeSettings.active = e.target.checked;
        saveToSessionStorage('smokeSettings', smokeSettings);
    };
    sSpeed.oninput = (e) => {
        smokeSettings.speed = parseFloat(e.target.value);
        sSpeedVal.innerText = e.target.value;
        saveToSessionStorage('smokeSettings', smokeSettings);
    };
    sOpacity.oninput = (e) => {
        smokeSettings.opacity = parseFloat(e.target.value);
        sOpacityVal.innerText = e.target.value;
        saveToSessionStorage('smokeSettings', smokeSettings);
    };
    document.getElementById('smoke-reset').onclick = () => {
        smokeSettings = { active: true, speed: 0.15, opacity: 0.5 };
        sToggle.checked = true;
        sSpeed.value = 0.15; sSpeedVal.innerText = 0.15;
        sOpacity.value = 0.5; sOpacityVal.innerText = 0.5;
        saveToSessionStorage('smokeSettings', smokeSettings);
    };

    // --- SHADERS ---
    const vs = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
    const fs = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_speed;
    uniform float u_opacity;
    uniform bool u_active;

    void main() {
        if (!u_active) { discard; }
        
        vec2 screen_coords = gl_FragCoord.xy;
        float pixel_size = length(u_resolution.xy) / 700.0;
        vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * u_resolution.xy) / length(u_resolution.xy);
        
        uv *= 15.0;
        float t = u_time * u_speed;
        vec2 uv2 = vec2(uv.x + uv.y);

        for(int i=0; i < 8; i++) {
            uv2 += sin(max(uv.x, uv.y)) + uv;
            uv += 0.5 * vec2(cos(5.11 + 0.35 * uv2.y + t), sin(uv2.x - 0.11 * t));
            uv -= 1.0 * cos(uv.x + uv.y) - 1.0 * sin(uv.x * 0.7 - uv.y);
        }

        float intensity = min(1.0, max(0.0, length(uv) * 0.02));
        float alpha = smoothstep(0.1, 0.8, intensity) * u_opacity;
        gl_FragColor = vec4(vec3(intensity * 0.7), alpha);
    }`;

    // --- BOILERPLATE WEBGL ---
    function createShader(gl, type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        return s;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const speedLoc = gl.getUniformLocation(program, "u_speed");
    const opacLoc = gl.getUniformLocation(program, "u_opacity");
    const activeLoc = gl.getUniformLocation(program, "u_active");

    function render(time) {
        if (smokeCanvas.width !== window.innerWidth || smokeCanvas.height !== window.innerHeight) {
            smokeCanvas.width = window.innerWidth;
            smokeCanvas.height = window.innerHeight;
            gl.viewport(0, 0, smokeCanvas.width, smokeCanvas.height);
        }

        gl.useProgram(program);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform2f(resLoc, smokeCanvas.width, smokeCanvas.height);
        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform1f(speedLoc, smokeSettings.speed);
        gl.uniform1f(opacLoc, smokeSettings.opacity);
        gl.uniform1i(activeLoc, smokeSettings.active);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}