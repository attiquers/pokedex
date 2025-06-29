"use client";
import { useRouter } from "next/navigation";
import { Bangers } from 'next/font/google';
import { useState } from "react";

const bangers = Bangers({ subsets: ['latin'], weight: '400' });

const regions = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Hisui',
  'Paldea',
];

const regionRanges = {
  Kanto: [1, 151],
  Johto: [152, 251],
  Hoenn: [252, 386],
  Sinnoh: [387, 493],
  Unova: [494, 649],
  Kalos: [650, 721],
  Alola: [722, 809],
  Galar: [810, 898],
  Hisui: [899, 905],
  Paldea: [906, 1025],
};

export default function CatchPokemonPage() {
  const router = useRouter();
  const [loadingRegion, setLoadingRegion] = useState<string | null>(null);

  async function handleRegionClick(region: string) {
    setLoadingRegion(region);
    const [min, max] = regionRanges[region as keyof typeof regionRanges];
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    // Fetch the pokemon name from the API
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const data = await res.json();
    const name = data.name;
    router.push(`/region/pokemon?name=${encodeURIComponent(name)}`);
    setLoadingRegion(null);
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-[var(--poke-blue)] to-[var(--poke-accent)] py-12">
      <h1 className="text-4xl font-bold text-[var(--poke-blue)] mb-4 drop-shadow">Catch Pokémon</h1>
      <p className="text-lg text-[var(--poke-black)] mb-8">Click a region to catch a random Pokémon from that region!</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2 justify-items-center mx-auto">
        {regions.map((region) => (
          <div
            key={region}
            className={
              'flex flex-col items-center relative w-56 group cursor-default hover:cursor-pointer '
            }
            onClick={() => handleRegionClick(region)}
            style={{ opacity: loadingRegion && loadingRegion !== region ? 0.5 : 1, pointerEvents: loadingRegion && loadingRegion !== region ? 'none' : 'auto', minHeight: '12rem' }}
          >
            {/* Circle with region image and overlay */}
            <div className="w-36 h-36 rounded-full bg-[var(--poke-white)] shadow-lg flex items-center justify-center overflow-hidden border-4 border-[var(--poke-blue)] relative">
              <img src={`/regions/${region.toLowerCase()}.png`} alt={region + ' region'} className="w-full h-full object-cover relative z-10 transition-all duration-300 group-hover:scale-105" />
              {/* Dark overlay for non-hovered state */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all duration-300 z-20 pointer-events-none" />
              {loadingRegion === region && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-[var(--poke-white)]/60">
                  <span className="text-[var(--poke-blue)] font-bold animate-pulse">Catching...</span>
                </div>
              )}
            </div>
            {/* Region name, absolutely positioned at the bottom of the main div, centered with respect to image */}
            <div
              className={bangers.className + ' text-[2.2rem] text-[var(--poke-accent)] drop-shadow-sm absolute transition-all duration-300 group-hover:text-[var(--poke-yellow)] group-hover:text-[2.7rem] group-hover:drop-shadow-lg z-30'}
              style={{
                bottom: '1.4rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'max-content',
                background: 'transparent',
                pointerEvents: 'none',
                textAlign: 'center',
              }}
            >
              <span style={{
                display: 'inline-block',
                background: 'transparent',
                padding: 0,
                zIndex: 10,
                minWidth: '9rem', // matches image width (w-36)
              }}>{region}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
