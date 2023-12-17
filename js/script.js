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
            base_experience: data.base_experience,
            held_items: data.held_items,
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
    
    // Types Filter
    let selectTypePokemon = document.querySelector('#search-type-pokemon');
    let selectType2Pokemon = document.querySelector('#search-type2-pokemon');
    selectTypePokemon.addEventListener('change', () => filterPokemon(pokemons));
    selectType2Pokemon.addEventListener('change', () => filterPokemon(pokemons, true));
    
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

    //Pokemon varieties
    let dataVarieties = pokemonSpecies.varieties

    //EV Yield
    let EVYieldStats = [];
    let pokemonStats = pokemon.stats;
    pokemonStats.forEach((stat) => {
        if(stat.effort != 0) {
            EVYieldStats.push(stat);
        }
    });

    //Pokemon held items
    let heldItems = pokemon.held_items;
    //Pokemon egg groups
    let eggGroups = pokemonSpecies.egg_groups;
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

    //genera
    let generaPokemon = pokemonSpecies.genera;
    let htmlGeneraPokemon = ``;
    generaPokemon.forEach((genera) => {
        if(genera.language.name == "en") {
            htmlGeneraPokemon = genera.genus;
        }
    });

    // All contents to html
    let pokemonName = document.createElement("h1");
    pokemonName.classList.add('pokemon-name');
    pokemonName.innerText = pokemon.name;

    let pokemonNameFR = document.createElement("h2");
    pokemonNameFR.classList.add('pokemon-name-fr');
    pokemonNameFR.innerText = pokemonNameFr;


    let generaPokemonParagraph = document.createElement("p");
    generaPokemonParagraph.classList.add('genera-pokemon');

    let badgeGeneraPokemon = document.createElement("span");
    badgeGeneraPokemon.classList.add('badge-genera-pokemon');
    badgeGeneraPokemon.addEventListener('click', () => showDescriptions(pokemon.name, pokemonSheet, pokemonSpecies.flavor_text_entries));
    badgeGeneraPokemon.innerText = htmlGeneraPokemon;
    generaPokemonParagraph.append(badgeGeneraPokemon);

    let pokemonBasicInformation = document.createElement("div");
    pokemonBasicInformation.classList.add('pokemon-basic-information');
    pokemonBasicInformation.innerHTML = `
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
        <img class="toggle-sprite-pokemon" src="${pokemon.image}" />
        <img src="${pokemon.shiny}" style="display: none;"/>
        <div>
            <table>
                ${pokemonStatsHTML}
            </table>
        </div>
    `;

    //Hide loader
    pokemonSheet.innerHTML = ``;

    pokemonSheet.append(pokemonName, pokemonNameFR, generaPokemonParagraph, pokemonBasicInformation);

    let toggleSpritePokemon = document.querySelector('.toggle-sprite-pokemon');
    let toggle = false;
    console.log('pokemon image :');
    console.log(pokemon.image);
    console.log('pokemon shiny :');
    console.log(pokemon.shiny);
    toggleSpritePokemon.addEventListener('click', () => {
        if(toggle) {
            toggleSpritePokemon.src = pokemon.image;
        } else {
            toggleSpritePokemon.src = pokemon.shiny;
        }
        toggle = !toggle;
    });

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

    //Varieties HTML
    const divVarietiesPokemon = document.createElement('div');
    divVarietiesPokemon.classList.add('div-varieties-pokemon');
    const titleVarietiesPokemon = document.createElement('h2');
    titleVarietiesPokemon.innerText = "Varieties";
    divVarietiesPokemon.append(titleVarietiesPokemon);

    const varietiesPokemon = document.createElement('div');
    varietiesPokemon.classList.add('varieties-pokemon');

    dataVarieties.forEach(async (variety) => {
        if(!variety.is_default) {
            let url = variety.pokemon.url;
            let dataPokemonVariety = await fetchJson(url);
            let cardVariety = document.createElement('div');
            cardVariety.classList.add('card');
            cardVariety.addEventListener('click', () => displaySheetPokemonEvolution(dataPokemonVariety, true));
            
            let spritePokemonVariety = dataPokemonVariety.sprites['other']['home']['front_default'] ?? dataPokemonVariety.sprites['other']['official-artwork']['front_default']
            cardVariety.innerHTML =  `
                <img class="card-image" src="${spritePokemonVariety}"/>
                <p class="card-name">${variety.pokemon.name}</p>
            `;
            varietiesPokemon.append(cardVariety);
        }
    });
    divVarietiesPokemon.append(varietiesPokemon);

    if(dataVarieties.length <= 1) {
        varietiesPokemon.innerHTML = `
        <div class="no-pokemon-varieties">
            <p>No Varieties found for this Pokemon</p>
        </div>
        `;
    }

    let htmlEVYieldStats = ``;
    EVYieldStats.forEach((stat) => {
        htmlEVYieldStats += `<span>${stat.effort} </span><span>${capitalize(stat.stat.name)} </span>`;
    });
    
    let htmlHeldItems = ``;
    if(heldItems.length == 0) {
        htmlHeldItems = `None`;
    } else {
        heldItems.forEach((item) => {
            htmlHeldItems += `<span>${capitalize(item.item.name)} </span>`;
        });
    }
    
    let htmlEggGroups = ``;
    if(eggGroups.length == 0) {
        htmlEggGroups = `None`;
    } else {
        eggGroups.forEach((eggGroup) => {
            htmlEggGroups += `<span>${capitalize(eggGroup.name)} </span>`;
        });
    }

    let htmlGenderRate = ``;
    if(pokemonSpecies.gender_rate == -1) {
        htmlGenderRate = `None`;
    } else {
        htmlGenderRate = `<span>${100-((pokemonSpecies.gender_rate/8)*100)}% <i class="fa-solid fa-mars"></i></span> - <span class="female-rate">${(pokemonSpecies.gender_rate/8)*100 }% <i class="fa-solid fa-venus"></i></span>`;
    }
    

    let divAdvancedInformation = document.createElement('div');
    divAdvancedInformation.classList.add('pokemon-advanced-information');
    divAdvancedInformation.innerHTML = `
        <div class="pokemon-forms">
            <h2>Forms</h2>
            <table class="forms-information">
                <tr>
                    <td class="title-table">Alternative Form</td>
                    <td>${pokemonSpecies.forms_switchable ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                    <td class="title-table">Gender Difference</td>
                    <td>${pokemonSpecies.has_gender_differences ? 'Yes' : 'No'}</td>
                </tr>
            </table>
        </div>
        <div class="pokemon-trainings">
            <h2>Trainings</h2>
            <table class="training-information">
                <tr>
                    <td class="title-table">EV Yield</td>
                    <td>${htmlEVYieldStats}</td>
                </tr>
                <tr>
                    <td class="title-table">Catch Rate</td>
                    <td>${pokemonSpecies.capture_rate}</td>
                </tr>
                <tr>
                    <td class="title-table">Base Friendship</td>
                    <td>${pokemonSpecies.base_happiness}</td>
                </tr>
                <tr>
                    <td class="title-table">Base Exp</td>
                    <td>${pokemon.base_experience}</td>
                </tr>
                <tr>
                    <td class="title-table">Growth Rate</td>
                    <td>${capitalize(pokemonSpecies.growth_rate.name)}</td>
                </tr>
                <tr>
                    <td class="title-table">Held Items</td>
                    <td>${htmlHeldItems}</td>
                </tr>
            </table>
        </div>
        <div class="pokemon-breedings">
            <h2>Breedings</h2>
            <table class="training-information">
                <tr>
                    <td class="title-table">Egg Groups</td>
                    <td>${htmlEggGroups}</td>
                </tr>
                <tr>
                    <td class="title-table">Gender Distribution</td>
                    <td>${htmlGenderRate}</td>
                </tr>
                <tr>
                    <td class="title-table">Egg Cycles</td>
                    <td>${pokemonSpecies.hatch_counter} (${(1+pokemonSpecies.hatch_counter)*255} <i class="fa-solid fa-shoe-prints"></i>)</td>
                </tr>
            </table>
        </div>
    `;

    // Btn close modal
    const hidePokemonSheet = document.createElement('span');
    hidePokemonSheet.classList.add('close-pokemon-sheet');
    hidePokemonSheet.innerText = `Back`;

    hidePokemonSheet.addEventListener('click', () => {
        pokemonSheet.remove();
        body.style.overflow = 'auto';
    });

    pokemonSheet.append(hidePokemonSheet, evolutionsChainPokemon, divVarietiesPokemon, divAdvancedInformation);
}

