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

const displaySheetPokemon = async (pokemon) => {
    /* -------------------------------------------------- DATA -------------------------------------------------- */
    // Pokemon species
    const pokemonSpecies = await fetchJson(pokemon.species);
    console.log(pokemonSpecies);

    //Pokemon evolutions
    const dataPokemonEvolutions = await fetchJson(pokemonSpecies.evolution_chain.url);
    console.log(dataPokemonEvolutions.chain);
    // console.log(await getEvolutions(dataPokemonEvolutions.chain));
    let evolutions = await getEvolutions(dataPokemonEvolutions.chain);
    evolutions = [
    {
        name: dataPokemonEvolutions.chain.species.name,
        url: dataPokemonEvolutions.chain.species.url,
        evolves_to: evolutions,
    }
    ];
    console.log(evolutions);
    const evolutionsChainPokemon = document.createElement('div');
    evolutionsChainPokemon.classList.add('evolutions-pokemon');

    let html = '';

    evolutions.forEach((evolution) => {
        html += '<div class="evolution-pokemon">';
        html += '<span class="evolution-pokemon-name">' + evolution.name + '</span>';
        html += '</div>';
        if (evolution.evolves_to.length > 0) {            
            html += '<div class="evolution-pokemon">';
            evolution.evolves_to.forEach((subEvolution) => {
                if(evolution.evolves_to.length > 1) {
                    html += '<div class="sub-evolution">'
                    html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                    html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
                    html += '</div>'
                } else {
                    html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                    html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
                }

                if(subEvolution.evolves_to.length > 0) {
                    subEvolution.evolves_to.forEach((subEvolution) => {
                        if(evolution.evolves_to.length > 1) {
                            html += '<div class="sub-evolution">'
                            html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                            html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
                            html += '</div>'
                        } else {
                            html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                            html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
                        }
                    })
                }
            });
            html += '</div>';
        }
    });

    evolutionsChainPokemon.innerHTML = html;


    /* -------------------------------------------------- HTML -------------------------------------------------- */
    body.style.overflow = 'hidden';

    const pokemonSheet = document.createElement('div');
    pokemonSheet.style.overflow = 'auto';
    pokemonSheet.classList.add('pokemon-sheet');

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
            <div>
                <table>
                    ${pokemonStatsHTML}
                </table>
            </div>
        </div>
    `;

    // Evolutions HTML



    // Btn close modal
    const hidePokemonSheet = document.createElement('span');
    hidePokemonSheet.classList.add('close-pokemon-sheet');
    hidePokemonSheet.innerText = `Retour`;

    hidePokemonSheet.addEventListener('click', () => {
        pokemonSheet.remove();
        body.style.overflow = 'auto';
    });

    pokemonSheet.append(hidePokemonSheet, evolutionsChainPokemon);
    contentPokemon.append(pokemonSheet);
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
    if (!dataPokemonEvolutionsChain.evolves_to || !Array.isArray(dataPokemonEvolutionsChain.evolves_to)) {
        return [];
    }
    
    const subEvolutions = await Promise.all(dataPokemonEvolutionsChain.evolves_to.map(async (evolution) => {
        const { name, url } = evolution.species;
        const subEvolutions = await getEvolutions(evolution);
        
        return {
            name,
            url,
            evolves_to: subEvolutions,
        };
    }));

    return subEvolutions;
      
    // const formattedEvolutions = formatEvolutions(dataPokemonEvolutions);
    
    
    // if (!dataPokemonEvolutionsChain || !dataPokemonEvolutionsChain.evolves_to) return [];

    // const evs = await Promise.all(dataPokemonEvolutionsChain.evolves_to.map(async evolution => {
    //     const subEvolutions = await getEvolutions(evolution);
    //     return [
    //       {
    //         name: evolution.species.name,
    //         url: evolution.species.url
    //       },
    //       ...subEvolutions
    //     ];
    // }));

    // return evs.flat();
}

fetchPokemons();






// A demander a chat gpt 4 :

/* 

J'ai une petite question en javascript / html. Voici mon code JS :

```
evolutions.forEach((evolution) => {
    html += '<div class="evolution-pokemon">';
    html += '<span class="evolution-pokemon-name">' + evolution.name + '</span>';
    html += '</div>';
    if (evolution.evolves_to.length > 0) {            
        html += '<div class="evolution-pokemon">';
        evolution.evolves_to.forEach((subEvolution) => {
            if(evolution.evolves_to.length > 1) {
                html += '<div class="sub-evolution">'
                html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
                html += '</div>'
            } else {
                html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
            }

            if(subEvolution.evolves_to.length > 0) {
                subEvolution.evolves_to.forEach((subEvolution) => {
                    if(evolution.evolves_to.length > 1) {
                        html += '<div class="sub-evolution">'
                        html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                        html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
                        html += '</div>'
                    } else {
                        html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
                        html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
                    }
                });
            }
        });
        html += '</div>';
    }
});

evolutionsChainPokemon.innerHTML = html;
```

Et voici ce qu'il me renvoie : 
```
<div class="evolutions-pokemon">
    <div class="evolution-pokemon">
            <span class="evolution-pokemon-name">poliwag</span>
    </div>
    <div class="evolution-pokemon">
        <img class="evolution-right-arrow" src="./img/right-arrow.png">
        <span class="evolution-pokemon-name">poliwhirl</span>
        <img class="evolution-right-arrow" src="./img/right-arrow.png">
        <span class="evolution-pokemon-name">poliwrath</span>
        <img class="evolution-right-arrow" src="./img/right-arrow.png">
        <span class="evolution-pokemon-name">politoed</span>
    </div>
</div>
```

Et voici ce que je veux : 
```
<div class="evolutions-pokemon">
    <div class="evolution-pokemon">
            <span class="evolution-pokemon-name">poliwag</span>
    </div>
    <div class="evolution-pokemon">
        <img class="evolution-right-arrow" src="./img/right-arrow.png">
        <span class="evolution-pokemon-name">poliwhirl</span>
    </div>
    <div class="evolution-pokemon">
        <div class="sub-evolution">
            <img class="evolution-right-arrow" src="./img/right-arrow.png">
            <span class="evolution-pokemon-name">poliwrath</span>
        </div>
        <div class="sub-evolution">
            <img class="evolution-right-arrow" src="./img/right-arrow.png">
            <span class="evolution-pokemon-name">politoed</span>
        </div>
    </div>
</div>
```

Je sais ou est le problème mais je ne sais pas comment le résoudre, il s'agit de ce bout de code mal placer : 
```
if(subEvolution.evolves_to.length > 0) {
    subEvolution.evolves_to.forEach((subEvolution) => {
        if(evolution.evolves_to.length > 1) {
            html += '<div class="sub-evolution">'
            html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
            html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
            html += '</div>'
        } else {
            html += '<img class="evolution-right-arrow" src="./img/right-arrow.png" />';
            html += '<span class="evolution-pokemon-name">' + subEvolution.name + '</span>';
        }
    });
}
```

Qui devrait etre a l'extérieur des div ici : 
```
if (evolution.evolves_to.length > 0) {            
    html += '<div class="evolution-pokemon">';
```

Mais je ne sais pas comment faire vu qu'il faut vérifier sur subEvolution qui est accessible que dans la boucle. Tu peux m'aider a obtenir ce que je veux ? 
*/