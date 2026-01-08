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