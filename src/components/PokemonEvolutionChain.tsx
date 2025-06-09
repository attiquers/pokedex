import Image from 'next/image';
import Link from 'next/link';
import { EvolutionNode, PokemonData, Type } from '@/app/pokemon/[name]/page'; // Import types from main page

// Function to get a distinct color for each type (copy-paste from PokemonTypes for now)
const getTypeColor = (typeName: string): string => {
    const colors: { [key: string]: string } = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      grass: 'bg-green-500',
      electric: 'bg-yellow-500',
      ice: 'bg-blue-200',
      fighting: 'bg-red-700',
      poison: 'bg-purple-600',
      ground: 'bg-yellow-700',
      flying: 'bg-blue-300',
      psychic: 'bg-pink-500',
      bug: 'bg-lime-500',
      rock: 'bg-yellow-800',
      ghost: 'bg-indigo-700',
      dragon: 'bg-purple-700',
      steel: 'bg-gray-500',
      dark: 'bg-gray-800',
      fairy: 'bg-pink-300',
    };
    return colors[typeName.toLowerCase()] || 'bg-gray-500'; // Default gray
};

interface EvolutionChainProps {
  evolutionChain: EvolutionNode;
  currentPokemonId: number;
}

// Helper function to fetch minimal Pokémon data (sprite and types)
async function getMinimalPokemonData(pokemonName: string): Promise<{ sprite: string | null; types: Type[] } | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!res.ok) return null;
    const data: PokemonData = await res.json();
    const sprite = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default;
    return { sprite, types: data.types };
  } catch (error) {
    console.error(`Error fetching minimal data for ${pokemonName}:`, error);
    return null;
  }
}

// Recursive function to build the evolution chain display
async function buildEvolutionNodes(node: EvolutionNode): Promise<JSX.Element[]> {
  const pokemonData = await getMinimalPokemonData(node.species.name);
  const pokemonIdMatch = node.species.url.match(/\/(\d+)\/$/);
  const pokemonId = pokemonIdMatch ? parseInt(pokemonIdMatch[1]) : null;

  const renderNode = (
    <Link key={node.species.name} href={`/pokemon/${node.species.name.toLowerCase()}`}>
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-200">
            {pokemonData?.sprite && (
                <Image
                    src={pokemonData.sprite}
                    alt={node.species.name}
                    width={96}
                    height={96}
                    className="object-contain"
                />
            )}
            <p className="font-bold text-lg capitalize text-gray-800 mt-2">{node.species.name}</p>
            {pokemonId && (
                <p className="text-gray-500 text-sm">#{String(pokemonId).padStart(3, '0')}</p>
            )}
            <div className="flex gap-1 mt-1">
                {pokemonData?.types.map(typeInfo => (
                    <span key={typeInfo.type.name} className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white capitalize ${getTypeColor(typeInfo.type.name)}`}>
                        {typeInfo.type.name}
                    </span>
                ))}
            </div>
        </div>
    </Link>
  );

  if (node.evolves_to.length === 0) {
    return [renderNode];
  } else {
    const nextEvolutionStages: JSX.Element[] = [];
    for (const nextEvolution of node.evolves_to) {
      nextEvolutionStages.push(
        <div key={`${node.species.name}-to-${nextEvolution.species.name}`} className="flex items-center">
          <div className="text-gray-400 text-3xl mx-4">❯</div> {/* Arrow separator */}
          {(await buildEvolutionNodes(nextEvolution)).flat()}
        </div>
      );
    }
    return [renderNode, ...nextEvolutionStages];
  }
}

export default async function PokemonEvolutionChain({ evolutionChain }: EvolutionChainProps) {
  const evolutionTree = await buildEvolutionNodes(evolutionChain);

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Evolution Chain</h2>
      <div className="flex flex-wrap justify-center items-center gap-4">
        {evolutionTree}
      </div>
    </div>
  );
}