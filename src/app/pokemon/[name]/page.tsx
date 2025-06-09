// app/pokemon/[name]/page.tsx

import Image from 'next/image';
import Link from 'next/link';

// Import our new components (will be created below)
import PokemonHeader from '@/components/PokemonHeader';
import PokemonBasicInfo from '@/components/PokemonBasicInfo';
import PokemonStats from '@/components/PokemonStats';
import PokemonTypes from '@/components/PokemonTypes';
import PokemonWeaknesses from '@/components/PokemonWeaknesses';
import PokemonEvolutionChain from '@/components/PokemonEvolutionChain';

// --- Type Definitions (Updated to include relevant fields for the new design) ---
interface Ability {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

interface Type {
  slot: number;
  type: { name: string; url: string };
}

interface Stat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

interface SpriteOther {
  'official-artwork'?: { front_default: string | null; front_shiny: string | null };
  home?: { front_default: string | null; front_shiny: string | null };
  dream_world?: { front_default: string | null };
}

interface Sprites {
  front_default: string | null;
  other: SpriteOther;
}

interface Cries {
  latest: string | null;
  legacy: string | null;
}

export interface PokemonData {
  abilities: Ability[];
  base_experience: number;
  cries: Cries;
  forms: { name: string; url: string }[];
  height: number;
  id: number;
  name: string;
  species: { name: string; url: string };
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  weight: number;
}

export interface PokemonSpeciesData {
  base_happiness: number;
  capture_rate: number;
  egg_groups: { name: string; url: string }[];
  evolution_chain: { url: string };
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string; url: string };
    version: { name: string; url: string };
  }[];
  gender_rate: number; // -1 for genderless, 0 for 100% male, 8 for 100% female (females are 8/8 * 12.5% = 100%)
  genera: { genus: string; language: { name: string; url: string } }[];
  habitat: { name: string; url: string } | null;
  has_gender_differences: boolean;
  hatch_counter: number;
  id: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  name: string;
  order: number;
  pal_park_encounters: any[];
  pokedex_numbers: any[];
  shape: { name: string; url: string } | null;
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
}

export interface EvolutionChainData {
  baby_trigger_item: { name: string; url: string } | null;
  chain: EvolutionNode;
  id: number;
}

export interface EvolutionNode {
  evolution_details: any[];
  evolves_to: EvolutionNode[];
  is_baby: boolean;
  species: { name: string; url: string };
}

// --- Data Fetching Functions ---
async function getPokemonData(name: string): Promise<PokemonData | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch Pokémon data: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return null;
  }
}

async function getPokemonSpeciesData(url: string): Promise<PokemonSpeciesData | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch Pokémon species data: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching Pokémon species data:', error);
    return null;
  }
}

async function getEvolutionChainData(url: string): Promise<EvolutionChainData | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch evolution chain data: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching evolution chain data:', error);
    return null;
  }
}

// --- Utility Functions ---
function getFlavorText(entries: PokemonSpeciesData['flavor_text_entries']): string {
  const englishEntry = entries.find(
    (entry) => entry.language.name === 'en'
  );
  return englishEntry ? englishEntry.flavor_text.replace(/\n/g, ' ') : 'No description available.';
}

function getCategory(genera: PokemonSpeciesData['genera']): string {
  const englishGenus = genera.find(
    (genus) => genus.language.name === 'en'
  );
  return englishGenus ? englishGenus.genus.replace(' Pokémon', '') : 'Unknown';
}

// Function to calculate previous and next Pokémon IDs
function getAdjacentPokemonIds(currentId: number): { prevId: number | null; nextId: number | null } {
  const prevId = currentId > 1 ? currentId - 1 : null;
  const nextId = currentId < 1025 ? currentId + 1 : null; // PokéAPI has about 1025+ Pokémon currently
  return { prevId, nextId };
}

