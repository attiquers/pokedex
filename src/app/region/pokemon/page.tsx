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
  const [userPokemons, setUserPokemons] = useState<any[]>([]);
  const [selectedUserPokemon, setSelectedUserPokemon] = useState<any | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingUserPokes, setLoadingUserPokes] = useState(true);

  useEffect(() => {
    async function fetchPokemon() {
      // Fetch user Pokémon (Pikachu)
      const userRes = await fetch('https://pokeapi.co/api/v2/pokemon/pikachu');
      let userPokemon = null;
      if (userRes.ok) {
        userPokemon = await userRes.json();
      }

      // Fetch wild Pokémon by name and extract ID
      let wildPokemon = null;
      let wildPokemonId = null; // Variable to store the ID
      if (name) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
        if (res.ok) {
          wildPokemon = await res.json();
          // Extract the ID from the fetched wild Pokemon data
          wildPokemonId = wildPokemon.id; // <--- This line extracts the ID
          console.log(`Wild Pokémon ID for ${name}:`, wildPokemonId); // Optional: log the ID
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
        return {
          name: pokemon.name,
          types,
          stats,
          abilities,
          moves,
          image: pokemon.sprites.other['official-artwork'].front_default,
          score,
          id: pokemon.id, // Ensure ID is included in the prepared data
        };
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

  // Fetch user info and their pokemons
  useEffect(() => {
    async function fetchUserAndPokemons() {
      setLoadingUserPokes(true);
      // Get user from supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) return;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      if (userData.user) {
        const { data, error } = await supabase
          .from('user_pokemons')
          .select('pokemon_id, nickname')
          .eq('user_id', userData.user.id);
        if (!error && data) {
          setUserPokemons(data);
          // Default to first pokemon if none selected
          setSelectedUserPokemon(data[0] || null);
        }
      }
      setLoadingUserPokes(false);
    }
    fetchUserAndPokemons();
  }, []);

  async function handleBattle() {
    setLoading(true);
    setExpertWinner(null);
    try {
      const res = await fetch("/api/battle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wildData, userData: selectedUserPokemon })
      });
      const data = await res.json();
      setExpertWinner(data.winner || 'Error');
      // If user wins, add wild pokemon to user_pokemons
      if (
        data.winner &&
        selectedUserPokemon &&
        user &&
        data.winner.toLowerCase() === selectedUserPokemon.name?.toLowerCase() &&
        wildData
      ) {
        // Insert wild pokemon into user_pokemons
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseAnonKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseAnonKey);
          // Check if already owned
          const wildId = wildData.id || (wildData.pokemon_id ? wildData.pokemon_id : null);
          if (!wildId) {
            console.log('Wild Pokémon missing id:', wildData);
          }
          const { data: existing, error: checkError } = await supabase
            .from('user_pokemons')
            .select('id')
            .eq('user_id', user.id)
            .eq('pokemon_id', wildId);
          console.log('Check existing user_pokemons:', existing, checkError);
          if (!existing || existing.length === 0) {
            const { error: insertError, data: insertData } = await supabase.from('user_pokemons').insert({
              user_id: user.id,
              pokemon_id: wildId,
              nickname: wildData.name,
            });
            console.log('Insert user_pokemons:', insertData, insertError);
            // Optionally, refresh userPokemons
            const { data: updated, error: refreshError } = await supabase
              .from('user_pokemons')
              .select('pokemon_id, nickname')
              .eq('user_id', user.id);
            if (updated) setUserPokemons(updated);
            if (refreshError) console.log('Refresh user_pokemons error:', refreshError);
          }
        }
      }
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
        <div className="poke-card p-8 rounded-3xl shadow-2xl border-4 border-[var(--poke-blue)] relative flex flex-col items-center">
          {wildData ? (
            <>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--poke-blue)] rounded-full p-2 shadow-lg border-4 border-white">
                <img src={wildData.image} alt={wildData.name} className="w-32 h-32 object-contain" />
              </div>
              <h2 className="mt-28 text-2xl font-extrabold text-[var(--poke-blue)] tracking-wide uppercase mb-2 text-center">{wildData.name}</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {wildData.types.map((type) => (
                  <span key={type} className="px-3 py-1 rounded-full bg-[var(--poke-accent)] text-[var(--poke-blue)] font-bold text-xs uppercase shadow">{type}</span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {wildData.abilities.map((ab) => (
                  <span key={ab} className="px-2 py-1 rounded bg-[var(--poke-blue)] text-white text-xs font-semibold shadow">{ab}</span>
                ))}
              </div>
              <div className="w-full mb-4">
                <h3 className="font-bold text-[var(--poke-blue)] mb-1 text-center">Base Stats</h3>
                <ul className="space-y-1">
                  {wildData.stats.map((stat) => (
                    <li key={stat.name} className="flex justify-between items-center text-[var(--poke-black)]">
                      <span className="capitalize w-24 text-white">{stat.name}</span>
                      <div className="flex-1 mx-2 bg-[var(--poke-gray)] rounded-full h-2 overflow-hidden">
                        <div className="bg-[var(--poke-blue)] h-2 rounded-full" style={{width: `${Math.min(stat.value/2,100)}%`}}></div>
                      </div>
                      <span className="font-mono w-8 text-right">{stat.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full mb-2">
                <h3 className="font-bold text-[var(--poke-blue)] mb-1 text-center">Moveset</h3>
                <ul className="flex flex-wrap gap-2 justify-center">
                  {wildData.moves.map((move) => (
                    <li key={move.name} className="bg-[var(--poke-accent)] text-[var(--poke-blue)] px-2 py-1 rounded-full text-xs font-semibold capitalize shadow">
                      {move.name} {move.type && <span className="text-[var(--poke-blue)]">[{move.type}]</span>} {move.power !== null && <span className="text-xs text-[var(--poke-red)]">Pwr: {move.power}</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full text-center mt-2">
                <span className="inline-block bg-[var(--poke-blue)] text-white px-4 py-1 rounded-full font-bold text-sm shadow">Stat Score: {wildData.score.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-600">No wild Pokémon selected.</p>
          )}
        </div>

        {/* User Pokémon Selection */}
        <div className="poke-card p-8 rounded-3xl shadow-2xl border-4 border-[var(--poke-blue)] relative flex flex-col items-center min-h-[32rem]">
          {loadingUserPokes ? (
            <div className="text-center text-[var(--poke-blue)]">Loading your Pokémon...</div>
          ) : userPokemons.length === 0 ? (
            <div className="text-center text-[var(--poke-red)]">You have no Pokémon yet.</div>
          ) : (
            <>
              {!selectedUserPokemon && (
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                  {userPokemons.map((poke) => (
                    <div
                      key={poke.pokemon_id}
                      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105`}
                      onClick={async () => {
                        // Fetch full info for selected pokemon
                        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.pokemon_id}`);
                        if (res.ok) {
                          const data = await res.json();
                          const types = data.types.map((t: any) => t.type.name);
                          const abilities = data.abilities.map((a: any) => a.ability.name);
                          const stats = data.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat }));
                          const moveData = await Promise.all(
                            data.moves.slice(0, 10).map(async (m: any) => {
                              const res = await fetch(m.move.url);
                              if (!res.ok) return { name: m.move.name, power: null, type: '' };
                              const moveInfo = await res.json();
                              return {
                                name: moveInfo.name,
                                power: moveInfo.power,
                                type: moveInfo.type?.name || '',
                              };
                            })
                          );
                          setSelectedUserPokemon({
                            ...poke,
                            name: data.name,
                            types,
                            abilities,
                            stats,
                            moves: moveData,
                            image: data.sprites.other['official-artwork'].front_default,
                            score: calculateStatScore(stats),
                            id: data.id, // Ensure ID is included here as well
                          });
                        }
                      }}
                    >
                      <div className="w-24 h-24 rounded-full bg-[var(--poke-blue)] flex items-center justify-center shadow-lg border-4 border-white mb-2">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.pokemon_id}.png`} alt={poke.nickname} className="w-20 h-20 object-contain" />
                      </div>
                      <span className="capitalize font-semibold text-[var(--poke-blue)] text-base text-center">{poke.nickname}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedUserPokemon && (
                <>
                  <button
                    className="poke-btn mb-4 absolute top-4 right-4 z-10"
                    onClick={() => setSelectedUserPokemon(null)}
                  >
                    x
                  </button>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--poke-blue)] rounded-full p-2 shadow-lg border-4 border-white">
                    <img src={selectedUserPokemon.image} alt={selectedUserPokemon.nickname} className="w-32 h-32 object-contain" />
                  </div>
                  <h2 className="mt-28 text-2xl font-extrabold text-[var(--poke-blue)] tracking-wide uppercase mb-2 text-center">{selectedUserPokemon.nickname}</h2>
                  {selectedUserPokemon && selectedUserPokemon.types && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {selectedUserPokemon.types.map((type: string) => (
                        <span key={type} className="px-3 py-1 rounded-full bg-[var(--poke-accent)] text-[var(--poke-blue)] font-bold text-xs uppercase shadow">{type}</span>
                      ))}
                    </div>
                  )}
                  {selectedUserPokemon && selectedUserPokemon.abilities && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {selectedUserPokemon.abilities.map((ab: string) => (
                        <span key={ab} className="px-2 py-1 rounded bg-[var(--poke-blue)] text-white text-xs font-semibold shadow">{ab}</span>
                      ))}
                    </div>
                  )}
                  {selectedUserPokemon && selectedUserPokemon.stats && (
                    <div className="w-full mb-4">
                      <h3 className="font-bold text-[var(--poke-blue)] mb-1 text-center">Base Stats</h3>
                      <ul className="space-y-1">
                        {selectedUserPokemon.stats.map((stat: any) => (
                          <li key={stat.name} className="flex justify-between items-center text-[var(--poke-black)]">
                            <span className="capitalize w-24 text-white">{stat.name}</span>
                            <div className="flex-1 mx-2 bg-[var(--poke-gray)] rounded-full h-2 overflow-hidden">
                              <div className="bg-[var(--poke-blue)] h-2 rounded-full" style={{width: `${Math.min(stat.value/2,100)}%`}}></div>
                            </div>
                            <span className="font-mono w-8 text-right">{stat.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedUserPokemon && selectedUserPokemon.moves && (
                    <div className="w-full mb-2">
                      <h3 className="font-bold text-[var(--poke-blue)] mb-1 text-center">Moveset</h3>
                      <ul className="flex flex-wrap gap-2 justify-center">
                        {selectedUserPokemon.moves.map((move: any) => (
                          <li key={move.name} className="bg-[var(--poke-accent)] text-[var(--poke-blue)] px-2 py-1 rounded-full text-xs font-semibold capitalize shadow">
                            {move.name} {move.type && <span className="text-[var(--poke-blue)]">[{move.type}]</span>} {move.power !== null && <span className="text-xs text-[var(--poke-red)]">Pwr: {move.power}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedUserPokemon && (
                    <div className="w-full text-center mt-2 mb-4">
                      <span className="inline-block bg-[var(--poke-blue)] text-white px-4 py-1 rounded-full font-bold text-sm shadow">Stat Score: {selectedUserPokemon.score?.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
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