// Datos de tipos de Pokémon con iconos locales
const pokemonTypes = {
    'normal': { name: 'Normal', color: '#A8A878', icon: 'img/type-icons/normal.png' },
    'fighting': { name: 'Lucha', color: '#C03028', icon: 'img/type-icons/fighting.png' },
    'flying': { name: 'Volador', color: '#A890F0', icon: 'img/type-icons/flying.png' },
    'poison': { name: 'Veneno', color: '#A040A0', icon: 'img/type-icons/posion.png' },
    'ground': { name: 'Tierra', color: '#E0C068', icon: 'img/type-icons/ground.png' },
    'rock': { name: 'Roca', color: '#B8A038', icon: 'img/type-icons/rock.png' },
    'bug': { name: 'Bicho', color: '#A8B820', icon: 'img/type-icons/bug.png' },
    'ghost': { name: 'Fantasma', color: '#705898', icon: 'img/type-icons/ghost.png' },
    'steel': { name: 'Acero', color: '#B8B8D0', icon: 'img/type-icons/steel.png' },
    'fire': { name: 'Fuego', color: '#F08030', icon: 'img/type-icons/fire.png' },
    'water': { name: 'Agua', color: '#6890F0', icon: 'img/type-icons/water.png' },
    'grass': { name: 'Planta', color: '#78C850', icon: 'img/type-icons/grass.png' },
    'electric': { name: 'Eléctrico', color: '#F8D030', icon: 'img/type-icons/electric.png' },
    'psychic': { name: 'Psíquico', color: '#F85888', icon: 'img/type-icons/psychic.png' },
    'ice': { name: 'Hielo', color: '#98D8D8', icon: 'img/type-icons/ice.png' },
    'dragon': { name: 'Dragón', color: '#7038F8', icon: 'img/type-icons/dragon.png' },
    'dark': { name: 'Siniestro', color: '#705848', icon: 'img/type-icons/dark.png' },
    'fairy': { name: 'Hada', color: '#EE99AC', icon: 'img/type-icons/fairy.png' }
};

// Obtener lista de tipos ordenada
function getAllTypes() {
    return Object.entries(pokemonTypes).map(([key, data]) => ({
        key: key,
        ...data
    }));
}

// Cargar icono de tipo desde carpeta local
async function loadTypeIcon(typeKey) {
    return new Promise((resolve) => {
        const typeData = pokemonTypes[typeKey] || pokemonTypes.normal;
        
        // Cargar la imagen local
        const img = new Image();
        
        img.onload = () => {
            resolve(img);
        };
        
        img.onerror = () => {
            // Fallback si no puede cargar la imagen
            createSymbolCanvas(typeData, resolve);
        };
        
        img.src = typeData.icon;
    });
}

// Crear un canvas con símbolo como fallback
function createSymbolCanvas(typeData, callback) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Dibujar fondo con color del tipo
    ctx.fillStyle = typeData.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar borde
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Dibujar nombre del tipo en el centro
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText(typeData.name, canvas.width / 2, canvas.height / 2);
    
    // Convertir canvas a imagen
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => callback(img);
}

// Cargar múltiples iconos de tipos
async function loadTypeIcons(typeKeys) {
    const loadPromises = typeKeys.map(key => loadTypeIcon(key));
    try {
        return await Promise.all(loadPromises);
    } catch (error) {
        console.error('Error loading type icons:', error);
        return [];
    }
}