// --- Main Component ---
export default async function PokemonDetail({ params }: { params: { name: string } }) {
  const pokemon = await getPokemonData(params.name);

  if (!pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Pokémon Not Found</h1>
          <p className="text-gray-600">
            Sorry, we could not find a Pokémon named &quot;
            <span className="font-semibold text-red-500">{params.name}</span>&quot;.
          </p>
          <a href="/" className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300">
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  const pokemonSpecies = await getPokemonSpeciesData(pokemon.species.url);
  let evolutionChain: EvolutionChainData | null = null;
  if (pokemonSpecies?.evolution_chain?.url) {
    evolutionChain = await getEvolutionChainData(pokemonSpecies.evolution_chain.url);
  }

  const flavorText = pokemonSpecies ? getFlavorText(pokemonSpecies.flavor_text_entries) : 'No description available.';
  const category = pokemonSpecies ? getCategory(pokemonSpecies.genera) : 'Unknown';

  const { prevId, nextId } = getAdjacentPokemonIds(pokemon.id);

  // Derive gender information
  let maleRatio: number | null = null;
  let femaleRatio: number | null = null;

  if (pokemonSpecies && pokemonSpecies.gender_rate !== -1) {
    femaleRatio = (pokemonSpecies.gender_rate / 8) * 100;
    maleRatio = 100 - femaleRatio;
  }


  // Simplified weakness calculation based on types (real calculation is complex)
  // This is a basic example and might not cover all type interactions perfectly
  const getWeaknesses = (types: Type[]) => {
    const weaknesses: string[] = [];
    const typeWeaknessesMap: { [key: string]: string[] } = {
      normal: ['fighting'],
      fire: ['water', 'ground', 'rock'],
      water: ['grass', 'electric'],
      grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
      electric: ['ground'],
      ice: ['fire', 'fighting', 'rock', 'steel'],
      fighting: ['flying', 'psychic', 'fairy'],
      poison: ['ground', 'psychic'],
      ground: ['water', 'grass', 'ice'],
      flying: ['electric', 'ice', 'rock'],
      psychic: ['bug', 'ghost', 'dark'],
      bug: ['fire', 'flying', 'rock'],
      rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
      ghost: ['ghost', 'dark'],
      dragon: ['ice', 'dragon', 'fairy'],
      steel: ['fire', 'fighting', 'ground'],
      dark: ['fighting', 'bug', 'fairy'],
      fairy: ['poison', 'steel'],
    };

    types.forEach(pokemonType => {
      const typeName = pokemonType.type.name;
      if (typeWeaknessesMap[typeName]) {
        typeWeaknessesMap[typeName].forEach(weakness => {
          if (!weaknesses.includes(weakness)) {
            weaknesses.push(weakness);
          }
        });
      }
    });
    return weaknesses;
  };

  const weaknesses = getWeaknesses(pokemon.types);


  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 p-8 lg:p-12 border border-gray-200">
        <PokemonHeader
          pokemonId={pokemon.id}
          pokemonName={pokemon.name}
          prevId={prevId}
          nextId={nextId}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
          {/* Left Column: Image, Cries, Description */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <Image
                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder-pokemon.png'}
                alt={pokemon.name}
                width={300}
                height={300}
                className="object-contain w-full h-auto max-h-[300px] transform transition-transform duration-500 hover:scale-105"
                priority
              />
              {pokemon.cries.latest && (
                <audio controls className="mt-6 w-full max-w-xs">
                  <source src={pokemon.cries.latest} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
             <p className="text-gray-700 text-center text-lg mt-8 leading-relaxed italic">
                {flavorText}
            </p>
          </div>

          {/* Right Column: Basic Info, Types, Weaknesses */}
          <div className="flex flex-col">
            <PokemonBasicInfo
              height={pokemon.height}
              weight={pokemon.weight}
              category={category}
              abilities={pokemon.abilities}
              maleRatio={maleRatio}
              femaleRatio={femaleRatio}
            />

            <PokemonTypes types={pokemon.types} />

            <PokemonWeaknesses weaknesses={weaknesses} />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12">
          <PokemonStats stats={pokemon.stats} />
        </div>

        {/* Evolution Chain Section */}
        {evolutionChain && pokemon.sprites.front_default && (
            <div className="mt-12">
                <PokemonEvolutionChain
                    evolutionChain={evolutionChain.chain}
                    currentPokemonId={pokemon.id}
                />
            </div>
        )}


        {/* Explore More Button */}
        <div className="mt-12 text-center">
          <Link href="/">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Explore More Pokémon
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}