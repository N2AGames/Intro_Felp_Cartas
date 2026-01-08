///#region CONTROL DE AUDIO Y BOTONES

document.addEventListener('DOMContentLoaded', () => {
    const music = document.getElementById('bg-music');
    const muteBtn = document.getElementById('mute-control');

    const toggleChanelInfoBtn = document.getElementById('toggle-chanel-info');
    const chanelInfo = document.querySelector('.chanel-info');

    if (music) {
        music.volume = 0.05; // Volumen inicial bajo
        music.currentTime = 0; // Asegura que empiece en el segundo 0

        // Función para intentar reproducir automáticamente
        const startMusic = () => {
            music.play().then(() => {
                muteBtn.innerText = "🔊";
                muteBtn.classList.add('active');
                // Una vez que suena, quitamos los escuchadores globales de inicio
                window.removeEventListener('click', startMusic);
                window.removeEventListener('keydown', startMusic);
            }).catch(err => {
                console.log("Reproducción automática bloqueada. Esperando interacción.");
                muteBtn.innerText = "🔇";
                muteBtn.classList.remove('active');
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
                music.play().then(() => {
                    muteBtn.innerText = "🔊";
                    muteBtn.classList.add('active');
                }).catch(err => {
                    console.log("No se pudo reproducir la música.");
                });
            } else {
                music.pause();
                muteBtn.innerText = "🔇";
                muteBtn.classList.remove('active');
            }
        });

        // Control del botón de mostrar/ocultar info del canal
        toggleChanelInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const presEl = document.getElementById('pres-container');
            const isOpen = window.getComputedStyle(chanelInfo).display !== 'none';
            const isPortrait = window.matchMedia('(orientation: portrait)').matches;

            if (isOpen) {
                // Cerrar siempre el panel; quitar la clase si estaba aplicada
                chanelInfo.style.display = 'none';
                toggleChanelInfoBtn.classList.remove('active');
                if (presEl) presEl.classList.remove('hidden-by-panel');
            } else {
                // Abrir el panel. Solo ocultar el mazo si estamos en portrait
                chanelInfo.style.display = 'block';
                toggleChanelInfoBtn.classList.add('active');
                if (presEl && isPortrait) presEl.classList.add('hidden-by-panel');
            }
        });

    }

    // Init background & pattern controls (si existen)
    attachBgControls(); // desde bg-control.js
    attachPatternControls(); // desde pattern-bg-control.js
    initSmokeShader(); // desde smoke-shader.js
    initStarsShader(); // desde stars-shader.js

    // Sincronizar visibilidad del mazo con la orientación (solo en portrait)
    function syncDeckVisibilityWithOrientation(){
        const deckEl = document.getElementById('deck-container');
        if (!deckEl) return;
        const isPortrait = window.matchMedia('(orientation: portrait)').matches;
        const isOpen = window.getComputedStyle(chanelInfo).display !== 'none';
        if (isOpen && isPortrait) deckEl.classList.add('hidden-by-panel');
        else deckEl.classList.remove('hidden-by-panel');
    }

    // Llamadas para mantener el estado al rotar/redimensionar
    window.addEventListener('resize', syncDeckVisibilityWithOrientation);
    window.addEventListener('orientationchange', syncDeckVisibilityWithOrientation);
    // Ejecutar una vez al inicio
    syncDeckVisibilityWithOrientation();

    // Abrir generador de fondos en nueva ventana
    const openBgGeneratorBtn = document.getElementById('open-bg-generator');
    if (openBgGeneratorBtn) {
        openBgGeneratorBtn.addEventListener('click', () => {
            window.open('bg-generator.html');
        });
    }

    // Cerrar sección del generador de fondos
    const closeBgGeneratorBtn = document.getElementById('close-bg-generator');
    const bgGeneratorSection = document.getElementById('bg-generator-section');
    if (closeBgGeneratorBtn && bgGeneratorSection) {
        closeBgGeneratorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bgGeneratorSection.style.display = 'none';
        });
    }
});
//#endregion