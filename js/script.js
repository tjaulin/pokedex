const body = document.querySelector('#body');
const contentPokemon = document.querySelector('.content-pokedex');

const fetchJson = async (url) => {
    const response = await fetch(url);
    return await response.json();
}

const fetchPokemons = () => {
    const promises = [];
    for(let i = 1; i <= 10275; i++) {
        if(i === 1018) {
            i = 10001
        }
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`
        promises.push(fetchJson(url));
    }
    Promise.all(promises).then(results => {
        console.log(results);
        const pokemons = results.map(data => ({
            id: data.id,
            name: data.name,
            image: data.sprites['other']['home']['front_default'] ?? data.sprites['other']['official-artwork']['front_default'],
            shiny: data.sprites['other']['home']['front_shiny'] ?? data.sprites['other']['official-artwork']['front_shiny'],
            type: data.types,
            species: data.species.url,
            height: data.height * 10,
            weight: data.weight / 10,
            abilities: data.abilities,
            stats: data.stats,
        }))
        displayPokemon(pokemons)
    })
}

const displayPokemon = (pokemons) => {
    //Désaffiche le loader avant l'affichage des pokémons
    contentPokemon.innerHTML = ``;
    pokemons.forEach((pokemon) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.addEventListener('click', () => displaySheetPokemon(pokemon));
        let pokemonTypes = ``;
        if(pokemon.type[1]) {
            pokemonTypes = `<span class="background-color-${pokemon.type[0].type.name}">${pokemon.type[0].type.name}</span><span class="background-color-${pokemon.type[1].type.name}">${pokemon.type[1].type.name}</span>`;
        } else {
            pokemonTypes = `<span class="background-color-${pokemon.type[0].type.name}">${pokemon.type[0].type.name}</span>`;
        }
        card.innerHTML =  `
            <span class="card-number">${formatPokemonId(pokemon.id)}</span>
            <img class="card-image" src="${pokemon.image}"/>
            <p class="card-name">${pokemon.name}</p>
            <p class="card-types">
                ${pokemonTypes}
            </p>
        `;
        contentPokemon.append(card);
    })
}

const displaySheetPokemon = async (pokemon, evolution = false) => {
    body.style.overflow = 'hidden';
    if(evolution) {
        const oldPokemonSheet = document.querySelector('.pokemon-sheet');
        oldPokemonSheet.remove();
    }

    const pokemonSheet = document.createElement('div');
    pokemonSheet.style.overflow = 'auto';
    pokemonSheet.classList.add('pokemon-sheet');

    contentPokemon.append(pokemonSheet);
    showLoader();

    /* -------------------------------------------------- DATA -------------------------------------------------- */
    // Pokemon species
    console.log('pokemon :');
    console.log(pokemon);
    console.log("pokemon species :");
    console.log(pokemon.species);
    const pokemonSpecies = await fetchJson(pokemon.species);
    console.log(pokemonSpecies);

    //Pokemon evolutions
    const dataPokemonEvolutions = await fetchJson(pokemonSpecies.evolution_chain.url);
    console.log(dataPokemonEvolutions.chain);
    // console.log(await getEvolutions(dataPokemonEvolutions.chain));
    let evolutions = await getEvolutions(dataPokemonEvolutions.chain);
    let url = dataPokemonEvolutions.chain.species.url;
    const parts = url.split('/');
    const id = parts[parts.length - 2];
    evolutions = [
        {
            id: id,
            name: dataPokemonEvolutions.chain.species.name,
            url: dataPokemonEvolutions.chain.species.url,
            img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
        },
    ...evolutions
    ];

    /* -------------------------------------------------- HTML -------------------------------------------------- */

    // Pokemon Types
    let pokemonTypes = ``;
    if(pokemon.type[1]) {
        pokemonTypes = `<span class="background-color-${pokemon.type[0].type.name}">${pokemon.type[0].type.name}</span>
        <span class="background-color-${pokemon.type[1].type.name}">${pokemon.type[1].type.name}</span>`;
    } else {
        pokemonTypes = `<span class="background-color-${pokemon.type[0].type.name}">${pokemon.type[0].type.name}</span>`;
    }


    // Pokemon Abilities
    let pokemonAbilities = pokemon.abilities;
    let pokemonAbilitiesHTML = ``;
    pokemonAbilities.forEach((ability) => {
        pokemonAbilitiesHTML += `<span><span class="background-color-${pokemon.type[0].type.name}">${ability.ability.name}</span></span>`;
    });

    // Pokemon Stats
    let pokemonStats = pokemon.stats;
    let pokemonStatsHTML = ``;
    pokemonStats.forEach((stat) => {
        pokemonStatsHTML += `
        <tr>
            <td class="title-table">${stat.stat.name}</td>
            <td>${stat.base_stat}</td>
        </tr>
        `;
    });

    // Name FR
    let pokemonNameFr = ``;
    let pokemonNames = pokemonSpecies.names;
    pokemonNames.forEach((name) => {
        if(name.language.name === "fr") {
            pokemonNameFr = name.name;
        }
    });

    // All contents to html
    pokemonSheet.innerHTML = `
        <h1 class="pokemon-name">${pokemon.name}</h1>
        <h2 class="pokemon-name-fr">${pokemonNameFr}</h2>
        <div class="pokemon-basic-information">
            <div>
                <table class="basic-informations">
                    <tr>
                        <td class="title-table">ID</td>
                        <td>${formatPokemonId(pokemon.id)}</td>
                    </tr>
                    <tr>
                        <td class="title-table">Name</td>
                        <td>${pokemon.name}</td>
                    </tr>
                    <tr>
                        <td class="title-table">Type</td>
                        <td class="pokemon-types">${pokemonTypes}</td>
                    </tr>
                    <tr>
                        <td class="title-table">Height</td>
                        <td>${pokemon.height} cm</td>
                    </tr>
                    <tr>
                        <td class="title-table">Weight</td>
                        <td>${pokemon.weight} kg</td>
                    </tr>
                    <tr>
                        <td class="title-table">Abilities</td>
                        <td class="pokemon-abilities">${pokemonAbilitiesHTML}</td>
                    </tr>
                </table>
            </div>
            <img src="${pokemon.image}" />
            <img src="${pokemon.shiny}" style="display: none;"/>
            <div>
                <table>
                    ${pokemonStatsHTML}
                </table>
            </div>
        </div>
    `;

    // Evolutions HTML
    const evolutionsChainPokemon = document.createElement('div');
    evolutionsChainPokemon.classList.add('evolutions-chain-pokemon');
    const evolutionChainTitle = document.createElement('h2');
    evolutionChainTitle.innerText = "Evolution Chain";
    evolutionsChainPokemon.append(evolutionChainTitle);

    const evolutionsPokemon = document.createElement('div');
    evolutionsPokemon.classList.add('evolution-pokemon');

    evolutions.forEach((evolution) => {
        let cardEvolution = document.createElement('div');
        cardEvolution.classList.add('card');
        cardEvolution.addEventListener('click', () => displaySheetPokemonEvolution(evolution));

        cardEvolution.innerHTML =  `
            <img class="card-image" src="${evolution.img}"/>
            <p class="card-name">${evolution.name}</p>
        `;
        evolutionsPokemon.append(cardEvolution);
    });
    evolutionsChainPokemon.append(evolutionsPokemon);


    // Btn close modal
    const hidePokemonSheet = document.createElement('span');
    hidePokemonSheet.classList.add('close-pokemon-sheet');
    hidePokemonSheet.innerText = `Retour`;

    hidePokemonSheet.addEventListener('click', () => {
        pokemonSheet.remove();
        body.style.overflow = 'auto';
    });

    pokemonSheet.append(hidePokemonSheet, evolutionsChainPokemon);
}

const displaySheetPokemonEvolution = async (evolution) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${evolution.id}`
    const promises = [];
    promises.push(fetchJson(url));
    Promise.all(promises).then(results => {

        const pokemon = results.map(data => ({
            id: data.id,
            name: data.name,
            image: data.sprites['other']['home']['front_default'] ?? data.sprites['other']['official-artwork']['front_default'],
            type: data.types,
            species: data.species.url,
            height: data.height * 10,
            weight: data.weight / 10,
            abilities: data.abilities,
            stats: data.stats,
        }))

        displaySheetPokemon(pokemon[0], true);
    })

}

function formatPokemonId(id) {
    if (id < 10) {
        return `#00${id}`;
    } else if (id < 100) {
        return `#0${id}`;
    } else {
        return `#${id}`;
    }
}

async function getEvolutions(dataPokemonEvolutionsChain) {
    // if (!dataPokemonEvolutionsChain.evolves_to || !Array.isArray(dataPokemonEvolutionsChain.evolves_to)) {
    //     return [];
    // }
    
    // const subEvolutions = await Promise.all(dataPokemonEvolutionsChain.evolves_to.map(async (evolution) => {
    //     const { name, url } = evolution.species;
    //     const subEvolutions = await getEvolutions(evolution);
        
    //     return {
    //         name,
    //         url,
    //         evolves_to: subEvolutions,
    //     };
    // }));

    // return subEvolutions;
      
    // const formattedEvolutions = formatEvolutions(dataPokemonEvolutions);
    
    
    if (!dataPokemonEvolutionsChain || !dataPokemonEvolutionsChain.evolves_to) return [];

    const evs = await Promise.all(dataPokemonEvolutionsChain.evolves_to.map(async evolution => {
        const subEvolutions = await getEvolutions(evolution);
        let url = evolution.species.url;
        const parts = url.split('/');
        const id = parts[parts.length - 2];
        return [
          {
            id: id,
            name: evolution.species.name,
            url: evolution.species.url,
            img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
          },
          ...subEvolutions
        ];
    }));

    return evs.flat();
}
showLoader(true);
fetchPokemons();


function searchPokemon() {
    let valueSearch = document.getElementById('search-pokemon').value
    valueSearch = valueSearch.toLowerCase();
    let namesPokemon = document.querySelectorAll('.card-name');
    let cardPokemon = document.querySelectorAll(".card");

    for (i = 0; i < namesPokemon.length; i++) { 
        if (!namesPokemon[i].innerHTML.toLowerCase().includes(valueSearch)) {
            cardPokemon[i].style.display="none";
        }
        else {
            cardPokemon[i].style.display="flex";                 
        }
    }
}

function showLoader(pokedex = false) {
    let pokeball = document.createElement('div');
    pokeball.classList.add('pokeball');

    pokeball.innerHTML = `
        <div class="filler animate__animated animate__bounce animate__infinite"></div>
    `;

    if(pokedex) {
        contentPokemon.append(pokeball);
    } else {
        let pokemonSheet = document.querySelector('.pokemon-sheet');
        console.log(pokemonSheet);
        pokemonSheet.append(pokeball);
    }
}