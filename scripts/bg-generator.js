// Generador de fondos con patrón de pokémons aleatorios
class BackgroundGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.selectedPokemons = [];
        this.backgroundColor = '';
        this.patternSize = 150;
        this.maxPokemonId = 1025; // Total de pokémons disponibles
        this.loadedImages = []; // Almacenar imágenes cargadas para redibujado rápido
        
        // Paleta de colores pastel
        this.pastelColors = [
            '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
            '#E0BBE4', '#FFDFD3', '#D4F1F4', '#FFC8DD', '#C8E7ED',
            '#E7C6FF', '#C7CEEA', '#B8E0D2', '#FFD6BA', '#EAC4D5',
            '#D6E9CA', '#F7E7CE', '#C9E4E7', '#FADCE7', '#FFE5EC',
            '#FFF5E4', '#E8F3D6', '#D5E1DF', '#FFDEE9', '#E5D9F2',
            '#F8E8EE', '#FFF0F5', '#E6F3FF', '#FFEEF8', '#F0FFF0'
        ];
        
        // Configuración del usuario
        this.config = {
            patternType: 'grid',
            bgType: 'solid',
            bgColor: null,
            gradientColor1: null,
            gradientColor2: null,
            userSelectedColor: false,
            sizeMode: 'fixed',
            imageSize: 150,
            sizeMin: 100,
            sizeMax: 200,
            pokemonDensity: 1.0,
            pokemonCount: 3,
            pokemonMode: 'random',
            pokemonNames: [],
            allowShiny: false,
            generations: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            canvasWidth: 1920,
            canvasHeight: 1080,
            enableBorder: true,
            borderWidth: 3,
            borderColorMode: 'black',
            borderOpacity: 90
        };
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupButtons();
        this.setupColorPalettes();
        this.setupMenu();
        this.generateBackground();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-1';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Ajustar canvas al redimensionar ventana
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.generateBackground();
        });
    }

    setupButtons() {
        document.getElementById('regenerate').addEventListener('click', () => {
            this.generateBackground();
        });

        document.getElementById('download').addEventListener('click', () => {
            this.downloadImage();
        });

        const toggleBtn = document.getElementById('toggle-menu');
        const sideMenu = document.getElementById('side-menu');
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sideMenu.classList.toggle('open');
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (sideMenu.classList.contains('open') && 
                !sideMenu.contains(e.target) && 
                e.target !== toggleBtn) {
                sideMenu.classList.remove('open');
            }
        });

        // Evitar que clics dentro del menú lo cierren
        sideMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    setupColorPalettes() {
        // Crear paleta para color sólido
        const solidPalette = document.getElementById('solid-color-palette');
        this.pastelColors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-option';
            colorBtn.style.backgroundColor = color;
            colorBtn.dataset.color = color;
            colorBtn.addEventListener('click', () => {
                // Deseleccionar todos
                solidPalette.querySelectorAll('.color-option').forEach(btn => 
                    btn.classList.remove('selected')
                );
                // Seleccionar este
                colorBtn.classList.add('selected');
                this.config.bgColor = color;
                this.config.userSelectedColor = true;
                // Actualizar solo el fondo en tiempo real
                this.updateBackgroundOnly();
            });
            solidPalette.appendChild(colorBtn);
        });

        // Crear paleta para gradient color 1
        const gradient1Palette = document.getElementById('gradient-color1-palette');
        this.pastelColors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-option';
            colorBtn.style.backgroundColor = color;
            colorBtn.dataset.color = color;
            colorBtn.addEventListener('click', () => {
                gradient1Palette.querySelectorAll('.color-option').forEach(btn => 
                    btn.classList.remove('selected')
                );
                colorBtn.classList.add('selected');
                this.config.gradientColor1 = color;
                this.config.userSelectedColor = true;
                // Actualizar solo el fondo en tiempo real
                this.updateBackgroundOnly();
            });
            gradient1Palette.appendChild(colorBtn);
        });

        // Crear paleta para gradient color 2
        const gradient2Palette = document.getElementById('gradient-color2-palette');
        this.pastelColors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-option';
            colorBtn.style.backgroundColor = color;
            colorBtn.dataset.color = color;
            colorBtn.addEventListener('click', () => {
                gradient2Palette.querySelectorAll('.color-option').forEach(btn => 
                    btn.classList.remove('selected')
                );
                colorBtn.classList.add('selected');
                this.config.gradientColor2 = color;
                this.config.userSelectedColor = true;
                // Actualizar solo el fondo en tiempo real
                this.updateBackgroundOnly();
            });
            gradient2Palette.appendChild(colorBtn);
        });
    }

    setupMenu() {
        // Inicializar acordeones
        this.setupAccordions();
        
        // === FONDO ===
        document.getElementById('bg-type').addEventListener('change', (e) => {
            this.config.bgType = e.target.value;
            const isSolid = e.target.value === 'solid';
            document.getElementById('solid-color-section').classList.toggle('hidden', !isSolid);
            document.getElementById('gradient-section').classList.toggle('hidden', isSolid);
            // Actualizar solo el fondo en tiempo real
            this.updateBackgroundOnly();
        });

        // === PATRÓN ===
        document.getElementById('pattern-type').addEventListener('change', (e) => {
            this.config.patternType = e.target.value;
            this.redrawPattern();
        });

        document.getElementById('size-mode').addEventListener('change', (e) => {
            this.config.sizeMode = e.target.value;
            const isFixed = e.target.value === 'fixed';
            document.getElementById('fixed-size-section').classList.toggle('hidden', !isFixed);
            document.getElementById('range-size-section').classList.toggle('hidden', isFixed);
            this.updatePatternSize();
            this.redrawPattern();
        });

        const sizeInput = document.getElementById('image-size');
        const sizeValue = document.getElementById('size-value');
        sizeInput.addEventListener('input', (e) => {
            sizeValue.textContent = e.target.value;
            this.config.imageSize = parseInt(e.target.value);
            this.updatePatternSize();
            this.redrawPattern();
        });

        const sizeMinInput = document.getElementById('size-min');
        const sizeMinValue = document.getElementById('size-min-value');
        sizeMinInput.addEventListener('input', (e) => {
            sizeMinValue.textContent = e.target.value;
            this.config.sizeMin = parseInt(e.target.value);
            this.updatePatternSize();
            this.redrawPattern();
        });

        const sizeMaxInput = document.getElementById('size-max');
        const sizeMaxValue = document.getElementById('size-max-value');
        sizeMaxInput.addEventListener('input', (e) => {
            sizeMaxValue.textContent = e.target.value;
            this.config.sizeMax = parseInt(e.target.value);
            this.updatePatternSize();
            this.redrawPattern();
        });

        const densityInput = document.getElementById('pokemon-density');
        const densityValue = document.getElementById('density-value');
        densityInput.addEventListener('input', (e) => {
            densityValue.textContent = parseFloat(e.target.value).toFixed(1);
            this.config.pokemonDensity = parseFloat(e.target.value);
            this.updatePatternSize();
            this.redrawPattern();
        });

        // === CONTORNO ===
        const enableBorderCheckbox = document.getElementById('enable-border');
        const borderSettings = document.getElementById('border-settings');
        
        enableBorderCheckbox.addEventListener('change', (e) => {
            this.config.enableBorder = e.target.checked;
            if (e.target.checked) {
                borderSettings.style.display = 'block';
            } else {
                borderSettings.style.display = 'none';
            }
            this.redrawPattern();
        });

        const borderWidthInput = document.getElementById('border-width');
        const borderWidthValue = document.getElementById('border-width-value');
        borderWidthInput.addEventListener('input', (e) => {
            borderWidthValue.textContent = parseFloat(e.target.value).toFixed(1);
            this.config.borderWidth = parseFloat(e.target.value);
            this.redrawPattern();
        });

        const borderColorRadios = document.querySelectorAll('input[name="border-color"]');
        borderColorRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.config.borderColorMode = e.target.value;
                this.redrawPattern();
            });
        });

        const borderOpacityInput = document.getElementById('border-opacity');
        const borderOpacityValue = document.getElementById('border-opacity-value');
        borderOpacityInput.addEventListener('input', (e) => {
            borderOpacityValue.textContent = e.target.value;
            this.config.borderOpacity = parseInt(e.target.value);
            this.redrawPattern();
        });

        // === POKÉMONS ===
        const pokemonCountInput = document.getElementById('pokemon-count');
        const pokemonCountValue = document.getElementById('pokemon-count-value');
        pokemonCountInput.addEventListener('input', (e) => {
            pokemonCountValue.textContent = e.target.value;
        });

        document.getElementById('pokemon-mode').addEventListener('change', (e) => {
            const isRandom = e.target.value === 'random';
            document.getElementById('random-pokemon-section').style.display = isRandom ? 'block' : 'none';
            document.getElementById('manual-pokemon-section').style.display = isRandom ? 'none' : 'block';
        });

        // === DIMENSIONES ===
        const widthInput = document.getElementById('canvas-width');
        const widthValue = document.getElementById('width-value');
        widthInput.addEventListener('input', (e) => {
            widthValue.textContent = e.target.value;
            this.config.canvasWidth = parseInt(e.target.value);
        });

        const heightInput = document.getElementById('canvas-height');
        const heightValue = document.getElementById('height-value');
        heightInput.addEventListener('input', (e) => {
            heightValue.textContent = e.target.value;
            this.config.canvasHeight = parseInt(e.target.value);
        });

        // Botones de preset
        document.getElementById('preset-fullhd').addEventListener('click', () => {
            widthInput.value = 1920;
            heightInput.value = 1080;
            widthValue.textContent = '1920';
            heightValue.textContent = '1080';
            this.config.canvasWidth = 1920;
            this.config.canvasHeight = 1080;
        });

        document.getElementById('preset-4k').addEventListener('click', () => {
            widthInput.value = 3840;
            heightInput.value = 2160;
            widthValue.textContent = '3840';
            heightValue.textContent = '2160';
            this.config.canvasWidth = 3840;
            this.config.canvasHeight = 2160;
        });

        document.getElementById('preset-window').addEventListener('click', () => {
            widthInput.value = window.innerWidth;
            heightInput.value = window.innerHeight;
            widthValue.textContent = window.innerWidth.toString();
            heightValue.textContent = window.innerHeight.toString();
            this.config.canvasWidth = window.innerWidth;
            this.config.canvasHeight = window.innerHeight;
        });
    }

    setupAccordions() {
        const accordions = document.querySelectorAll('.accordion-header');
        accordions.forEach(header => {
            header.addEventListener('click', () => {
                const accordion = header.parentElement;
                accordion.classList.toggle('active');
            });
        });

        // Abrir el primer acordeón por defecto
        document.querySelector('.accordion').classList.add('active');
    }

    // Actualizar solo el color de fondo sin recargar pokémons
    updateBackgroundOnly() {
        if (!this.loadedImages || this.loadedImages.length === 0) {
            return;
        }

        // Dibujar fondo
        if (this.config.bgType === 'solid') {
            this.ctx.fillStyle = this.config.bgColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
            gradient.addColorStop(0, this.config.gradientColor1);
            gradient.addColorStop(1, this.config.gradientColor2);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Redibujar patrón con las imágenes ya cargadas
        this.drawPattern(this.loadedImages);
    }

    // Redibujar patrón con configuración actualizada
    redrawPattern() {
        if (!this.loadedImages || this.loadedImages.length === 0) {
            return;
        }
        this.updateBackgroundOnly();
    }

    // Actualizar tamaño del patrón basado en configuración
    updatePatternSize() {
        const baseSize = this.config.sizeMode === 'fixed' 
            ? this.config.imageSize 
            : (this.config.sizeMin + this.config.sizeMax) / 2;
        this.patternSize = baseSize / this.config.pokemonDensity;
    }

    getRandomColor() {
        return this.pastelColors[Math.floor(Math.random() * this.pastelColors.length)];
    }

    getRandomPokemons(count = 3) {
        const pokemonIds = [];
        for (let i = 0; i < count; i++) {
            const randomId = Math.floor(Math.random() * this.maxPokemonId) + 1;
            pokemonIds.push(randomId);
        }
        return pokemonIds;
    }

    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Permitir CORS para descargar el canvas
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    drawPattern(images) {
        switch (this.config.patternType) {
            case 'grid':
                this.drawGridPattern(images);
                break;
            case 'flower':
                this.drawFlowerPattern(images);
                break;
            case 'hexagon':
                this.drawHexagonPattern(images);
                break;
            case 'circles':
                this.drawCirclesPattern(images);
                break;
            case 'spiral':
                this.drawSpiralPattern(images);
                break;
            case 'scattered':
                this.drawScatteredPattern(images);
                break;
            default:
                this.drawGridPattern(images);
        }
    }

    drawImageWithBorder(img, x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);

        if (this.config.enableBorder) {
            // Determinar color del borde
            let invertValue = this.config.borderColorMode === 'white' ? 100 : 0;
            
            const borderWidth = Math.max(1, size * (this.config.borderWidth / 100));
            const opacity = this.config.borderOpacity / 100;
            
            this.ctx.globalCompositeOperation = 'source-over';
            
            // Dibujar siluetas en 8 direcciones principales
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                const offsetX = Math.cos(angle) * borderWidth;
                const offsetY = Math.sin(angle) * borderWidth;
                
                this.ctx.save();
                
                this.ctx.filter = `brightness(0) saturate(100%) invert(${invertValue}%) sepia(100%) saturate(0%)`;
                this.ctx.globalAlpha = opacity;
                
                this.ctx.drawImage(img, -size / 2 + offsetX, -size / 2 + offsetY, size, size);
                
                this.ctx.restore();
            }
            
            // Dibujar siluetas adicionales en las diagonales intermedias para un contorno más suave
            for (let angle = Math.PI / 8; angle < Math.PI * 2; angle += Math.PI / 4) {
                const offsetX = Math.cos(angle) * borderWidth;
                const offsetY = Math.sin(angle) * borderWidth;
                
                this.ctx.save();
                
                this.ctx.filter = `brightness(0) saturate(100%) invert(${invertValue}%) sepia(100%) saturate(0%)`;
                this.ctx.globalAlpha = opacity * 0.7;
                
                this.ctx.drawImage(img, -size / 2 + offsetX, -size / 2 + offsetY, size, size);
                
                this.ctx.restore();
            }
        }
        
        // Dibujar imagen principal sin filtros
        this.ctx.filter = 'none';
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
        
        this.ctx.restore();
    }

    drawGridPattern(images) {
        const cols = Math.ceil(this.canvas.width / this.patternSize) + 1;
        const rows = Math.ceil(this.canvas.height / this.patternSize) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const img = images[Math.floor(Math.random() * images.length)];
                const x = col * this.patternSize;
                const y = row * this.patternSize;
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;

                // Calcular tamaño según el modo
                let size;
                if (this.config.sizeMode === 'fixed') {
                    size = this.config.imageSize * (0.8 + Math.random() * 0.4);
                } else {
                    size = this.config.sizeMin + Math.random() * (this.config.sizeMax - this.config.sizeMin);
                }

                const centerX = x + this.patternSize / 2 + offsetX;
                const centerY = y + this.patternSize / 2 + offsetY;
                this.drawImageWithBorder(img, centerX, centerY, size);
            }
        }
    }

    drawFlowerPattern(images) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const numPetals = 12;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.4;

        for (let layer = 0; layer < 5; layer++) {
            const layerRadius = radius * (layer + 1) / 5;
            for (let i = 0; i < numPetals; i++) {
                const angle = (Math.PI * 2 * i) / numPetals + layer * 0.2;
                const x = centerX + Math.cos(angle) * layerRadius;
                const y = centerY + Math.sin(angle) * layerRadius;
                const img = images[Math.floor(Math.random() * images.length)];

                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle);
                this.ctx.globalAlpha = 0.7 + Math.random() * 0.3;
                
                const size = this.patternSize * (0.7 + Math.random() * 0.3);
                this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
                
                this.ctx.restore();
            }
        }
    }

    drawHexagonPattern(images) {
        const hexSize = this.patternSize;
        const hexWidth = hexSize * Math.sqrt(3);
        const hexHeight = hexSize * 2;
        
        const cols = Math.ceil(this.canvas.width / hexWidth) + 1;
        const rows = Math.ceil(this.canvas.height / (hexHeight * 0.75)) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * hexWidth + (row % 2) * (hexWidth / 2);
                const y = row * hexHeight * 0.75;
                const img = images[Math.floor(Math.random() * images.length)];

                // Calcular tamaño según el modo
                let size;
                if (this.config.sizeMode === 'fixed') {
                    size = this.config.imageSize;
                } else {
                    size = this.config.sizeMin + Math.random() * (this.config.sizeMax - this.config.sizeMin);
                }

                this.drawImageWithBorder(img, x, y, size);
            }
        }
    }

    drawCirclesPattern(images) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2)) / 2;
        const numCircles = 8;
        const itemsPerCircle = 16;

        for (let circle = 1; circle <= numCircles; circle++) {
            const radius = (maxRadius / numCircles) * circle;
            for (let i = 0; i < itemsPerCircle; i++) {
                const angle = (Math.PI * 2 * i) / itemsPerCircle;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const img = images[Math.floor(Math.random() * images.length)];

                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + Math.PI / 2);
                this.ctx.globalAlpha = 0.5 + Math.random() * 0.5;
                
                const size = this.patternSize * (0.6 + Math.random() * 0.4);
                this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
                
                this.ctx.restore();
            }
        }
    }

    drawSpiralPattern(images) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.sqrt(Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2)) / 2;
        const numPoints = 100;
        const spiralTightness = 0.3;

        for (let i = 0; i < numPoints; i++) {
            const progress = i / numPoints;
            const angle = progress * Math.PI * 2 * 8;
            const radius = maxRadius * progress;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const img = images[Math.floor(Math.random() * images.length)];

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            
            const size = this.patternSize * (0.5 + progress * 0.5);
            this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
            
            this.ctx.restore();
        }
    }

    drawScatteredPattern(images) {
        const numItems = Math.floor((this.canvas.width * this.canvas.height) / (this.patternSize * this.patternSize) * 1.5);

        for (let i = 0; i < numItems; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const img = images[Math.floor(Math.random() * images.length)];
            const rotation = Math.random() * Math.PI * 2;
            const scale = 0.5 + Math.random() * 1;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.globalAlpha = 0.4 + Math.random() * 0.6;
            
            const size = this.patternSize * scale;
            this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
            
            this.ctx.restore();
        }
    }

    async downloadImage() {
        // Crear un canvas temporal con las dimensiones configuradas
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = this.config.canvasWidth;
        downloadCanvas.height = this.config.canvasHeight;
        const downloadCtx = downloadCanvas.getContext('2d');

        // Guardar el canvas y contexto originales
        const originalCanvas = this.canvas;
        const originalCtx = this.ctx;

        // Temporalmente usar el canvas de descarga
        this.canvas = downloadCanvas;
        this.ctx = downloadCtx;

        // Generar el fondo en el canvas de descarga
        await this.renderBackground();

        // Restaurar el canvas original
        this.canvas = originalCanvas;
        this.ctx = originalCtx;

        // Descargar la imagen del canvas temporal
        const link = document.createElement('a');
        link.download = `pokemon-background-${Date.now()}.png`;
        link.href = downloadCanvas.toDataURL('image/png');
        link.click();
    }

    async generateBackground() {
        await this.renderBackground();
    }

    async renderBackground() {
        // Generar color de fondo si no ha sido seleccionado por el usuario
        if (!this.config.userSelectedColor) {
            if (this.config.bgType === 'solid') {
                this.config.bgColor = this.getRandomColor();
            } else {
                this.config.gradientColor1 = this.getRandomColor();
                this.config.gradientColor2 = this.getRandomColor();
            }
        }

        // Dibujar fondo
        if (this.config.bgType === 'solid') {
            this.ctx.fillStyle = this.config.bgColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
            gradient.addColorStop(0, this.config.gradientColor1);
            gradient.addColorStop(1, this.config.gradientColor2);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Obtener pokémons según el modo
        let pokemonDataList;
        if (this.config.pokemonMode === 'manual' && this.config.pokemonNames.length > 0) {
            // Cargar pokémons por nombre
            pokemonDataList = await Promise.all(
                this.config.pokemonNames.map(name => loadPokemonData(name))
            );
        } else {
            // Cargar pokémons aleatorios que combinen con el color de fondo
            const bgColor = this.config.bgType === 'solid' 
                ? this.config.bgColor 
                : this.config.gradientColor1;
            
            pokemonDataList = await getPokemonsByColor(
                bgColor, 
                this.config.generations, 
                this.config.pokemonCount
            );
        }

        // Filtrar pokémons que se cargaron correctamente y cargar sus imágenes
        const validPokemons = pokemonDataList.filter(data => data !== null);
        const images = await Promise.all(
            validPokemons.map(pokemonData => {
                // Determinar si será shiny
                const isShiny = this.config.allowShiny && Math.random() < 0.1; // 10% probabilidad
                const imageUrl = isShiny && pokemonData.sprites.front_shiny
                    ? pokemonData.sprites.front_shiny
                    : pokemonData.sprites.front_default;
                return this.loadImage(imageUrl);
            })
        );

        // Guardar imágenes cargadas para uso posterior
        this.loadedImages = images;

        // Dibujar el patrón según el tipo seleccionado
        this.drawPattern(images);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundGenerator();
});
