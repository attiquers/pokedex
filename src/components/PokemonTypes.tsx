// components/PokemonTypes.tsx

import { Type } from '@/types/pokemon'; // ✅ Safe import

interface PokemonTypesProps {
  types: Type[];
  typeColors: { [key: string]: string }; // Pass the color map
}

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

// Emoji mapping for types
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

export default function PokemonTypes({ types, typeColors }: PokemonTypesProps) {
  return (
    <div className="bg-[#334155] rounded-xl p-6 shadow-lg border border-gray-600">
      <h3 className="text-xl font-bold text-gray-100 mb-4">Type</h3>
      <div className="flex flex-wrap gap-3">
        {types.map((typeInfo) => (
          <span
            key={typeInfo.type.name}
            className={`px-5 py-2 rounded-full text-white font-semibold text-lg shadow-md flex items-center justify-center ${typeColors[typeInfo.type.name] || 'bg-gray-500'}`}
          >
            {typeEmojis[typeInfo.type.name]} <span className="ml-2">{capitalizeFirstLetter(typeInfo.type.name)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}