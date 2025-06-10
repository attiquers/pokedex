'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface PokemonCardProps {
  name: string;
  url: string;
}

interface PokemonDetails {
  id: number; // Added id for the Pokémon number
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
}

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

export default function PokemonCard({ name, url }: PokemonCardProps) {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    async function fetchDetails() {
      const res = await fetch(url);
      const data = await res.json();
      setDetails(data);
    }
    fetchDetails();
  }, [url]);

  if (!details) return <div className="text-gray-500">Loading {name}...</div>;

  const imageUrl = details.sprites.other['official-artwork'].front_default;
  const pokemonNumber = String(details.id).padStart(4, '0'); // Format to 4 digits (e.g., 0001)

  // Function to get type-specific color classes
  const getTypeColorClass = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'grass':
        return 'bg-lime-500'; // A shade of green
      case 'poison':
        return 'bg-purple-500'; // A shade of purple
      case 'fire':
        return 'bg-red-500';
      case 'water':
        return 'bg-blue-500';
      case 'bug':
        return 'bg-green-500';
      case 'normal':
        return 'bg-gray-400';
      case 'electric':
        return 'bg-yellow-400';
      case 'ground':
        return 'bg-amber-700';
      case 'fairy':
        return 'bg-pink-300';
      case 'fighting':
        return 'bg-orange-700';
      case 'psychic':
        return 'bg-fuchsia-600';
      case 'rock':
        return 'bg-stone-600';
      case 'steel':
        return 'bg-slate-500';
      case 'ice':
        return 'bg-cyan-300';
      case 'ghost':
        return 'bg-indigo-700';
      case 'dragon':
        return 'bg-sky-700';
      case 'dark':
        return 'bg-neutral-800';
      default:
        return 'bg-gray-500'; // Default color
    }
  };

  const handleClick = () => {
    router.push(`/pokemon/${name}`);
  };

  return (
    <div
      className="
        bg-gradient-to-br from-blue-900 to-black
        rounded-xl shadow-lg
        p-4 flex flex-col items-center
        text-white
        font-sans
        relative
        overflow-hidden
        border-2 border-transparent hover:border-blue-500 transition-all duration-300
        w-64 h-80 // Fixed width and height for consistency, adjust as needed
        cursor-pointer // Add cursor-pointer to indicate it's clickable
      "
      onClick={handleClick} // Attach the handleClick function
    >
      {/* Background circle pattern */}
      <div className="absolute inset-0 z-0 -top-28">
        <div className="
          absolute w-48 h-48 rounded-full
          bg-gray-800 opacity-50
          -top-12 -left-12
          flex items-center justify-center
        ">
          <div className="w-32 h-32 rounded-full bg-black opacity-50"></div>
        </div>
        <div className="
          absolute w-48 h-48 rounded-full
          bg-gray-800 opacity-50
          -bottom-12 -right-12
          flex items-center justify-center
        ">
          <div className="w-32 h-32 rounded-full bg-black opacity-50"></div>
        </div>
        {/* More subtle circles for the 'Pokeball' look */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-4 border-gray-700 opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-gray-700 opacity-70"></div>
      </div>

      {/* Pokemon Image Section */}
      <div className="
        relative z-10
        w-full h-36
        flex items-center justify-center
        mb-4
        rounded-t-lg
        overflow-hidden
      ">
        <Image
          src={imageUrl}
          alt={name}
          width={150} // Increased size for prominence
          height={150}
          objectFit="contain" // Ensures the image fits within the bounds
          className="drop-shadow-lg" // Add a subtle shadow to the image
        />
      </div>

      {/* Details Section */}
      <div className="
        relative z-10
        backdrop-blur-md bg-white/10
        rounded-b-xl
        p-3
        w-full
        flex flex-col
        items-start
        space-y-2
        border-t border-white/20
        shadow-inner
        flex-grow
      ">
        <p className="text-sm font-mono text-gray-200 drop-shadow-sm">{pokemonNumber}</p>
        <h2 className="text-2xl font-bold capitalize text-white drop-shadow-md">{name}</h2>
        <div className="flex space-x-2 mt-2">
          {details.types.map((typeInfo) => (
            <span
              key={typeInfo.type.name}
              className={`
                px-4 py-1
                rounded-full
                text-sm font-semibold
                text-white
                flex items-center // Add flex and items-center to align emoji and text
                ${getTypeColorClass(typeInfo.type.name)}
                shadow-md
              `}
            >
              {typeEmojis[typeInfo.type.name]} <span className="ml-1">{typeInfo.type.name}</span> {/* Add emoji and spacing */}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}