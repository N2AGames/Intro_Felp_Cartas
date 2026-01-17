function rgbToHex(rgb){
    // rgb(255,255,255) or rgba(...)
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return '#000000';
    const r = parseInt(m[1],10), g = parseInt(m[2],10), b = parseInt(m[3],10);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function attachBgControls(){
    // Controles personalizados de color
    const colorBtns = document.querySelectorAll('.color-btn');
    if (colorBtns.length === 0) return;
    
    const computedBg = window.getComputedStyle(document.body).backgroundColor;
    const sessionBg = getFromSessionStorage('bgColor');
    var defaultColor = rgbToHex(computedBg);
    if (sessionBg) {
        defaultColor = sessionBg;
    }

    document.body.style.backgroundColor = defaultColor;
    saveToSessionStorage('bgColor', defaultColor);
    
    // Marcar el color activo por defecto
    colorBtns.forEach(btn => {
        if (btn.dataset.color === defaultColor) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', (e) => {
            // Remover active de todos
            colorBtns.forEach(b => b.classList.remove('active'));
            // Agregar active al clickeado
            e.target.classList.add('active');
            // Cambiar color de fondo
            document.body.style.backgroundColor = e.target.dataset.color;
            // Almacenao la propiedad en sesión
            saveToSessionStorage('bgColor', e.target.dataset.color);
        });
    });
}

function setBgColor(color) {
    const colorBtns = document.querySelectorAll('.color-btn');
    document.body.style.backgroundColor = color;
    colorBtns.forEach(b => {
        debugger;
        if (b.dataset.color === color) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    saveToSessionStorage('bgColor', color);
}

function disableColors() {
    const bgPanel = document.getElementById('bg-panel');
    if (bgPanel) {
        bgPanel.style.display = 'none';
    }
}

function enableColors() {
    const bgPanel = document.getElementById('bg-panel');
    if (bgPanel) {
        bgPanel.style.display = '';
    }
}