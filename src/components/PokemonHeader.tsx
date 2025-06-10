// components/PokemonHeader.tsx

import Link from 'next/link';

interface PokemonHeaderProps {
  pokemonId: number;
  pokemonName: string;
  prevId: number | null;
  nextId: number | null;
  pokemonNamePrev: string | null; // Added for more accurate display as in image
  pokemonNameNext: string | null; // Added for more accurate display as in image
}

const formatPokemonId = (id: number): string => String(id).padStart(4, '0');
const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);


export default function PokemonHeader({
  pokemonId,
  pokemonName,
  prevId,
  nextId,
  pokemonNamePrev,
  pokemonNameNext,
}: PokemonHeaderProps) {
  return (
    <div className="flex items-center justify-between text-gray-300 mb-8 px-4 py-3 bg-[#4B5563] rounded-xl shadow-inner border border-gray-700">
      <div className="flex items-center">
        {prevId && (
          <Link href={`/pokemon/${prevId}`} className="flex items-center group">
            <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-200 transition-colors mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            <span className="text-xl font-medium text-blue-300 group-hover:text-blue-100 hidden sm:inline">
              {formatPokemonId(prevId)} {pokemonNamePrev ? capitalizeFirstLetter(pokemonNamePrev) : ''}
            </span>
          </Link>
        )}
      </div>

      <div className="text-center flex-grow">
        <h2 className="text-4xl font-extrabold text-white tracking-wide">
          <span className="text-blue-400">{formatPokemonId(pokemonId)}</span> {capitalizeFirstLetter(pokemonName)}
        </h2>
      </div>

      <div className="flex items-center">
        {nextId && (
          <Link href={`/pokemon/${nextId}`} className="flex items-center group">
            <span className="text-xl font-medium text-blue-300 group-hover:text-blue-100 hidden sm:inline">
              {formatPokemonId(nextId)} {pokemonNameNext ? capitalizeFirstLetter(pokemonNameNext) : ''}
            </span>
            <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-200 transition-colors ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        )}
      </div>
    </div>
  );
}