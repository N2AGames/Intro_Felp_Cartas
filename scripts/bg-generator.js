// Generador de fondos con patrón de pokémons aleatorios
class BackgroundGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.patternSize = 150;
        this.loadedImages = []; // Almacenar imágenes cargadas para redibujado rápido
        this.debounceTimeout = null; // Para optimizar el rendimiento
        this.pendingPokemonUpdate = false; // Indica si hay cambios pendientes de Pokémon
        this.isGenerating = false; // Evitar regeneraciones simultáneas
        
        // Paleta de colores pastel (expandida con tonos oscuros)
        this.pastelColors = [
            // Colores claros originales
            '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
            '#E0BBE4', '#FFDFD3', '#D4F1F4', '#FFC8DD', '#C8E7ED',
            '#E7C6FF', '#C7CEEA', '#B8E0D2', '#FFD6BA', '#EAC4D5',
            '#D6E9CA', '#F7E7CE', '#C9E4E7', '#FADCE7', '#FFE5EC',
            '#FFF5E4', '#E8F3D6', '#D5E1DF', '#FFDEE9', '#E5D9F2',
            '#F8E8EE', '#FFF0F5', '#E6F3FF', '#FFEEF8', '#F0FFF0',
            // Colores oscuros pasteles (negros, grises, marrones)
            '#A8A9AD', '#9B9B9B', '#B8B8B8', '#8E8E93', '#C4C4C4',
            '#D1CFC8', '#C7C5B8', '#B5B3A8', '#A39E93', '#D4D2C5',
            '#9D8B7C', '#B89F91', '#C4B5A0', '#A89988', '#D1C2B0',
            '#8D7B6B', '#A68F7E', '#BFA993', '#94836F', '#C9B8A3'
        ];
        
        // Configuración del usuario
        this.config = {
            patternType: 'hexagon',
            bgType: 'solid',
            bgColor: null,
            gradientColor1: null,
            gradientColor2: null,
            pixelArtColor: null,
            userSelectedColor: false,
            patternContent: 'pokemon', // 'pokemon' o 'types'
            sizeMode: 'fixed',
            imageSize: 200,
            sizeMin: 20,
            sizeMax: 400,
            pokemonDensity: 1,
            pokemonCount: 3,
            pokemonMode: 'random',
            pokemonNames: [],
            selectedPokemonList: [], // Nueva lista para los Pokémon seleccionados manualmente
            selectedTypes: [], // Tipos seleccionados para el patrón
            allowShiny: false,
            artStyle: 'smooth', // 'pixel-art' o 'smooth'
            generations: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            canvasWidth: 1920,
            canvasHeight: 1080,
            enableBorder: true,
            borderWidth: 3,
            borderColorMode: 'white',
            borderOpacity: 90,
            enableSilhouette: false,
            silhouetteColor: 'black',
            silhouetteOpacity: 100
        };
        
        this.pokemonNameList = []; // Lista de nombres de Pokémon para autocompletado
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupButtons();
        this.setupColorPalettes();
        this.setupMenu();
        this.setupTypeSelector();
        this.loadPokemonNameList();
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
        
        // Configurar suavizado inicial
        this.updateCanvasSmoothing();
        
        // Ajustar canvas al redimensionar ventana
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            // Reactivar configuración de suavizado después de redimensionar
            this.updateCanvasSmoothing();
            
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

        // Botón de cerrar menú (móvil)
        const closeBtn = document.getElementById('close-menu');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sideMenu.classList.remove('open');
            });
        }

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

        // Crear paleta para pixel art color
        const pixelArtPalette = document.getElementById('pixel-art-color-palette');
        this.pastelColors.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-option';
            colorBtn.style.backgroundColor = color;
            colorBtn.dataset.color = color;
            colorBtn.addEventListener('click', () => {
                pixelArtPalette.querySelectorAll('.color-option').forEach(btn => 
                    btn.classList.remove('selected')
                );
                colorBtn.classList.add('selected');
                this.config.pixelArtColor = color;
                this.config.userSelectedColor = true;
                // Actualizar solo el fondo en tiempo real
                this.updateBackgroundOnly();
            });
            pixelArtPalette.appendChild(colorBtn);
        });
    }

    setupMenu() {
        // Inicializar acordeones
        this.setupAccordions();
        
        // === FONDO ===
        document.getElementById('bg-type').addEventListener('change', (e) => {
            this.config.bgType = e.target.value;
            const isSolid = e.target.value === 'solid';
            const isGradient = e.target.value === 'gradient';
            const isPixelArt = e.target.value === 'pixel-art';
            document.getElementById('solid-color-section').classList.toggle('hidden', !isSolid);
            document.getElementById('gradient-section').classList.toggle('hidden', !isGradient);
            document.getElementById('pixel-art-section').classList.toggle('hidden', !isPixelArt);
            // Actualizar solo el fondo en tiempo real
            this.updateBackgroundOnly();
        });

        // === PATRÓN ===
        document.getElementById('pattern-type').addEventListener('change', (e) => {
            this.config.patternType = e.target.value;
            this.redrawPattern();
        });

        // Selector de contenido del patrón (Pokémon vs Tipos)
        const patternContentSelect = document.getElementById('pattern-content');
        if (patternContentSelect) {
            patternContentSelect.addEventListener('change', (e) => {
                this.config.patternContent = e.target.value;
                const isPokemon = e.target.value === 'pokemon';
                
                // Elementos específicos de modo Pokémon
                const pokemonCountSection = document.getElementById('pokemon-count-section');
                const pokemonModeSection = document.getElementById('pokemon-mode-section');
                const randomPokemonSection = document.getElementById('random-pokemon-section');
                const artStyleSection = document.getElementById('art-style-section');
                const allowShinySection = document.getElementById('allow-shiny-section');
                
                // Elemento específico de modo Tipos
                const typesSelectionSection = document.getElementById('types-selection-section');
                
                // Mostrar/ocultar secciones de pokémon
                if (pokemonCountSection) pokemonCountSection.style.display = isPokemon ? 'block' : 'none';
                if (pokemonModeSection) pokemonModeSection.style.display = isPokemon ? 'block' : 'none';
                if (randomPokemonSection) randomPokemonSection.style.display = isPokemon ? 'block' : 'none';
                if (artStyleSection) artStyleSection.style.display = isPokemon ? 'block' : 'none';
                if (allowShinySection) allowShinySection.style.display = isPokemon ? 'block' : 'none';
                
                // Mostrar/ocultar sección de tipos
                if (typesSelectionSection) typesSelectionSection.style.display = isPokemon ? 'none' : 'block';
                
                // Ocultar sección manual si estamos en modo tipos
                const manualPokemonSection = document.getElementById('manual-pokemon-section');
                if (manualPokemonSection && !isPokemon) {
                    manualPokemonSection.style.display = 'none';
                }
                
                this.pendingPokemonUpdate = true;
                this.generateBackground();
            });
        }

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
            this.redrawPatternDebounced();
        });

        const sizeMinInput = document.getElementById('size-min');
        const sizeMinValue = document.getElementById('size-min-value');
        sizeMinInput.addEventListener('input', (e) => {
            sizeMinValue.textContent = e.target.value;
            this.config.sizeMin = parseInt(e.target.value);
            this.updatePatternSize();
            this.redrawPatternDebounced();
        });

        const sizeMaxInput = document.getElementById('size-max');
        const sizeMaxValue = document.getElementById('size-max-value');
        sizeMaxInput.addEventListener('input', (e) => {
            sizeMaxValue.textContent = e.target.value;
            this.config.sizeMax = parseInt(e.target.value);
            this.updatePatternSize();
            this.redrawPatternDebounced();
        });

        const densityInput = document.getElementById('pokemon-density');
        const densityValue = document.getElementById('density-value');
        densityInput.addEventListener('input', (e) => {
            densityValue.textContent = parseFloat(e.target.value).toFixed(1);
            this.config.pokemonDensity = parseFloat(e.target.value);
            this.updatePatternSize();
            this.redrawPatternDebounced();
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
            this.redrawPatternDebounced();
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
            this.redrawPatternDebounced();
        });

        // === SILUETA ===
        const enableSilhouetteCheckbox = document.getElementById('silhouette-mode');
        const silhouetteSettings = document.getElementById('silhouette-settings');
        
        enableSilhouetteCheckbox.addEventListener('change', (e) => {
            this.config.enableSilhouette = e.target.checked;
            silhouetteSettings.classList.toggle('hidden', !e.target.checked);
            this.redrawPattern();
        });

        const silhouetteColorRadios = document.querySelectorAll('input[name="silhouette-color"]');
        silhouetteColorRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.config.silhouetteColor = e.target.value;
                this.redrawPattern();
            });
        });

        const silhouetteOpacityInput = document.getElementById('silhouette-opacity');
        const silhouetteOpacityValue = document.getElementById('silhouette-opacity-value');
        silhouetteOpacityInput.addEventListener('input', (e) => {
            silhouetteOpacityValue.textContent = e.target.value;
            this.config.silhouetteOpacity = parseInt(e.target.value);
            this.redrawPatternDebounced();
        });

        // === POKÉMONS ===
        const pokemonCountInput = document.getElementById('pokemon-count');
        const pokemonCountValue = document.getElementById('pokemon-count-value');
        pokemonCountInput.addEventListener('input', (e) => {
            pokemonCountValue.textContent = e.target.value;
            this.config.pokemonCount = parseInt(e.target.value);
            this.pendingPokemonUpdate = true;
        });

        document.getElementById('pokemon-mode').addEventListener('change', (e) => {
            const isRandom = e.target.value === 'random';
            document.getElementById('pokemon-count-section').style.display = isRandom ? 'block' : 'none';
            document.getElementById('random-pokemon-section').style.display = isRandom ? 'block' : 'none';
            document.getElementById('manual-pokemon-section').style.display = isRandom ? 'none' : 'block';
            this.config.pokemonMode = e.target.value;
            this.pendingPokemonUpdate = true;
        });

        // === NUEVO COMPONENTE DE BÚSQUEDA DE POKÉMON ===
        this.setupPokemonSearch();

        // === NUEVO SELECTOR DE GENERACIONES ===
        this.setupGenerationSelector();

        // Checkbox de shiny
        document.getElementById('allow-shiny').addEventListener('change', (e) => {
            this.config.allowShiny = e.target.checked;
            this.pendingPokemonUpdate = true;
        });

        // Selector de estilo de arte
        document.getElementById('art-style').addEventListener('change', (e) => {
            this.config.artStyle = e.target.value;
            this.updateCanvasSmoothing();
            this.pendingPokemonUpdate = true;
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

                // Cerrar otros acordeones
                accordions.forEach(otherHeader => {
                    if (otherHeader !== header) {
                        otherHeader.parentElement.classList.remove('active');
                    }
                });
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
        } else if (this.config.bgType === 'gradient') {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
            gradient.addColorStop(0, this.config.gradientColor1);
            gradient.addColorStop(1, this.config.gradientColor2);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (this.config.bgType === 'pixel-art') {
            this.drawPixelArtBackground(this.config.pixelArtColor);
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

    // Redibujar con debounce para optimizar rendimiento
    redrawPatternDebounced() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.redrawPattern();
        }, 150); // 150ms de espera
    }

    // Actualizar tamaño del patrón basado en configuración
    updatePatternSize() {
        const baseSize = this.config.sizeMode === 'fixed' 
            ? this.config.imageSize 
            : (this.config.sizeMin + this.config.sizeMax) / 2;
        this.patternSize = baseSize / this.config.pokemonDensity;
    }

    updateCanvasSmoothing() {
        const enableSmoothing = this.config.artStyle === 'smooth';
        this.ctx.imageSmoothingEnabled = enableSmoothing;
        this.ctx.mozImageSmoothingEnabled = enableSmoothing;
        this.ctx.webkitImageSmoothingEnabled = enableSmoothing;
        this.ctx.msImageSmoothingEnabled = enableSmoothing;
        if (enableSmoothing) {
            this.ctx.imageSmoothingQuality = 'high';
        }
    }

    // Generar variaciones de color para el efecto pixel art
    generateColorVariations(baseColor, count = 4) {
        // Convertir hex a RGB
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        const variations = [];
        for (let i = 0; i < count; i++) {
            const factor = 0.85 + (i / (count - 1)) * 0.3; // Rango de 0.85 a 1.15
            const newR = Math.min(255, Math.round(r * factor));
            const newG = Math.min(255, Math.round(g * factor));
            const newB = Math.min(255, Math.round(b * factor));
            variations.push(`rgb(${newR}, ${newG}, ${newB})`);
        }
        return variations;
    }

    // Dibujar fondo con efecto pixel art
    drawPixelArtBackground(baseColor) {
        const pixelSize = 4; // Tamaño de cada pixel
        const colors = this.generateColorVariations(baseColor, 4);
        
        const cols = Math.ceil(this.canvas.width / pixelSize);
        const rows = Math.ceil(this.canvas.height / pixelSize);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Patrón alternado con variaciones de color
                const colorIndex = ((row % 2) + (col % 2)) % colors.length;
                this.ctx.fillStyle = colors[colorIndex];
                this.ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    // === NUEVOS MÉTODOS PARA COMPONENTES ===
    
    async loadPokemonNameList() {
        try {
            const nameList = await loadPokemonNameList();
            this.pokemonNameList = nameList;
        } catch (error) {
            console.error('Error al cargar lista de Pokémon:', error);
        }
    }

    setupPokemonSearch() {
        const searchInput = document.getElementById('pokemon-search');
        const addBtn = document.getElementById('add-pokemon-btn');
        const dropdown = document.getElementById('pokemon-suggestions-dropdown');
        let selectedIndex = -1;
        let filteredSuggestions = [];
        
        // Mostrar sugerencias al escribir
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            selectedIndex = -1;
            
            if (!query) {
                dropdown.classList.remove('show');
                return;
            }
            
            // Filtrar Pokémon que coincidan
            filteredSuggestions = this.pokemonNameList
                .filter(name => name.toLowerCase().includes(query))
                .slice(0, 10); // Máximo 10 sugerencias
            
            if (filteredSuggestions.length === 0) {
                dropdown.classList.remove('show');
                return;
            }
            
            // Renderizar sugerencias
            dropdown.innerHTML = '';
            filteredSuggestions.forEach((name, index) => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.dataset.index = index;
                
                const icon = document.createElement('img');
                icon.className = 'suggestion-icon';
                const pokemonId = this.pokemonNameList.indexOf(name) + 1;
                // Formatear el ID con ceros a la izquierda (4 dígitos)
                const formattedId = String(pokemonId).padStart(4, '0');
                // Intentar cargar el icono de Mystery Dungeon
                icon.src = `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${formattedId}/Normal.png`;
                icon.onerror = () => {
                    // Fallback a sprites oficiales si falla Mystery Dungeon
                    icon.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
                    icon.onerror = () => {
                        icon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="%23667eea"/></svg>';
                    };
                };
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'suggestion-name';
                nameSpan.innerHTML = name.replace(new RegExp(`(${query})`, 'gi'), '<strong>$1</strong>');
                
                const idSpan = document.createElement('span');
                idSpan.className = 'suggestion-id';
                idSpan.textContent = `#${pokemonId}`;
                
                item.appendChild(icon);
                item.appendChild(nameSpan);
                item.appendChild(idSpan);
                
                // Click en sugerencia
                item.addEventListener('click', () => {
                    searchInput.value = name;
                    dropdown.classList.remove('show');
                    this.addPokemon();
                });
                
                dropdown.appendChild(item);
            });
            
            dropdown.classList.add('show');
        });
        
        // Navegación con teclado
        searchInput.addEventListener('keydown', (e) => {
            const items = dropdown.querySelectorAll('.suggestion-item');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateActiveItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateActiveItem(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    searchInput.value = filteredSuggestions[selectedIndex];
                    dropdown.classList.remove('show');
                }
                this.addPokemon();
            } else if (e.key === 'Escape') {
                dropdown.classList.remove('show');
            }
        });
        
        function updateActiveItem(items) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    item.classList.add('active');
                    item.scrollIntoView({ block: 'nearest' });
                } else {
                    item.classList.remove('active');
                }
            });
        }
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        // Agregar Pokémon al hacer clic en el botón
        addBtn.addEventListener('click', () => {
            this.addPokemon();
        });
    }

    addPokemon() {
        const searchInput = document.getElementById('pokemon-search');
        const dropdown = document.getElementById('pokemon-suggestions-dropdown');
        const pokemonName = searchInput.value.trim().toLowerCase();
        
        if (!pokemonName) return;
        
        // Verificar que no esté ya en la lista
        if (this.config.selectedPokemonList.includes(pokemonName)) {
            searchInput.value = '';
            dropdown.classList.remove('show');
            return;
        }
        
        // Verificar que el nombre sea válido
        if (this.pokemonNameList.length > 0 && !this.pokemonNameList.includes(pokemonName)) {
            alert('Pokémon no encontrado. Por favor, verifica el nombre.');
            return;
        }
        
        // Agregar a la lista
        this.config.selectedPokemonList.push(pokemonName);
        this.renderPokemonTags();
        searchInput.value = '';
        dropdown.classList.remove('show');
        this.pendingPokemonUpdate = true;
    }

    removePokemon(pokemonName) {
        this.config.selectedPokemonList = this.config.selectedPokemonList.filter(name => name !== pokemonName);
        this.renderPokemonTags();
        this.pendingPokemonUpdate = true;
    }

    renderPokemonTags() {
        const container = document.getElementById('selected-pokemon-list');
        container.innerHTML = '';
        
        this.config.selectedPokemonList.forEach(pokemonName => {
            const tag = document.createElement('div');
            tag.className = 'pokemon-tag';
            
            // Icono del Pokémon
            const icon = document.createElement('img');
            icon.className = 'pokemon-tag-icon';
            const pokemonId = this.getPokemonIdFromName(pokemonName);
            const formattedId = String(pokemonId).padStart(4, '0');
            // Usar sprite de Mystery Dungeon
            icon.src = `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${formattedId}/Normal.png`;
            icon.onerror = () => {
                // Fallback a sprites oficiales
                icon.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
                icon.onerror = () => {
                    icon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="%23999"/></svg>';
                };
            };
            
            // Nombre
            const name = document.createElement('span');
            name.className = 'pokemon-tag-name';
            name.textContent = pokemonName;
            
            // Botón de eliminar
            const removeBtn = document.createElement('button');
            removeBtn.className = 'pokemon-tag-remove';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => this.removePokemon(pokemonName));
            
            tag.appendChild(icon);
            tag.appendChild(name);
            tag.appendChild(removeBtn);
            container.appendChild(tag);
        });
    }

    getPokemonIdFromName(name) {
        const index = this.pokemonNameList.indexOf(name.toLowerCase());
        return index >= 0 ? index + 1 : 1;
    }

    setupGenerationSelector() {
        // Botones de acción rápida
        const actionBtns = document.querySelectorAll('.gen-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const toggleBtns = document.querySelectorAll('.gen-toggle-btn');
                
                switch (action) {
                    case 'all':
                        toggleBtns.forEach(tb => tb.classList.add('active'));
                        this.config.generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                        break;
                    case 'none':
                        toggleBtns.forEach(tb => tb.classList.remove('active'));
                        this.config.generations = [];
                        break;
                    case 'classic':
                        toggleBtns.forEach(tb => {
                            const gen = parseInt(tb.dataset.gen);
                            if (gen <= 4) {
                                tb.classList.add('active');
                            } else {
                                tb.classList.remove('active');
                            }
                        });
                        this.config.generations = [1, 2, 3, 4];
                        break;
                    case 'modern':
                        toggleBtns.forEach(tb => {
                            const gen = parseInt(tb.dataset.gen);
                            if (gen >= 5) {
                                tb.classList.add('active');
                            } else {
                                tb.classList.remove('active');
                            }
                        });
                        this.config.generations = [5, 6, 7, 8, 9];
                        break;
                }
                this.pendingPokemonUpdate = true;
            });
        });
        
        // Botones toggle individuales
        const toggleBtns = document.querySelectorAll('.gen-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                
                // Actualizar la configuración
                this.config.generations = Array.from(toggleBtns)
                    .filter(tb => tb.classList.contains('active'))
                    .map(tb => parseInt(tb.dataset.gen));
                
                this.pendingPokemonUpdate = true;
            });
        });
    }

    setupTypeSelector() {
        const typesGrid = document.getElementById('types-grid');
        if (!typesGrid) {
            console.warn('types-grid element not found');
            return;
        }

        // Verificar si getAllTypes está disponible
        if (typeof getAllTypes !== 'function') {
            console.error('getAllTypes function not found');
            return;
        }
        
        // Obtener todos los tipos de Pokémon
        const types = getAllTypes();
        
        // Crear botones para cada tipo
        types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'type-toggle-btn active';
            btn.dataset.type = type.key;
            btn.style.backgroundColor = type.color;
            btn.style.color = 'white';
            btn.style.fontWeight = 'bold';
            btn.style.padding = '8px 12px';
            btn.style.margin = '4px';
            btn.style.border = '2px solid white';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s';
            btn.style.opacity = '1';
            btn.textContent = type.name;
            
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                btn.style.borderColor = btn.classList.contains('active') ? 'white' : 'transparent';
                btn.style.transform = btn.classList.contains('active') ? 'scale(1)' : 'scale(0.95)';
                btn.style.opacity = btn.classList.contains('active') ? '1' : '0.6';
                
                // Actualizar lista de tipos seleccionados
                this.config.selectedTypes = Array.from(typesGrid.querySelectorAll('.type-toggle-btn.active'))
                    .map(b => b.dataset.type);
                
                // Si no hay tipos seleccionados, seleccionar todos
                if (this.config.selectedTypes.length === 0) {
                    typesGrid.querySelectorAll('.type-toggle-btn').forEach(b => {
                        b.classList.add('active');
                        b.style.borderColor = 'white';
                        b.style.transform = 'scale(1)';
                        b.style.opacity = '1';
                    });
                    this.config.selectedTypes = types.map(t => t.key);
                } else {
                    this.pendingPokemonUpdate = true;
                    this.generateBackground();
                }
            });
            
            typesGrid.appendChild(btn);
        });
        
        // Inicializar con todos los tipos seleccionados
        this.config.selectedTypes = types.map(t => t.key);
    }

    getRandomColor() {
        return this.pastelColors[Math.floor(Math.random() * this.pastelColors.length)];
    }

    showSpinner() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('show');
        }
    }

    hideSpinner() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.remove('show');
        }
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
            case 'brick':
                this.drawBrickPattern(images);
                break;
            case 'diagonal':
                this.drawDiagonalPattern(images);
                break;
            case 'wave':
                this.drawWavePattern(images);
                break;
            case 'diamond':
                this.drawDiamondPattern(images);
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
            const borderColor = this.config.borderColorMode === 'white' ? 'white' : 'black';
            const borderWidth = Math.max(1, size * (this.config.borderWidth / 100));
            const opacity = this.config.borderOpacity / 100;
            
            // Método mejorado: dibujar la imagen múltiples veces desplazada
            // para crear un contorno uniforme en todas direcciones
            this.ctx.globalAlpha = opacity;
            this.ctx.filter = `brightness(0) saturate(100%) invert(${this.config.borderColorMode === 'white' ? 100 : 0}%) sepia(100%) saturate(0%)`;
            
            // Más direcciones para grosores grandes = contorno más suave
            const directions = this.config.borderWidth <= 3 ? 8 : 16;
            for (let i = 0; i < directions; i++) {
                const angle = (Math.PI * 2 * i) / directions;
                const offsetX = Math.cos(angle) * borderWidth;
                const offsetY = Math.sin(angle) * borderWidth;
                this.ctx.drawImage(img, -size / 2 + offsetX, -size / 2 + offsetY, size, size);
            }
        }
        
        // Dibujar imagen principal
        this.ctx.filter = 'none';
        this.ctx.globalCompositeOperation = 'source-over';
        
        if (this.config.enableSilhouette) {
            // Aplicar efecto de silueta
            const silhouetteOpacity = this.config.silhouetteOpacity / 100;
            this.ctx.globalAlpha = silhouetteOpacity;
            
            if (this.config.silhouetteColor === 'black') {
                this.ctx.filter = 'brightness(0) saturate(100%)';
            } else if (this.config.silhouetteColor === 'white') {
                this.ctx.filter = 'brightness(0) saturate(100%) invert(100%)';
            } else if (this.config.silhouetteColor === 'transparent') {
                // Solo dibujar el borde si está habilitado, no la imagen
                if (!this.config.enableBorder) {
                    this.ctx.restore();
                    return;
                }
                // Si tiene borde, solo mostramos el borde (ya dibujado arriba)
                this.ctx.restore();
                return;
            }
            
            this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
            // Dibujar imagen normal
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(img, -size / 2, -size / 2, size, size);
        }
        
        this.ctx.restore();
    }

    drawGridPattern(images) {
        const cols = Math.ceil(this.canvas.width / this.patternSize) + 1;
        const rows = Math.ceil(this.canvas.height / this.patternSize) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Intercalar Pokémon basándose en la posición de la cuadrícula
                const imgIndex = (row * cols + col) % images.length;
                const img = images[imgIndex];
                const x = col * this.patternSize;
                const y = row * this.patternSize;

                // Calcular tamaño según el modo
                let size;
                if (this.config.sizeMode === 'fixed') {
                    size = this.config.imageSize;
                } else {
                    size = this.config.sizeMin + Math.random() * (this.config.sizeMax - this.config.sizeMin);
                }

                const centerX = x + this.patternSize / 2;
                const centerY = y + this.patternSize / 2;
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
                // Intercalar Pokémon basándose en capa e índice
                const imgIndex = (layer * numPetals + i) % images.length;
                const img = images[imgIndex];

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
        const hexSize = this.patternSize * 0.7; // Reducir gap
        const hexWidth = hexSize * Math.sqrt(3);
        const hexHeight = hexSize * 2;
        
        const cols = Math.ceil(this.canvas.width / hexWidth) + 1;
        const rows = Math.ceil(this.canvas.height / (hexHeight * 0.75)) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * hexWidth + (row % 2) * (hexWidth / 2);
                const y = row * hexHeight * 0.75;
                // Intercalar Pokémon basándose en la posición hexagonal
                const imgIndex = (row * cols + col) % images.length;
                const img = images[imgIndex];

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

    drawBrickPattern(images) {
        const cols = Math.ceil(this.canvas.width / this.patternSize) + 1;
        const rows = Math.ceil(this.canvas.height / this.patternSize) + 1;

        for (let row = 0; row < rows; row++) {
            const offset = (row % 2) * (this.patternSize / 2);
            for (let col = 0; col < cols; col++) {
                const imgIndex = (row * cols + col) % images.length;
                const img = images[imgIndex];
                const x = col * this.patternSize + offset;
                const y = row * this.patternSize;

                let size;
                if (this.config.sizeMode === 'fixed') {
                    size = this.config.imageSize;
                } else {
                    size = this.config.sizeMin + Math.random() * (this.config.sizeMax - this.config.sizeMin);
                }

                const centerX = x + this.patternSize / 2;
                const centerY = y + this.patternSize / 2;
                this.drawImageWithBorder(img, centerX, centerY, size);
            }
        }
    }

    drawDiagonalPattern(images) {
        const diagonalSpacing = this.patternSize * 1.2;
        const cols = Math.ceil(this.canvas.width / diagonalSpacing) + 2;
        const rows = Math.ceil(this.canvas.height / diagonalSpacing) + 2;

        let imgCounter = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const imgIndex = imgCounter % images.length;
                const img = images[imgIndex];
                
                // Posición diagonal
                const x = col * diagonalSpacing + row * diagonalSpacing;
                const y = row * diagonalSpacing;

                if (x < this.canvas.width + diagonalSpacing && y < this.canvas.height + diagonalSpacing) {
                    let size;
                    if (this.config.sizeMode === 'fixed') {
                        size = this.config.imageSize;
                    } else {
                        size = this.config.sizeMin + Math.random() * (this.config.sizeMax - this.config.sizeMin);
                    }

                    this.drawImageWithBorder(img, x, y, size);
                    imgCounter++;
                }
            }
        }
    }

    drawWavePattern(images) {
        const cols = Math.ceil(this.canvas.width / this.patternSize) + 1;
        const rows = Math.ceil(this.canvas.height / this.patternSize) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const imgIndex = (row * cols + col) % images.length;
                const img = images[imgIndex];
                
                // Crear efecto de onda sinusoidal
                const waveOffset = Math.sin(col * 0.5) * (this.patternSize * 0.3);
                const x = col * this.patternSize;
                const y = row * this.patternSize + waveOffset;

                let size;
                if (this.config.sizeMode === 'fixed') {
                    size = this.config.imageSize;
                } else {
                    size = this.config.sizeMin + Math.random() * (this.config.sizeMax - this.config.sizeMin);
                }

                const centerX = x + this.patternSize / 2;
                const centerY = y + this.patternSize / 2;
                this.drawImageWithBorder(img, centerX, centerY, size);
            }
        }
    }

    drawDiamondPattern(images) {
        const diamondSize = this.patternSize * 1.4;
        const cols = Math.ceil(this.canvas.width / diamondSize) + 1;
        const rows = Math.ceil(this.canvas.height / (diamondSize * 0.5)) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const imgIndex = (row * cols + col) % images.length;
                const img = images[imgIndex];
                
                // Patrón de diamante/rombo
                const offsetX = (row % 2) * (diamondSize / 2);
                const x = col * diamondSize + offsetX;
                const y = row * (diamondSize * 0.5);

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
                // Intercalar Pokémon basándose en círculo e índice
                const imgIndex = ((circle - 1) * itemsPerCircle + i) % images.length;
                const img = images[imgIndex];

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
            // Intercalar Pokémon basándose en el índice del punto
            const imgIndex = i % images.length;
            const img = images[imgIndex];

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
            // Intercalar Pokémon basándose en el índice
            const imgIndex = i % images.length;
            const img = images[imgIndex];
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
        // Mostrar spinner
        this.showSpinner();
        
        try {
            // Verificar que haya imágenes cargadas
            if (!this.loadedImages || this.loadedImages.length === 0) {
                alert('Por favor, genera un fondo primero antes de descargar.');
                return;
            }

            // Crear un canvas temporal con las dimensiones configuradas
            const downloadCanvas = document.createElement('canvas');
            downloadCanvas.width = this.config.canvasWidth;
            downloadCanvas.height = this.config.canvasHeight;
            const downloadCtx = downloadCanvas.getContext('2d');

            // Aplicar configuración de suavizado al canvas de descarga
            const enableSmoothing = this.config.artStyle === 'smooth';
            downloadCtx.imageSmoothingEnabled = enableSmoothing;
            downloadCtx.mozImageSmoothingEnabled = enableSmoothing;
            downloadCtx.webkitImageSmoothingEnabled = enableSmoothing;
            downloadCtx.msImageSmoothingEnabled = enableSmoothing;
            if (enableSmoothing) {
                downloadCtx.imageSmoothingQuality = 'high';
            }

            // Guardar el canvas y contexto originales
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;

            // Temporalmente usar el canvas de descarga
            this.canvas = downloadCanvas;
            this.ctx = downloadCtx;

            // Dibujar el mismo fondo que se está mostrando
            if (this.config.bgType === 'solid') {
                this.ctx.fillStyle = this.config.bgColor;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else if (this.config.bgType === 'gradient') {
                const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                gradient.addColorStop(0, this.config.gradientColor1);
                gradient.addColorStop(1, this.config.gradientColor2);
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            } else if (this.config.bgType === 'pixel-art') {
                this.drawPixelArtBackground(this.config.pixelArtColor);
            }

            // Dibujar el mismo patrón con las imágenes ya cargadas
            this.drawPattern(this.loadedImages);

            // Restaurar el canvas original
            this.canvas = originalCanvas;
            this.ctx = originalCtx;

            // Descargar la imagen del canvas temporal
            const link = document.createElement('a');
            link.download = `pokemon-background-${Date.now()}.png`;
            link.href = downloadCanvas.toDataURL('image/png');
            link.click();
        } finally {
            // Ocultar spinner
            this.hideSpinner();
        }
    }

    async generateBackground() {
        // Evitar generaciones simultáneas
        if (this.isGenerating) {
            return;
        }
        
        this.isGenerating = true;
        // Mostrar spinner
        this.showSpinner();
        
        try {
            // Restablecer la selección de color del usuario si hay cambios de Pokémon pendientes
            if (this.pendingPokemonUpdate) {
                this.config.userSelectedColor = false;
                this.pendingPokemonUpdate = false;
            }
            await this.renderBackground();
            // Actualizar la selección visual de colores después de generar
            this.updateColorSelection();
        } finally {
            // Ocultar spinner siempre, incluso si hay error
            this.hideSpinner();
            this.isGenerating = false;
        }
    }

    // Actualizar la selección visual de los colores en las paletas
    updateColorSelection() {
        // Actualizar color sólido
        if (this.config.bgType === 'solid' && this.config.bgColor) {
            const solidPalette = document.getElementById('solid-color-palette');
            solidPalette.querySelectorAll('.color-option').forEach(btn => {
                if (btn.dataset.color === this.config.bgColor) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }
        
        // Actualizar colores de gradiente
        if (this.config.bgType === 'gradient') {
            const gradient1Palette = document.getElementById('gradient-color1-palette');
            gradient1Palette.querySelectorAll('.color-option').forEach(btn => {
                if (btn.dataset.color === this.config.gradientColor1) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
            
            const gradient2Palette = document.getElementById('gradient-color2-palette');
            gradient2Palette.querySelectorAll('.color-option').forEach(btn => {
                if (btn.dataset.color === this.config.gradientColor2) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }
        
        // Actualizar color pixel art
        if (this.config.bgType === 'pixel-art' && this.config.pixelArtColor) {
            const pixelArtPalette = document.getElementById('pixel-art-color-palette');
            pixelArtPalette.querySelectorAll('.color-option').forEach(btn => {
                if (btn.dataset.color === this.config.pixelArtColor) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }
    }

    async renderBackground() {
        // Validación adicional por seguridad
        if (this.isGenerating === false) {
            return;
        }
        
        let images;
        let isTypesMode = false;
        
        // Modo de patrón: Pokémon o Tipos
        if (this.config.patternContent === 'types') {
            // Cargar iconos de tipos
            if (typeof pokemonTypes === 'undefined' || typeof loadTypeIcons !== 'function') {
                console.error('Pokemon types data not loaded. Falling back to pokemon mode.');
                this.config.patternContent = 'pokemon';
            } else {
                isTypesMode = true;
                const typesSelected = this.config.selectedTypes.length > 0 
                    ? this.config.selectedTypes 
                    : Object.keys(pokemonTypes);
                
                images = await loadTypeIcons(typesSelected);
                
                // Sugerir color basado en los tipos seleccionados
                if (!this.config.userSelectedColor && typesSelected.length > 0) {
                    const typeData = typesSelected.map(key => pokemonTypes[key]);
                    const colors = typeData.map(t => t.color);
                    const suggestedColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    if (this.config.bgType === 'solid') {
                        this.config.bgColor = suggestedColor;
                    } else if (this.config.bgType === 'gradient') {
                        this.config.gradientColor1 = colors[0];
                        this.config.gradientColor2 = colors[colors.length - 1];
                    } else if (this.config.bgType === 'pixel-art') {
                        this.config.pixelArtColor = suggestedColor;
                    }
                }
            }
        }
        
        // Modo Pokémon (original) - se ejecuta si no estamos en modo tipos o si el modo de tipos falla
        if (!isTypesMode) {
            // Modo Pokémon (original)
            // Obtener pokémons según el modo
            let pokemonDataList;
            if (this.config.pokemonMode === 'manual' && this.config.selectedPokemonList.length > 0) {
                // Cargar pokémons por nombre desde la nueva lista
                pokemonDataList = await Promise.all(
                    this.config.selectedPokemonList.map(name => loadPokemonData(name).catch(() => null))
                );
                pokemonDataList = pokemonDataList.filter(data => data !== null);
            } else {
                // Cargar pokémons aleatorios con colores similares según las generaciones seleccionadas
                pokemonDataList = await getPokemonsByColorSimilarity(this.config.generations, this.config.pokemonCount);
            }

            // Si no se ha seleccionado un color, sugerir uno basado en los Pokémon
            if (!this.config.userSelectedColor) {
                const colorSuggestion = await suggestColorsFromPokemons(pokemonDataList, this.pastelColors);
                
                if (this.config.bgType === 'solid') {
                    this.config.bgColor = colorSuggestion.suggested;
                } else if (this.config.bgType === 'gradient') {
                    // Para degradado, usar el color sugerido y otro aleatorio de la paleta
                    this.config.gradientColor1 = colorSuggestion.suggested;
                    const otherColors = colorSuggestion.alternatives.filter(c => c !== colorSuggestion.suggested);
                    this.config.gradientColor2 = otherColors[Math.floor(Math.random() * otherColors.length)];
                } else if (this.config.bgType === 'pixel-art') {
                    this.config.pixelArtColor = colorSuggestion.suggested;
                }
            }

            // Filtrar pokémons que se cargaron correctamente y cargar sus imágenes
            const validPokemons = pokemonDataList.filter(data => data !== null);
            images = await Promise.all(
                validPokemons.map(pokemonData => {
                    // Determinar si será shiny
                    const isShiny = this.config.allowShiny && Math.random() < 0.1; // 10% probabilidad
                    
                    let imageUrl;
                    if (this.config.artStyle === 'smooth') {
                        // Usar arte oficial de alta calidad
                        imageUrl = isShiny && pokemonData.sprites.other?.['official-artwork']?.front_shiny
                            ? pokemonData.sprites.other['official-artwork'].front_shiny
                            : pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default;
                    } else if (this.config.artStyle === 'mystery-dungeon') {
                        // Usar sprites de Mystery Dungeon (PMDCollab)
                        const pokemonId = pokemonData.id;
                        const formattedId = String(pokemonId).padStart(4, '0');
                        const shinyFolder = isShiny ? 'Shiny' : 'Normal';
                        imageUrl = `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/${formattedId}/${shinyFolder}.png`;
                    } else {
                        // Usar sprites pixel art
                        imageUrl = isShiny && pokemonData.sprites.front_shiny
                            ? pokemonData.sprites.front_shiny
                            : pokemonData.sprites.front_default;
                    }
                    
                    return this.loadImage(imageUrl);
                })
            );
        }

        // Dibujar fondo
        if (this.config.bgType === 'solid') {
            this.ctx.fillStyle = this.config.bgColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (this.config.bgType === 'gradient') {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
            gradient.addColorStop(0, this.config.gradientColor1);
            gradient.addColorStop(1, this.config.gradientColor2);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (this.config.bgType === 'pixel-art') {
            this.drawPixelArtBackground(this.config.pixelArtColor);
        }

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
