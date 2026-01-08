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
            bgColor: '#4ECDC4',
            imageSize: 150,
            pokemonDensity: 3
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
    }

    setupButtons() {
        document.getElementById('regenerate').addEventListener('click', () => {
            this.generateBackground();
        });

        document.getElementById('download').addEventListener('click', () => {
            this.downloadImage();
        });

        document.getElementById('toggle-menu').addEventListener('click', () => {
            document.getElementById('side-menu').classList.toggle('open');
        });
    }

    setupMenu() {
        // Actualizar valores mostrados en los rangos
        const sizeInput = document.getElementById('image-size');
        const sizeValue = document.getElementById('size-value');
        sizeInput.addEventListener('input', (e) => {
            sizeValue.textContent = e.target.value;
        });

        const densityInput = document.getElementById('pokemon-density');
        const densityValue = document.getElementById('density-value');
        densityInput.addEventListener('input', (e) => {
            densityValue.textContent = parseFloat(e.target.value).toFixed(1);
        });

        // Botón de color aleatorio
        document.getElementById('random-color').addEventListener('click', () => {
            const randomColor = this.getRandomColor();
            document.getElementById('bg-color').value = randomColor;
        });

        // Botón aplicar configuración
        document.getElementById('apply-settings').addEventListener('click', () => {
            this.config.patternType = document.getElementById('pattern-type').value;
            this.config.bgColor = document.getElementById('bg-color').value;
            this.config.imageSize = parseInt(document.getElementById('image-size').value);
            this.config.pokemonDensity = parseFloat(document.getElementById('pokemon-density').value);
            // La densidad afecta el espaciado: menor densidad = más separados
            this.patternSize = this.config.imageSize / this.config.pokemonDensity;
            
            this.generateBackground();
        });
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

    async generateBackground() {
        // Usar el color configurado o uno aleatorio si no se ha configurado
        this.backgroundColor = this.config.bgColor;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Usar entre 2 y 4 tipos diferentes de pokémon
        const pokemonCount = Math.floor(Math.random() * 3) + 2;
        const pokemonIds = this.getRandomPokemons(pokemonCount);

        // Cargar los datos de los pokémons desde la API
        const pokemonDataList = await Promise.all(
            pokemonIds.map(id => loadRandomPokemon(id)) // from scripts/pokemon-data.js
        );

        // Filtrar pokémons que se cargaron correctamente y cargar sus imágenes
        const validPokemons = pokemonDataList.filter(data => data !== null);
        const images = await Promise.all(
            validPokemons.map(pokemonData => {
                // Intentar obtener la mejor imagen disponible
                const imageUrl = pokemonData.sprites.front_default;
                return this.loadImage(imageUrl);
            })
        );

        // Dibujar el patrón según el tipo seleccionado
        this.drawPattern(images);
    }

    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
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
                const scale = 0.8 + Math.random() * 0.4;

                this.ctx.save();
                this.ctx.translate(x + this.patternSize / 2 + offsetX, y + this.patternSize / 2 + offsetY);
                
                const size = this.patternSize * scale;
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

                this.ctx.save();
                this.ctx.translate(x, y);
                
                const size = this.patternSize;
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

    downloadImage() {
        const link = document.createElement('a');
        link.download = `pokemon-background-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundGenerator();
});
