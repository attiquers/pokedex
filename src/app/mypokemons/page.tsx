"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyPokemonsPage() {
  const [user, setUser] = useState<any>(null);
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    async function fetchPokemons() {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_pokemons")
        .select("pokemon_id, nickname")
        .eq("user_id", user.id);
      setPokemons(data || []);
      setLoading(false);
    }
    fetchPokemons();
  }, [user]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gradient-to-br from-blue-100 to-green-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">My Pokémon</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pokemons.map((poke) => (
          <div key={poke.pokemon_id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.pokemon_id}.png`} alt={poke.nickname} className="w-32 h-32 mb-2" />
            <span className="capitalize font-semibold text-lg">{poke.nickname}</span>
          </div>
        ))}
      </div>
      {pokemons.length === 0 && <div className="mt-8 text-gray-600">You have no Pokémon yet.</div>}
    </div>
  );
}
