// components/PokemonEvolutionChain.tsx

import Image from 'next/image';
import Link from 'next/link';
import { EvolutionNode } from '@/app/pokemon/[name]/page'; // Import the type

interface PokemonEvolutionChainProps {
  evolutionChain: EvolutionNode;
  currentPokemonId: number;
}

const formatPokemonId = (id: number): string => String(id).padStart(4, '0');
const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

// Recursive function to flatten the evolution chain
async function fetchEvolutionStages(node: EvolutionNode): Promise<{ id: number; name: string; imageUrl: string; types: { type: { name: string } }[] }[]> {
  const stages: { id: number; name: string; imageUrl: string; types: { type: { name: string } }[] }[] = [];

  const fetchPokemonDetails = async (name: string) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error(`Failed to fetch pokemon details for ${name}`);
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        imageUrl: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
        types: data.types,
      };
    } catch (error) {
      console.error(`Error fetching details for ${name}:`, error);
      return null;
    }
  };

  const currentPokemonDetails = await fetchPokemonDetails(node.species.name);
  if (currentPokemonDetails) {
    stages.push(currentPokemonDetails);
  }

  for (const evolution of node.evolves_to) {
    const nextStages = await fetchEvolutionStages(evolution);
    stages.push(...nextStages);
  }

  // Sort by ID to ensure correct order
  return stages.sort((a, b) => a.id - b.id);
}

// Mapping for type colors (duplicate from page.tsx for self-contained component)
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

// Emoji mapping for types (re-defined or import from a central utility)
const typeEmojis: { [key: string]: string } = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  grass: '🌿', // Grass emoji
  electric: '⚡',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️', // Poison emoji
  ground: '⛰️',
  flying: '🦅',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  steel: '⚙️',
  dark: '🌙',
  fairy: '✨',
};

export default async function PokemonEvolutionChain({ evolutionChain, currentPokemonId }: PokemonEvolutionChainProps) {
  const evolutionStages = await fetchEvolutionStages(evolutionChain);

  return (
    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
      {evolutionStages.map((stage, index) => (
        <div key={stage.id} className="flex items-center">
          <Link href={`/pokemon/${stage.name}`} className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300
            ${stage.id === currentPokemonId ? 'border-4 border-blue-400 scale-105 shadow-lg' : 'border border-gray-600'}
            bg-[#2D3748] hover:bg-[#334155] shadow-md
          `}>
            <div className="relative w-24 h-24 mb-2">
              <Image
                src={stage.imageUrl || '/placeholder-pokemon.png'}
                alt={stage.name}
                width={96}
                height={96}
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-gray-300 text-sm font-semibold mb-1">
              {formatPokemonId(stage.id)}
            </span>
            <span className="text-white font-bold text-lg">
              {capitalizeFirstLetter(stage.name)}
            </span>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
                {stage.types.map(typeInfo => (
                    <span key={typeInfo.type.name} className={`px-2 py-0.5 rounded-full text-xs text-white flex items-center ${typeColors[typeInfo.type.name] || 'bg-gray-500'}`}>
                        {typeEmojis[typeInfo.type.name]} <span className="ml-1">{capitalizeFirstLetter(typeInfo.type.name)}</span>
                    </span>
                ))}
            </div>
          </Link>
          {index < evolutionStages.length - 1 && (
            <div className="mx-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}