const displaySheetPokemonEvolution = async (pokemon) => {
    const promises = [];
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
    promises.push(fetchJson(url));
    Promise.all(promises).then(results => {

        const pokemonData = results.map(data => ({
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
            base_experience: data.base_experience,
            held_items: data.held_items,
        }))

        displaySheetPokemon(pokemonData[0], true);
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

        let imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`
        let resultImgExists = await imgExists(imgUrl);
        if(!resultImgExists) {
            imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        }

        return [
          {
            id: id,
            name: evolution.species.name,
            url: evolution.species.url,
            img: imgUrl,
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
    let cardsPokemon = document.querySelectorAll(".card");

    for (i = 0; i < namesPokemon.length; i++) { 
        if (!namesPokemon[i].innerHTML.toLowerCase().includes(valueSearch)) {
            cardsPokemon[i].style.display="none";
        }
        else {
            cardsPokemon[i].style.display="flex";                 
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

async function imgExists(url) {
    try {
        const response = await fetch(url);
        return response.ok;
    } catch (error) {
        return error;
    }
}


function filterPokemon(pokemons) {
    let selectTypePokemon = document.querySelector('#search-type-pokemon');
    let selectType2Pokemon = document.querySelector('#search-type2-pokemon');
    let cardsPokemon = document.querySelectorAll(".card");
    if(selectTypePokemon.value != 'none') {
        selectType2Pokemon.disabled = false;
    } else {
        selectType2Pokemon.value = 'disabled';
        selectType2Pokemon.disabled = true;
    }
    if(!selectType2Pokemon.disabled && selectType2Pokemon.value != "disabled" && selectType2Pokemon.value != "none") {
        pokemons.forEach((pokemon, i) => {
            let type1 = pokemon.type[0].type.name;
            let type2 = pokemon.type[1] ? pokemon.type[1].type.name : null;
    
            let firstTypeMatch = selectTypePokemon.value == 'none' || type1 == selectTypePokemon.value || type2 == selectTypePokemon.value;
            let secondTypeMatch = selectType2Pokemon.value == 'none' || type1 == selectType2Pokemon.value || type2 == selectType2Pokemon.value;
    
            if (firstTypeMatch && secondTypeMatch) {
                cardsPokemon[i].style.display = "flex";
            } else {
                cardsPokemon[i].style.display = "none";
            }
        });
    } else {
        pokemons.forEach((pokemon, i) => {
            let type1 = pokemon.type[0].type.name;
            let type2 = pokemon.type[1] ? pokemon.type[1].type.name : null;
            let firstTypeMatch = selectTypePokemon.value == 'none' || type1 == selectTypePokemon.value;
            let secondTypeMatch = selectTypePokemon.value == 'none' || type2 == selectTypePokemon.value;
            
            if (firstTypeMatch || secondTypeMatch) {
                cardsPokemon[i].style.display = "flex";
            } else {
                cardsPokemon[i].style.display = "none";
            }
        });
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showDescriptions(pokemonName, pokemonSheet, flavorTextEntries) {
    pokemonSheet.style.overflow = "hidden";
    const modal = document.createElement('div');
    modal.classList.add('modal-descriptions');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content-descriptions');
    modalContent.innerHTML = `
        <h2>${pokemonName}</h2>
        <p class="pokedex-entries">Pokédex Entries</p>
        <hr>
        <span class="close-modal-descriptions" onclick="closeModal()">&times;</span>
    `;

    flavorTextEntries.forEach((textEntry) => {
        if(textEntry.language.name == 'en' ) {
            modalContent.innerHTML += `
                <div class="pokemon-description">
                    <h3>${capitalize(textEntry.version.name)}</h3>
                    <p>${textEntry.flavor_text}</p>
                </div>
            `;
        }
    });
    modal.append(modalContent);
    pokemonSheet.append(modal);
}

function closeModal() {
    const modal = document.querySelector('.modal-descriptions');
    let pokemonSheet = document.querySelector('.pokemon-sheet');
    pokemonSheet.style.overflow = 'auto';
    modal.remove();
}
