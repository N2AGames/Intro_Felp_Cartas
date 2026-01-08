// Si se proporcionan generaciones, seleccionar de ellas
const genRanges = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025]
};

function loadPokemonData(pokemonName) {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        }
    );
}

function loadRandomPokemon(pokemonId = null, generations = null) {
    let id;
    
    if (pokemonId !== null) {
        // Si se proporciona un ID específico, usarlo
        id = pokemonId;
    } else if (generations && generations.length > 0) {
        const availableRanges = generations.map(gen => genRanges[gen]).filter(r => r);
        const randomRange = availableRanges[Math.floor(Math.random() * availableRanges.length)];
        id = Math.floor(Math.random() * (randomRange[1] - randomRange[0] + 1)) + randomRange[0];
    } else {
        // Por defecto, cualquier pokémon
        id = Math.floor(Math.random() * 1025) + 1;
    }
    
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        }
    );
}

function loadPokemonNameList() {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=1025`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        }
    )
    .then(data => data.results.map(pokemon => pokemon.name));
}

function displayPokemonPicture(pokemonData) {
    const imgElement = document.getElementById('pokemon-image');
    imgElement.src = pokemonData.sprites.front_default;
    imgElement.alt = pokemonData.name;
}

function getMatchingColors(bgColor) {
    // Convertir hex a RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calcular brillo del color
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Determinar colores que combinan basado en el color dominante y brillo
    const dominantChannel = Math.max(r, g, b);
    const colorMatches = [];

    // Colores complementarios y análogos según el fondo
    if (brightness < 85) {
        // Fondo oscuro - pokémons claros o coloridos
        colorMatches.push('white', 'yellow', 'pink', 'green', 'blue');
    } else if (brightness > 170) {
        // Fondo claro - pokémons oscuros o saturados
        colorMatches.push('black', 'brown', 'blue', 'red', 'purple', 'green');
    } else {
        // Fondo medio - cualquier color contrasta bien
        if (r > g && r > b) {
            // Dominante rojo
            colorMatches.push('blue', 'green', 'yellow', 'white', 'pink');
        } else if (g > r && g > b) {
            // Dominante verde
            colorMatches.push('red', 'blue', 'purple', 'yellow', 'pink');
        } else if (b > r && b > g) {
            // Dominante azul
            colorMatches.push('red', 'yellow', 'green', 'white', 'pink');
        } else {
            // Neutro
            colorMatches.push('red', 'blue', 'green', 'yellow', 'purple', 'pink');
        }
    }

    return colorMatches;
}

async function getPokemonsByColor(bgColor, generations, count) {
    const matchingColors = getMatchingColors(bgColor);
    const selectedColor = matchingColors[Math.floor(Math.random() * matchingColors.length)];

    try {
        // Obtener pokémons del color seleccionado
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-color/${selectedColor}`);
        const data = await response.json();
        
        // Filtrar por generaciones seleccionadas
        const filteredPokemons = data.pokemon_species.filter(species => {
            const id = parseInt(species.url.split('/').slice(-2, -1)[0]);
            return generations.some(gen => {
                const range = genRanges[gen];
                return id >= range[0] && id <= range[1];
            });
        });

        // Seleccionar pokémons aleatorios del color que coincide
        const pokemonDataList = [];
        const pokemonCount = Math.min(count, filteredPokemons.length);
        
        for (let i = 0; i < pokemonCount; i++) {
            const randomPokemon = filteredPokemons[Math.floor(Math.random() * filteredPokemons.length)];
            const id = parseInt(randomPokemon.url.split('/').slice(-2, -1)[0]);
            const pokemonData = await loadRandomPokemon(id);
            pokemonDataList.push(pokemonData);
        }

        return pokemonDataList;
    } catch (error) {
        console.error('Error al obtener pokémons por color:', error);
        // Fallback: usar el método anterior
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(loadRandomPokemon(null, generations));
        }
        return await Promise.all(promises);
    }
}

// Función para sugerir colores de fondo basados en los Pokémon
async function suggestColorsFromPokemons(pokemonDataList, pastelColors) {
    // Si no hay pokémons, retornar un color aleatorio
    if (!pokemonDataList || pokemonDataList.length === 0) {
        return {
            suggested: pastelColors[Math.floor(Math.random() * pastelColors.length)],
            alternatives: pastelColors
        };
    }

    // Obtener los colores de los Pokémon
    const pokemonColors = [];
    for (const pokemonData of pokemonDataList) {
        if (pokemonData && pokemonData.species) {
            try {
                const speciesResponse = await fetch(pokemonData.species.url);
                const speciesData = await speciesResponse.json();
                if (speciesData.color) {
                    pokemonColors.push(speciesData.color.name);
                }
            } catch (error) {
                console.error('Error al obtener color del Pokémon:', error);
            }
        }
    }

    // Si no pudimos obtener colores, retornar un color aleatorio
    if (pokemonColors.length === 0) {
        return {
            suggested: pastelColors[Math.floor(Math.random() * pastelColors.length)],
            alternatives: pastelColors
        };
    }

    // Mapeo de colores de Pokémon a colores pastel
    const colorMapping = {
        'black': ['#E0BBE4', '#C7CEEA', '#D5E1DF', '#E5D9F2'],
        'blue': ['#BAE1FF', '#C8E7ED', '#C9E4E7', '#E6F3FF'],
        'brown': ['#FFDFBA', '#FFD6BA', '#F7E7CE', '#FFF5E4'],
        'gray': ['#D4F1F4', '#D5E1DF', '#E8F3D6', '#F0FFF0'],
        'green': ['#BAFFC9', '#B8E0D2', '#D6E9CA', '#E8F3D6'],
        'pink': ['#FFB3BA', '#FFC8DD', '#FADCE7', '#FFE5EC'],
        'purple': ['#E0BBE4', '#E7C6FF', '#E5D9F2', '#FFEEF8'],
        'red': ['#FFB3BA', '#FFDFD3', '#FFD6BA', '#FADCE7'],
        'white': ['#FFFFBA', '#D4F1F4', '#FFF0F5', '#F0FFF0'],
        'yellow': ['#FFFFBA', '#FFDFBA', '#FFF5E4', '#FFE5EC']
    };

    // Elegir el color más común entre los Pokémon
    const colorCounts = {};
    pokemonColors.forEach(color => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
    const mostCommonColor = Object.keys(colorCounts).reduce((a, b) => 
        colorCounts[a] > colorCounts[b] ? a : b
    );

    // Obtener colores pastel que combinen
    const matchingPastelColors = colorMapping[mostCommonColor] || pastelColors.slice(0, 4);
    const suggestedColor = matchingPastelColors[Math.floor(Math.random() * matchingPastelColors.length)];

    return {
        suggested: suggestedColor,
        alternatives: pastelColors
    };
}