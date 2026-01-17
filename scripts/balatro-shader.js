function initBalatroShader() {
    // --- CONFIGURACIÓN DEL BALATRO SHADER ---
    let defaults = {
        active: true,
        speed: 1.4,
        intensity: 0.9,
        distortion: 1.1,
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

    // Original by localthunk (https://www.playbalatro.com)
    #define SPIN_ROTATION -2.0
    #define SPIN_SPEED 7.0
    #define OFFSET vec2(0.0)
    #define COLOUR_1 vec4(0.871, 0.267, 0.231, 1.0)
    #define COLOUR_2 vec4(0.0, 0.42, 0.706, 1.0)
    #define COLOUR_3 vec4(0.086, 0.137, 0.145, 1.0)
    #define CONTRAST 3.5
    #define LIGTHING 0.4
    #define SPIN_AMOUNT 0.25
    #define PIXEL_FILTER 745.0
    #define SPIN_EASE 1.0
    #define PI 3.14159265359
    #define IS_ROTATE false

    void main() {
        if (!u_active) { discard; }
        
        vec2 screen_coords = gl_FragCoord.xy;
        vec2 screenSize = u_resolution.xy;
        
        float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
        vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
        float uv_len = length(uv);
        
        float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
        if(IS_ROTATE){
           speed = u_time * speed;
        }
        speed += 302.2;
        float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
        vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
        uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);
        
        uv *= 30.0 * u_distortion;
        speed = u_time * (SPIN_SPEED * u_speed);
        vec2 uv2 = vec2(uv.x+uv.y);
        
        for(int i=0; i < 5; i++) {
            uv2 += sin(max(uv.x, uv.y)) + uv;
            uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
            uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
        }
        
        float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2) * u_intensity;
        float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
        float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
        float c2p = max(0.,1. - contrast_mod*abs(paint_res));
        float c3p = 1. - min(1., c1p + c2p);
        float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);
        
        vec4 finalColor = (0.3/CONTRAST)*COLOUR_1 + (1. - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a)) + light;
        
        gl_FragColor = finalColor;
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
