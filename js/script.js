const body = document.querySelector('#body');
const contentPokemon = document.querySelector('.content-pokedex');

const fetchPokemons = () => {
    const promises = [];
    for(let i = 1; i <= 10275; i++) {
        if(i === 1018) {
            i = 10001
        }
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`
        promises.push(fetch(url).then((res) => res.json()));
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
            pokemonTypes = `<span class="background-color-${pokemon.type[0].type.name}">${pokemon.type[0].type.name}</span>
            <span class="background-color-${pokemon.type[1].type.name}">${pokemon.type[1].type.name}</span>`;
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
    const url = await fetch(pokemon.species);
    const pokemonSpecies = await url.json();
    console.log(pokemonSpecies);
    
    body.style.overflow = 'hidden';

    const pokemonSheet = document.createElement('div');
    pokemonSheet.style.overflow = 'auto';
    pokemonSheet.classList.add('pokemon-sheet');

    let pokemonTypes = ``;
    if(pokemon.type[1]) {
        pokemonTypes = `<span class="background-color-${pokemon.type[0].type.name}">${pokemon.type[0].type.name}</span>
        <span class="background-color-${pokemon.type[1].type.name}">${pokemon.type[1].type.name}</span>`;
    } else {
        pokemonTypes = `<span class="background-color-${pokemon.type[0].type.name}">${pokemon.type[0].type.name}</span>`;
    }

    let pokemonAbilities = pokemon.abilities;
    let pokemonAbilitiesHTML = ``;
    pokemonAbilities.forEach((ability) => {
        pokemonAbilitiesHTML += `<span class="background-color-${pokemon.type[0].type.name}">${ability.ability.name}</span>`;
    });

    let pokemonStats = pokemon.stats;
    let pokemonStatsHTML = ``;
    pokemonStats.forEach((stat) => {
        console.log(stat);
        pokemonStatsHTML += `
        <tr>
            <td>${stat.stat.name}</td>
            <td>${stat.base_stat}</td>
        </tr>
        `;
    });

    pokemonSheet.innerHTML = `
        <h1>${pokemon.name}</h1>
        <div class="pokemon-basic-information">
            <div>
                <table>
                    <tr>
                        <td>Id : </td>
                        <td>${formatPokemonId(pokemon.id)}</td>
                    </tr>
                    <tr>
                        <td>Name : </td>
                        <td>${pokemon.name}</td>
                    </tr>
                    <tr>
                        <td>Type : </td>
                        <td>${pokemonTypes}</td>
                    </tr>
                    <tr>
                        <td>Height : </td>
                        <td>${pokemon.height} cm</td>
                    </tr>
                    <tr>
                        <td>Weight : </td>
                        <td>${pokemon.weight} kg</td>
                    </tr>
                    <tr>
                        <td>Abilities : </td>
                        <td>${pokemonAbilitiesHTML}</td>
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


    // Close modal
    const hidePokemonSheet = document.createElement('span');
    hidePokemonSheet.classList.add('close-pokemon-sheet');
    hidePokemonSheet.innerText = `Retour`;

    hidePokemonSheet.addEventListener('click', () => {
        pokemonSheet.remove();
        body.style.overflow = 'auto';
    });

    pokemonSheet.append(hidePokemonSheet);
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


fetchPokemons();

/*const url = `https://pokeapi.co/api/v2/pokemon/1`
async function test() {
	const fetchPokemon = await fetch(url);
  const data = await fetchPokemon.json();
 	const fetchPokemonSpecies = await fetch(data.species.url)
  const dataPokemonSpecies = await fetchPokemonSpecies.json()
  const fetchEvolutionPokemon = await fetch(dataPokemonSpecies.evolution_chain.url)
  const dataEvolutionPokemon = await fetchEvolutionPokemon.json();
  console.log(dataEvolutionPokemon);
}

test(); */
