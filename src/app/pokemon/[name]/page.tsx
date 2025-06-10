// app/pokemon/[name]/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EvolutionNode, Type } from '@/types/pokemon';

import { PokemonData } from '@/types/pokemon';

// Import our custom components
import PokemonHeader from '@/components/PokemonHeader';
import PokemonBasicInfo from '@/components/PokemonBasicInfo';
import PokemonStats from '@/components/PokemonStats';
import PokemonTypes from '@/components/PokemonTypes';
import PokemonWeaknesses from '@/components/PokemonWeaknesses';
import PokemonEvolutionChain from '@/components/PokemonEvolutionChain';

// --- Type Definitions (as provided by user, ensure consistency) ---





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
  pal_park_encounters: unknown[];
  pokedex_numbers: unknown[];
  shape: { name: string; url: string } | null;
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
}

export interface EvolutionChainData {
  baby_trigger_item: { name: string; url: string } | null;
  chain: EvolutionNode;
  id: number;
}

// --- Data Fetching Functions ---
async function getPokemonData(name: string): Promise<PokemonData | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`); // Ensure lowercase for API
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
  // Prioritize English entries, find the latest version or a general one
  const englishEntry = entries.reverse().find( // reverse to get later versions first
    (entry) => entry.language.name === 'en'
  );
  return englishEntry ? englishEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'No description available.';
}

function getCategory(genera: PokemonSpeciesData['genera']): string {
  const englishGenus = genera.find(
    (genus) => genus.language.name === 'en'
  );
  return englishGenus ? englishGenus.genus.replace(' Pokémon', '') : 'Unknown';
}

// Function to calculate previous and next Pokémon IDs (assuming sequential Pokedex order)
function getAdjacentPokemonIds(currentId: number): { prevId: number | null; nextId: number | null } {
  const prevId = currentId > 1 ? currentId - 1 : null;
  const nextId = currentId < 1025 ? currentId + 1 : null; // As of latest API updates, there are more than 1025. This is a simplification.
  return { prevId, nextId };
}

// Mapping for type colors (you might want to put this in a separate utility or Tailwind config)
const typeColors: { [key: string]: string } = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-400',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-600',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-stone-500',
  ghost: 'bg-indigo-700',
  dragon: 'bg-indigo-800',
  steel: 'bg-slate-400',
  dark: 'bg-gray-800',
  fairy: 'bg-pink-300',
};

const getWeaknesses = (types: Type[]) => {
  const weaknessesSet = new Set<string>();
  const typeInteractions: { [key: string]: { superEffective: string[], notEffective: string[], immune: string[] } } = {
    normal: { superEffective: [], notEffective: ['rock', 'steel'], immune: ['ghost'] },
    fire: { superEffective: ['grass', 'ice', 'bug', 'steel'], notEffective: ['fire', 'water', 'dragon', 'rock'], immune: [] },
    water: { superEffective: ['fire', 'ground', 'rock'], notEffective: ['water', 'grass', 'dragon'], immune: [] },
    grass: { superEffective: ['water', 'ground', 'rock'], notEffective: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], immune: [] },
    electric: { superEffective: ['water', 'flying'], notEffective: ['electric', 'grass', 'dragon'], immune: ['ground'] },
    ice: { superEffective: ['grass', 'ground', 'flying', 'dragon'], notEffective: ['fire', 'water', 'ice', 'steel'], immune: [] },
    fighting: { superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'], notEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'], immune: ['ghost'] },
    poison: { superEffective: ['grass', 'fairy'], notEffective: ['poison', 'ground', 'rock', 'ghost'], immune: ['steel'] },
    ground: { superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'], notEffective: ['grass', 'bug'], immune: ['flying'] },
    flying: { superEffective: ['grass', 'fighting', 'bug'], notEffective: ['electric', 'rock', 'steel'], immune: [] },
    psychic: { superEffective: ['fighting', 'poison'], notEffective: ['psychic', 'steel'], immune: ['dark'] },
    bug: { superEffective: ['grass', 'psychic', 'dark'], notEffective: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], immune: [] },
    rock: { superEffective: ['fire', 'ice', 'flying', 'bug'], notEffective: ['fighting', 'ground', 'steel'], immune: [] },
    ghost: { superEffective: ['psychic', 'ghost'], notEffective: ['dark', 'steel'], immune: ['normal', 'fighting'] },
    dragon: { superEffective: ['dragon'], notEffective: ['steel'], immune: ['fairy'] },
    steel: { superEffective: ['ice', 'rock', 'fairy'], notEffective: ['fire', 'water', 'electric', 'steel'], immune: [] },
    dark: { superEffective: ['psychic', 'ghost'], notEffective: ['fighting', 'dark', 'fairy'], immune: [] },
    fairy: { superEffective: ['fighting', 'dragon', 'dark'], notEffective: ['fire', 'poison', 'steel'], immune: [] },
  };

  // Build a map to track effectiveness multipliers for each type
  const effectiveness: { [key: string]: number } = {};

  // Initialize all types with 1x effectiveness
  Object.keys(typeInteractions).forEach(type => {
    effectiveness[type] = 1;
  });

  // Apply multipliers based on the Pokémon's types
  types.forEach(pokemonType => {
    const typeName = pokemonType.type.name;
    const interactions = typeInteractions[typeName];

    if (interactions) {
      interactions.superEffective.forEach(t => {
        effectiveness[t] = (effectiveness[t] || 1) * 2; // Double damage from these types
      });
      interactions.notEffective.forEach(t => {
        effectiveness[t] = (effectiveness[t] || 1) * 0.5; // Half damage from these types
      });
      interactions.immune.forEach(t => {
        effectiveness[t] = 0; // No damage from these types
      });
    }
  });

  // Filter types that deal 2x or 4x damage (weaknesses)
  for (const type in effectiveness) {
    if (effectiveness[type] >= 2) { // Consider 2x or more as weakness
      weaknessesSet.add(type);
    }
  }

  // Handle resistances/immunities that might negate a weakness from another type
  // This is a simplified check and a full type chart calculation is more complex
  types.forEach(pokemonType => {
    const typeName = pokemonType.type.name;
    const interactions = typeInteractions[typeName];

    if (interactions) {
      interactions.notEffective.forEach(t => {
        if (weaknessesSet.has(t) && effectiveness[t] < 2) { // If it was a weakness, but now resisted
          weaknessesSet.delete(t);
        }
      });
      interactions.immune.forEach(t => {
        if (weaknessesSet.has(t)) { // If immune, it's not a weakness
          weaknessesSet.delete(t);
        }
      });
    }
  });


  return Array.from(weaknessesSet);
};

interface PageProps {
  params: {
    name: string; // Dynamic route parameters are always strings
  };
}

export default async function PokemonDetail({ params }: PageProps) {
  const pokemonName = params.name; // 'pokemonName' will be a string like "pikachu"
  const pokemon = await getPokemonData(pokemonName);

  if (!pokemon) return notFound();

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

  // Get weaknesses using the revised function
  const weaknesses = getWeaknesses(pokemon.types);


  return (
    // Main container to mimic the dark background and overall structure
    <div className="min-h-screen bg-[#1F2937] text-white font-sans flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-7xl">
   
        {/* Main Content Area */}
        <div className="bg-[#2D3748] rounded-2xl shadow-2xl max-w-6xl w-full mx-auto p-8 lg:p-12 border border-[#4B5563]">
            <PokemonHeader
                pokemonId={pokemon.id}
                pokemonName={pokemon.name}
                prevId={prevId}
                nextId={nextId}
                pokemonNamePrev={prevId ? `Bulbasaur` : null} // Hardcoded for demo, fetch if possible
                pokemonNameNext={nextId ? `Venusaur` : null} // Hardcoded for demo, fetch if possible
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
                {/* Left Column: Image, Versions, Style */}
                <div className="flex flex-col items-center">
                    {/* Pokemon Image with Glow Effect */}
                    <div className="relative w-full max-w-sm aspect-square rounded-full flex items-center justify-center
                                    bg-gradient-to-br from-blue-400 to-green-400 p-1 mb-8
                                    before:content-[''] before:absolute before:inset-0 before:rounded-full
                                    before:bg-gradient-to-br before:from-blue-600 before:to-green-600 before:blur-md before:opacity-75
                                    before:z-[-1] overflow-hidden">
                        <div className="relative w-full h-full rounded-full flex items-center justify-center bg-[#2D3748]">
                            <Image
                                src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default || '/placeholder-pokemon.png'}
                                alt={pokemon.name}
                                width={350}
                                height={350}
                                className="object-contain w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                priority
                            />
                        </div>
                    </div>

                    {/* Versions/Description */}
                    <div className="bg-[#334155] rounded-xl p-6 w-full shadow-lg border border-gray-600 mb-8">
                        <h3 className="text-xl font-bold text-gray-100 mb-3 flex items-center">
                            Versions
                            <span className="ml-2 text-blue-400">●</span>
                            <span className="ml-1 text-green-400">●</span>
                        </h3>
                        <p className="text-gray-300 text-base leading-relaxed">
                            {flavorText}
                        </p>
                    </div>

                    {/* Style Section */}
                    <div className="bg-[#334155] rounded-xl p-6 w-full shadow-lg border border-gray-600">
                        <h3 className="text-xl font-bold text-gray-100 mb-3">Style</h3>
                        <p className="text-gray-300 text-base">
                            This Pokémon does not have different form.
                        </p>
                    </div>
                </div>

                {/* Right Column: Basic Info, Types, Weaknesses, Status */}
                <div className="flex flex-col space-y-8">
                    <PokemonBasicInfo
                        height={pokemon.height / 10} // Convert dm to meters
                        weight={pokemon.weight / 10} // Convert hg to kg
                        category={category}
                        abilities={pokemon.abilities}
                        maleRatio={maleRatio}
                        femaleRatio={femaleRatio}
                        baseHappiness={pokemonSpecies?.base_happiness || null} // Assuming base_happiness is relevant
                    />

                    <PokemonTypes types={pokemon.types} typeColors={typeColors} />

                    <PokemonWeaknesses weaknesses={weaknesses} typeColors={typeColors} />

                    {/* Status (placeholder, will be replaced by PokemonStats) */}
                    <div className="bg-[#334155] rounded-xl p-6 shadow-lg border border-gray-600">
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Status</h3>
                        <PokemonStats stats={pokemon.stats} />
                    </div>
                </div>
            </div>

            {/* Evolution Chain Section */}
            {evolutionChain && pokemon.sprites.front_default && (
                <div className="mt-12 bg-[#334155] rounded-xl p-6 shadow-lg border border-gray-600">
                    <h3 className="text-xl font-bold text-gray-100 mb-6">Evolution</h3>
                    <PokemonEvolutionChain
                        evolutionChain={evolutionChain.chain}
                        currentPokemonId={pokemon.id}
                    />
                </div>
            )}

            {/* Back to Pokedex Button */}
            <div className="mt-12 text-center">
                <Link href="/" className="inline-block bg-[#F8A55A] hover:bg-[#E08F45] text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                    Back to Pokédex
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}