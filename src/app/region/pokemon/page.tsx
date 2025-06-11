"use client";
import React, { useState, useEffect } from 'react';

function normalize(stat, max) {
  return Math.min(stat / max, 1);
}

function calculateStatScore(stats) {
  const weights = {
    hp: 0.15,
    attack: 0.15,
    defense: 0.15,
    'special-attack': 0.15,
    'special-defense': 0.15,
    speed: 0.25,
  };
  const maxValues = {
    hp: 200,
    attack: 150,
    defense: 150,
    'special-attack': 150,
    'special-defense': 150,
    speed: 150,
  };
  return stats.reduce((score, stat) => {
    const key = stat.name;
    return score + normalize(stat.value, maxValues[key]) * weights[key] * 100;
  }, 0);
}

export default function Page({ searchParams }) {
  // Fix searchParams usage for Next.js 15 client components
  const params = React.use(searchParams) as Record<string, string>;
  const name = params?.name;
  const [wildData, setWildData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [expertWinner, setExpertWinner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPokemon() {
      // Fetch user Pokémon (Pikachu)
      const userRes = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');
      let userPokemon = null;
      if (userRes.ok) {
        userPokemon = await userRes.json();
      }
      // Fetch wild Pokémon
      let wildPokemon = null;
      if (name) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
        if (res.ok) {
          wildPokemon = await res.json();
        }
      }
      // Prepare data
      async function preparePokemonData(pokemon) {
        let types = [];
        let stats = [];
        let abilities = [];
        let moves = [];
        if (pokemon) {
          types = pokemon.types.map((t) => t.type.name);
          abilities = pokemon.abilities.map((a) => a.ability.name);
          stats = pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat }));
          // Fetch moveset (limit to first 10 moves for performance)
          const moveData = await Promise.all(
            pokemon.moves.slice(0, 10).map(async (m) => {
              const res = await fetch(m.move.url);
              if (!res.ok) return { name: m.move.name, power: null, type: '' };
              const data = await res.json();
              return {
                name: data.name,
                power: data.power,
                type: data.type?.name || '',
              };
            })
          );
          moves = moveData;
        }
        const score = calculateStatScore(stats);
        return { name: pokemon.name, types, stats, abilities, moves, image: pokemon.sprites.other['official-artwork'].front_default, score };
      }
      if (wildPokemon) {
        setWildData(await preparePokemonData(wildPokemon));
      }
      if (userPokemon) {
        setUserData(await preparePokemonData(userPokemon));
      }
    }
    fetchPokemon();
  }, [name]);

  async function handleBattle() {
    setLoading(true);
    setExpertWinner(null);
    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wildData, userData })
      });
      const data = await res.json();
      setExpertWinner(data.winner || 'Error');
    } catch (e) {
      setExpertWinner('Error');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--poke-blue)] to-[var(--poke-accent)] py-12 px-4">
      <h1 className="text-4xl font-bold text-center text-[var(--poke-blue)] mb-8 drop-shadow">Pokémon Comparison</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Wild Pokémon */}
        <div className="poke-card p-6 rounded-2xl shadow-xl">
          {wildData ? (
            <>
              <h2 className="text-2xl font-semibold text-[var(--poke-red)] mb-2">Wild Pokémon: {wildData.name}</h2>
              <img src={wildData.image} alt={wildData.name} className="w-48 h-48 object-contain mb-4 mx-auto" />
              <p className="text-gray-700 mb-2">Types: {wildData.types.join(', ')}</p>
              <p className="text-gray-700 mb-2">Abilities: {wildData.abilities.join(', ')}</p>
              <p className="text-gray-700 mb-2">Stat Score: {wildData.score.toFixed(2)}</p>
              <div className="mt-2">
                <h3 className="font-medium text-[var(--poke-black)] mb-1">Base Stats:</h3>
                <ul className="text-[var(--poke-gray)]">
                  {wildData.stats.map((stat) => (
                    <li key={stat.name}>{stat.name}: {stat.value}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-[var(--poke-black)] mb-1">Moveset:</h3>
                <ul className="text-[var(--poke-gray)]">
                  {wildData.moves.map((move) => (
                    <li key={move.name} className="capitalize">
                      {move.name} {move.type && <span className="text-xs text-[var(--poke-blue)]">[{move.type}]</span>} {move.power !== null && <span className="text-xs text-[var(--poke-red)]">Power: {move.power}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-gray-600">No wild Pokémon selected.</p>
          )}
        </div>

        {/* User Pokémon */}
        <div className="poke-card p-6 rounded-2xl shadow-xl">
          {userData ? (
            <>
              <h2 className="text-2xl font-semibold text-[var(--poke-green)] mb-2">Your Pokémon: {userData.name}</h2>
              <img src={userData.image} alt={userData.name} className="w-48 h-48 object-contain mb-4 mx-auto" />
              <p className="text-gray-700 mb-2">Types: {userData.types.join(', ')}</p>
              <p className="text-gray-700 mb-2">Abilities: {userData.abilities.join(', ')}</p>
              <p className="text-gray-700 mb-2">Stat Score: {userData.score.toFixed(2)}</p>
              <div className="mt-2">
                <h3 className="font-medium text-[var(--poke-black)] mb-1">Base Stats:</h3>
                <ul className="text-[var(--poke-gray)]">
                  {userData.stats.map((stat) => (
                    <li key={stat.name}>{stat.name}: {stat.value}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-[var(--poke-black)] mb-1">Moveset:</h3>
                <ul className="text-[var(--poke-gray)]">
                  {userData.moves.map((move) => (
                    <li key={move.name} className="capitalize">
                      {move.name} {move.type && <span className="text-xs text-[var(--poke-blue)]">[{move.type}]</span>} {move.power !== null && <span className="text-xs text-[var(--poke-red)]">Power: {move.power}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {wildData && userData && (
        <div className="text-center mt-10 text-2xl font-bold">
          {expertWinner ? (
            <>🏆 Winner: {expertWinner}</>
          ) : (
            <button
              className="poke-btn px-8 py-3 rounded-xl"
              onClick={handleBattle}
              disabled={loading}
            >
              {loading ? 'Battling...' : 'Battle'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}