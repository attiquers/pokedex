'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [pokemonName, setPokemonName] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (pokemonName.trim()) {
      router.push(`/pokemon/${pokemonName.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-blue-500 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
        {/* Logo */}
        <Image
          src="/pokemon-logo.png" // Make sure you have a pokemon-logo.png in your public directory
          alt="Pokemon Logo"
          width={200}
          height={80}
          className="mb-6 animate-bounce"
        />

        <h1 className="text-5xl font-extrabold text-gray-800 mb-8">
          Pokémon Search
        </h1>

        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="flex items-center border-b-2 border-red-500 py-2">
            <input
              className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none text-lg"
              type="text"
              placeholder="Enter Pokémon name (e.g., pikachu)"
              aria-label="Pokémon name"
              value={pokemonName}
              onChange={(e) => setPokemonName(e.target.value)}
            />
            <button
              className="flex-shrink-0 bg-red-500 hover:bg-red-700 border-red-500 hover:border-red-700 text-sm border-4 text-white py-1 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              type="submit"
            >
              Search
            </button>
          </div>
        </form>

        <p className="mt-8 text-gray-600 text-center text-sm">
          Powered by the{' '}
          <a
            href="https://pokeapi.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline"
          >
            PokéAPI
          </a>
        </p>
      </div>
    </div>
  );
}