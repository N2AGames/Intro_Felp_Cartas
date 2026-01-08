// Generador de fondos con patrón de pokémons aleatorios
class BackgroundGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.selectedPokemons = [];
        this.backgroundColor = '';
        this.patternSize = 150;
        this.maxPokemonId = 1025; // Total de pokémons disponibles
        
        // Configuración del usuario
        this.config = {
            patternType: 'grid',
            bgType: 'solid',
            bgColor: '#4ECDC4',
            gradientColor1: '#4ECDC4',
            gradientColor2: '#45B7D1',
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
            canvasHeight: 1080
        };
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupButtons();
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

    setupMenu() {
        // Inicializar acordeones
        this.setupAccordions();
        
        // === FONDO ===
        document.getElementById('bg-type').addEventListener('change', (e) => {
            const isSolid = e.target.value === 'solid';
            document.getElementById('solid-color-section').classList.toggle('hidden', !isSolid);
            document.getElementById('gradient-section').classList.toggle('hidden', isSolid);
        });

        document.getElementById('random-color').addEventListener('click', () => {
            const randomColor = this.getRandomColor();
            document.getElementById('bg-color').value = randomColor;
        });

        document.getElementById('random-gradient').addEventListener('click', () => {
            document.getElementById('gradient-color1').value = this.getRandomColor();
            document.getElementById('gradient-color2').value = this.getRandomColor();
        });

        // === PATRÓN ===
        document.getElementById('size-mode').addEventListener('change', (e) => {
            const isFixed = e.target.value === 'fixed';
            document.getElementById('fixed-size-section').classList.toggle('hidden', !isFixed);
            document.getElementById('range-size-section').classList.toggle('hidden', isFixed);
        });

        const sizeInput = document.getElementById('image-size');
        const sizeValue = document.getElementById('size-value');
        sizeInput.addEventListener('input', (e) => {
            sizeValue.textContent = e.target.value;
        });

        const sizeMinInput = document.getElementById('size-min');
        const sizeMinValue = document.getElementById('size-min-value');
        sizeMinInput.addEventListener('input', (e) => {
            sizeMinValue.textContent = e.target.value;
        });

        const sizeMaxInput = document.getElementById('size-max');
        const sizeMaxValue = document.getElementById('size-max-value');
        sizeMaxInput.addEventListener('input', (e) => {
            sizeMaxValue.textContent = e.target.value;
        });

        const densityInput = document.getElementById('pokemon-density');
        const densityValue = document.getElementById('density-value');
        densityInput.addEventListener('input', (e) => {
            densityValue.textContent = parseFloat(e.target.value).toFixed(1);
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
        });

        const heightInput = document.getElementById('canvas-height');
        const heightValue = document.getElementById('height-value');
        heightInput.addEventListener('input', (e) => {
            heightValue.textContent = e.target.value;
        });

        // Botones de preset
        document.getElementById('preset-fullhd').addEventListener('click', () => {
            widthInput.value = 1920;
            heightInput.value = 1080;
            widthValue.textContent = '1920';
            heightValue.textContent = '1080';
        });

        document.getElementById('preset-4k').addEventListener('click', () => {
            widthInput.value = 3840;
            heightInput.value = 2160;
            widthValue.textContent = '3840';
            heightValue.textContent = '2160';
        });

        document.getElementById('preset-window').addEventListener('click', () => {
            widthInput.value = window.innerWidth;
            heightInput.value = window.innerHeight;
            widthValue.textContent = window.innerWidth.toString();
            heightValue.textContent = window.innerHeight.toString();
        });

        // Botón aplicar configuración
        document.getElementById('apply-settings').addEventListener('click', () => {
            this.applySettings();
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

    applySettings() {
        // Fondo
        this.config.bgType = document.getElementById('bg-type').value;
        this.config.bgColor = document.getElementById('bg-color').value;
        this.config.gradientColor1 = document.getElementById('gradient-color1').value;
        this.config.gradientColor2 = document.getElementById('gradient-color2').value;

        // Patrón
        this.config.patternType = document.getElementById('pattern-type').value;
        this.config.sizeMode = document.getElementById('size-mode').value;
        this.config.imageSize = parseInt(document.getElementById('image-size').value);
        this.config.sizeMin = parseInt(document.getElementById('size-min').value);
        this.config.sizeMax = parseInt(document.getElementById('size-max').value);
        this.config.pokemonDensity = parseFloat(document.getElementById('pokemon-density').value);
        
        // La densidad afecta el espaciado
        const baseSize = this.config.sizeMode === 'fixed' 
            ? this.config.imageSize 
            : (this.config.sizeMin + this.config.sizeMax) / 2;
        this.patternSize = baseSize / this.config.pokemonDensity;

        // Pokémons
        this.config.pokemonCount = parseInt(document.getElementById('pokemon-count').value);
        this.config.pokemonMode = document.getElementById('pokemon-mode').value;
        this.config.allowShiny = document.getElementById('allow-shiny').checked;

        if (this.config.pokemonMode === 'manual') {
            const names = document.getElementById('pokemon-names').value;
            this.config.pokemonNames = names.split(',').map(n => n.trim()).filter(n => n);
        } else {
            // Obtener generaciones seleccionadas
            const checkboxes = document.querySelectorAll('.gen-checkbox:checked');
            this.config.generations = Array.from(checkboxes).map(cb => parseInt(cb.value));
        }

        // Dimensiones
        this.config.canvasWidth = parseInt(document.getElementById('canvas-width').value);
        this.config.canvasHeight = parseInt(document.getElementById('canvas-height').value);

        this.generateBackground();
    }

    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
            '#E63946', '#A8DADC', '#457B9D', '#F4A261', '#E76F51',
            '#2A9D8F', '#E9C46A', '#F4A259', '#BC4B51', '#8ECAE6'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
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

                this.ctx.save();
                this.ctx.translate(x + this.patternSize / 2 + offsetX, y + this.patternSize / 2 + offsetY);
                
                this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
                
                this.ctx.restore();
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

                this.ctx.save();
                this.ctx.translate(x, y);
                
                this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
                
                this.ctx.restore();
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
            // Cargar pokémons aleatorios usando las generaciones seleccionadas
            const promises = [];
            for (let i = 0; i < this.config.pokemonCount; i++) {
                promises.push(loadRandomPokemon(null, this.config.generations));
            }
            pokemonDataList = await Promise.all(promises);
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

        // Dibujar el patrón según el tipo seleccionado
        this.drawPattern(images);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundGenerator();
});
