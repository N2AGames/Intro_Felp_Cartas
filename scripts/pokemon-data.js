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

// Función mejorada para obtener pokémons con colores similares// Función mejorada para obtener pokémons con colores similares
async function getPokemonsByColorSimilarity(generations, count) {
    // Colores disponibles en PokeAPI
    const availableColors = ['black', 'blue', 'brown', 'gray', 'green', 'pink', 'purple', 'red', 'white', 'yellow'];
    
    // Clasificar colores en grupos
    const colorGroups = {
        neutral: ['black', 'gray', 'white'],
        warm: ['red', 'pink', 'brown', 'yellow'],
        cool: ['blue', 'green', 'purple']
    };
    
    // Seleccionar un grupo aleatorio
    const groupKeys = Object.keys(colorGroups);
    const selectedGroupKey = groupKeys[Math.floor(Math.random() * groupKeys.length)];
    const selectedGroup = colorGroups[selectedGroupKey];
    
    // Para neutros, usar solo un color para mayor consistencia
    // Para otros grupos, permitir variación dentro del grupo
    let colorsToUse;
    if (selectedGroupKey === 'neutral') {
        // Neutros: elegir solo uno
        colorsToUse = [selectedGroup[Math.floor(Math.random() * selectedGroup.length)]];
    } else {
        // Cálidos o fríos: usar todos del grupo
        colorsToUse = selectedGroup;
    }
    
    try {
        // Obtener pokémons de los colores seleccionados
        const allFilteredPokemons = [];
        
        for (const color of colorsToUse) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-color/${color}`);
            const data = await response.json();
            
            // Filtrar por generaciones seleccionadas
            const filteredPokemons = data.pokemon_species.filter(species => {
                const id = parseInt(species.url.split('/').slice(-2, -1)[0]);
                return generations.some(gen => {
                    const range = genRanges[gen];
                    return id >= range[0] && id <= range[1];
                });
            });
            
            allFilteredPokemons.push(...filteredPokemons);
        }
        
        if (allFilteredPokemons.length === 0) {
            throw new Error('No se encontraron pokémons con esos criterios');
        }
        
        // Seleccionar pokémons aleatorios de los colores similares
        const pokemonDataList = [];
        const uniquePokemons = new Set();
        
        while (pokemonDataList.length < count && uniquePokemons.size < allFilteredPokemons.length) {
            const randomPokemon = allFilteredPokemons[Math.floor(Math.random() * allFilteredPokemons.length)];
            const id = parseInt(randomPokemon.url.split('/').slice(-2, -1)[0]);
            
            if (!uniquePokemons.has(id)) {
                uniquePokemons.add(id);
                try {
                    const pokemonData = await loadRandomPokemon(id);
                    pokemonDataList.push(pokemonData);
                } catch (error) {
                    console.error(`Error al cargar pokémon ${id}:`, error);
                }
            }
        }
        
        return pokemonDataList;
    } catch (error) {
        console.error('Error al obtener pokémons por similitud de color:', error);
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

    // Mapeo de colores de Pokémon a colores pastel (actualizado con tonos oscuros)
    const colorMapping = {
        'black': ['#E0BBE4', '#C7CEEA', '#D5E1DF', '#E5D9F2', '#A8A9AD', '#9B9B9B', '#8D7B6B'],
        'blue': ['#BAE1FF', '#C8E7ED', '#C9E4E7', '#E6F3FF', '#C7CEEA'],
        'brown': ['#FFDFBA', '#FFD6BA', '#F7E7CE', '#FFF5E4', '#9D8B7C', '#B89F91', '#C4B5A0', '#A89988', '#D1C2B0', '#A68F7E', '#BFA993'],
        'gray': ['#D4F1F4', '#D5E1DF', '#E8F3D6', '#F0FFF0', '#A8A9AD', '#9B9B9B', '#B8B8B8', '#8E8E93', '#C4C4C4', '#D1CFC8', '#C7C5B8'],
        'green': ['#BAFFC9', '#B8E0D2', '#D6E9CA', '#E8F3D6', '#A39E93', '#D4D2C5'],
        'pink': ['#FFB3BA', '#FFC8DD', '#FADCE7', '#FFE5EC', '#EAC4D5', '#F8E8EE'],
        'purple': ['#E0BBE4', '#E7C6FF', '#E5D9F2', '#FFEEF8', '#C7CEEA'],
        'red': ['#FFB3BA', '#FFDFD3', '#FFD6BA', '#FADCE7', '#EAC4D5'],
        'white': ['#FFFFBA', '#D4F1F4', '#FFF0F5', '#F0FFF0', '#FFF5E4', '#D1CFC8', '#C7C5B8', '#D4D2C5'],
        'yellow': ['#FFFFBA', '#FFDFBA', '#FFF5E4', '#FFE5EC', '#F7E7CE']
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