import React from 'react'

export default async function Page({ searchParams }: { searchParams: { name?: string } }) {
  const name = searchParams?.name;
  let pokemon = null;
  if (name) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
    if (res.ok) {
      pokemon = await res.json();
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 to-cyan-200 py-12">
      {pokemon ? (
        <>
          <h1 className="text-4xl font-bold text-blue-700 mb-4 drop-shadow capitalize">{pokemon.name}</h1>
          <img src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default} alt={pokemon.name} className="w-64 h-64 object-contain mb-6" />
          <div className="text-lg text-gray-700 mb-2">ID: {pokemon.id}</div>
          <div className="text-lg text-gray-700 mb-2">Height: {pokemon.height}</div>
          <div className="text-lg text-gray-700 mb-2">Weight: {pokemon.weight}</div>
          <div className="text-lg text-gray-700 mb-2">Types: {pokemon.types.map((t: any) => t.type.name).join(', ')}</div>
        </>
      ) : (
        <div className="text-xl text-gray-600">No Pokémon selected. Please select a region to catch a Pokémon!</div>
      )}
    </div>
  );
}