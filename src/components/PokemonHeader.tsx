import Link from 'next/link';

interface PokemonHeaderProps {
  pokemonId: number;
  pokemonName: string;
  prevId: number | null;
  nextId: number | null;
}

export default function PokemonHeader({ pokemonId, pokemonName, prevId, nextId }: PokemonHeaderProps) {
  return (
    <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4 shadow-inner mb-8">
      <Link
        href={prevId ? `/pokemon/${prevId}` : '#'}
        className={`flex items-center text-gray-600 font-semibold text-lg transition duration-200 ${
          prevId ? 'hover:text-blue-600' : 'cursor-not-allowed opacity-50'
        }`}
        aria-disabled={!prevId}
      >
        <span className="text-xl mr-2">{'<'}</span>
        {prevId && (
          <span className="hidden sm:inline">#{String(prevId).padStart(3, '0')}</span>
        )}
        <span className="ml-2 hidden sm:inline-block">Prev</span>
      </Link>

      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 capitalize">
          {pokemonName} <span className="text-gray-500 text-3xl">#{String(pokemonId).padStart(3, '0')}</span>
        </h2>
      </div>

      <Link
        href={nextId ? `/pokemon/${nextId}` : '#'}
        className={`flex items-center text-gray-600 font-semibold text-lg transition duration-200 ${
          nextId ? 'hover:text-blue-600' : 'cursor-not-allowed opacity-50'
        }`}
        aria-disabled={!nextId}
      >
        <span className="mr-2 hidden sm:inline-block">Next</span>
        {nextId && (
          <span className="hidden sm:inline">#{String(nextId).padStart(3, '0')}</span>
        )}
        <span className="text-xl ml-2">{'>'}</span>
      </Link>
    </div>
  );
}