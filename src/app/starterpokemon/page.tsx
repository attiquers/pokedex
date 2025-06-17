"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STARTERS = [
  { id: 1, name: "bulbasaur", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" },
  { id: 4, name: "charmander", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" },
  { id: 7, name: "squirtle", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" },
];

export default function StarterPokemonPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
  }, []);

  function handleChooseStarter(pokemon: any) {
    setSelected(pokemon);
    setNickname(pokemon.name);
  }

  async function handleNicknameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selected) return;
    setSubmitting(true);
    const { error } = await supabase.from("user_pokemons").insert({
      user_id: user.id,
      pokemon_id: selected.id,
      nickname: nickname.trim() ? nickname.trim() : selected.name,
    });
    setSubmitting(false);
    if (error) {
      setError("Failed to add starter. Please try again.");
    } else {
      router.push("/mypokemons");
    }
  }

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Choose Your Starter Pokémon</h1>
      <div className="flex gap-8">
        {STARTERS.map((poke) => (
          <div
            key={poke.id}
            className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition cursor-pointer border-2 ${selected?.id === poke.id ? 'scale-105 border-green-500 z-10' : 'border-transparent hover:border-green-400 hover:scale-105'}`}
            onClick={() => handleChooseStarter(poke)}
            style={{ position: selected?.id === poke.id ? 'relative' : undefined }}
          >
            <img src={poke.image} alt={poke.name} className="w-32 h-32 mb-2" />
            <span className="capitalize font-semibold text-lg text-black">{poke.name}</span>
            {selected?.id === poke.id && (
              <form onSubmit={handleNicknameSubmit} className="mt-6 flex flex-col items-center gap-2 w-full">
                <label className="font-semibold text-base mb-1 text-black">Nickname your {selected.name}:</label>
                <input
                  className="border rounded px-4 py-2 text-lg w-full text-black"
                  placeholder="Nickname (optional)"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-8 py-2 rounded font-bold hover:bg-green-700 mt-2 w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Choose Starter'}
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
