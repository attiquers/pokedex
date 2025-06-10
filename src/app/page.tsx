'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PokemonCard from '@/components/PokemonCard';
import CustomSearch from '@/components/CustomSearch';

interface Pokemon {
  name: string;
  url: string;
}

export default function Home() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>('https://pokeapi.co/api/v2/pokemon?limit=12');
  const [loading, setLoading] = useState(false);
  const [showCustomSearch, setShowCustomSearch] = useState(false);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = pokemonName.trim().toLowerCase();
    if (trimmedName) {
      router.push(`/pokemon/${trimmedName}`);
    }
  };

  const loadPokemons = async () => {
    if (!nextUrl || loading) return;

    setLoading(true);
    try {
      const res = await fetch(nextUrl);
      const data = await res.json();

      const existingNames = new Set(pokemonList.map((p) => p.name));
      const newPokemons = data.results.filter((p: Pokemon) => !existingNames.has(p.name));

      setPokemonList((prev) => [...prev, ...newPokemons]);
      setNextUrl(data.next);
    } catch (error) {
      console.error('Failed to load Pokémons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-sky-700 to-blue-900 p-6 text-white">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-4xl mb-8">
        <Image
          src="/pokeball.png"
          alt="Bouncing Pokéball"
          width={60}
          height={60}
          className="animate-bounce mx-auto mt-4"
        />
        <h1 className="text-4xl font-bold text-center mb-6">Pokémon Search</h1>

        <form onSubmit={handleSearch} className="flex gap-4 items-center justify-center mb-4">
          <input
            type="text"
            value={pokemonName}
            onChange={(e) => setPokemonName(e.target.value)}
            placeholder="Search by name"
            className="px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white placeholder-white w-64 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition transform hover:scale-105"
          >
            Search
          </button>
        </form>

        <button
          onClick={() => setShowCustomSearch((prev) => !prev)}
          className="mt-4 bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition"
        >
          {showCustomSearch ? 'Hide Filters' : 'Show Custom Search'}
        </button>
      </div>

      {showCustomSearch && (
        <div className="mb-8">
          <CustomSearch onSearchResults={setPokemonList} />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl">
        {loading && pokemonList.length === 0
          ? Array.from({ length: 12 }).map((_, idx) => <PokemonCard key={idx} />)
          : pokemonList.map((pokemon) => (
              <PokemonCard
                key={pokemon.name}
                name={pokemon.name}
                url={pokemon.url || `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`}
              />
            ))}
      </div>

      {nextUrl && (
        <button
          onClick={loadPokemons}
          className="mt-10 bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-6 rounded-full transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            'Load More'
          )}
        </button>
      )}
    </div>
  );
}
