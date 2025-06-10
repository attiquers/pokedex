'use client';

import { useEffect, useState } from 'react';

interface CustomSearchProps {
  onSearchResults: (results: unknown[]) => void;
}

export default function CustomSearch({ onSearchResults }: CustomSearchProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [abilities, setAbilities] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const [selectedType, setSelectedType] = useState('');
  const [selectedAbility, setSelectedAbility] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [rangeMin, setRangeMin] = useState(1);
  const [rangeMax, setRangeMax] = useState(1025);

  useEffect(() => {
    const loadDropdownData = async () => {
      const [typeRes, abilityRes, regionRes] = await Promise.all([
        fetch('https://pokeapi.co/api/v2/type'),
        fetch('https://pokeapi.co/api/v2/ability?limit=500'),
        fetch('https://pokeapi.co/api/v2/region'),
      ]);
      const typesData = await typeRes.json();
      const abilitiesData = await abilityRes.json();
      const regionsData = await regionRes.json();

      setTypes(typesData.results.map((t: unknown) => (t as any).name));
      setAbilities(abilitiesData.results.map((a: unknown) => (a as any).name));
      setRegions(regionsData.results.map((r: unknown) => (r as any).name));
    };

    loadDropdownData();
  }, []);

  const handleCustomSearch = async () => {
    let resultSet = new Set<string>();

    if (selectedType) {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
      const data = await res.json();
      data.pokemon.forEach((p: unknown) => resultSet.add((p as any).pokemon.name));
    }

    if (selectedAbility) {
      const res = await fetch(`https://pokeapi.co/api/v2/ability/${selectedAbility}`);
      const data = await res.json();
      const newSet = new Set<string>();
      data.pokemon.forEach((p: unknown) => {
        if (!selectedType || resultSet.has((p as any).pokemon.name)) {
          newSet.add((p as any).pokemon.name);
        }
      });
      resultSet = newSet;
    }

    const filtered = Array.from(resultSet);
    const details = await Promise.all(
      filtered.map((name) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then((res) => res.json())
      )
    );

    const final = details.filter((p) => p.id >= rangeMin && p.id <= rangeMax);

    if (selectedRegion) {
      const regionRanges: { [key: string]: [number, number] } = {
        kanto: [1, 151],
        johto: [152, 251],
        hoenn: [252, 386],
        sinnoh: [387, 493],
        unova: [494, 649],
        kalos: [650, 721],
        alola: [722, 809],
        galar: [810, 898],
        paldea: [899, 1025],
      };
      const [min, max] = regionRanges[selectedRegion] || [1, 1025];
      onSearchResults(final.filter((p) => p.id >= min && p.id <= max));
    } else {
      onSearchResults(final);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-white/30 to-cyan-100/40 backdrop-blur-lg border border-white/30 p-8 rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-bold text-cyan-700 mb-6 text-center drop-shadow">Custom Pokémon Search</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-cyan-800 mb-1 pl-1">Type</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="bg-white/40 border border-cyan-200 rounded px-4 py-2 focus:ring-2 focus:ring-cyan-400 outline-none transition">
            <option value="">Select Type</option>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-cyan-800 mb-1 pl-1">Ability</label>
          <select value={selectedAbility} onChange={(e) => setSelectedAbility(e.target.value)} className="bg-white/40 border border-cyan-200 rounded px-4 py-2 focus:ring-2 focus:ring-cyan-400 outline-none transition">
            <option value="">Select Ability</option>
            {abilities.map((ability) => (
              <option key={ability} value={ability}>{ability}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-cyan-800 mb-1 pl-1">Region</label>
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="bg-white/40 border border-cyan-200 rounded px-4 py-2 focus:ring-2 focus:ring-cyan-400 outline-none transition">
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-cyan-800 mb-1 pl-1">Pokédex ID Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={rangeMin}
              onChange={(e) => setRangeMin(Number(e.target.value))}
              placeholder="Min ID"
              className="w-full px-2 py-1 rounded bg-white/40 border border-cyan-200 focus:ring-2 focus:ring-cyan-400 outline-none transition"
              min={1}
              max={rangeMax}
            />
            <input
              type="number"
              value={rangeMax}
              onChange={(e) => setRangeMax(Number(e.target.value))}
              placeholder="Max ID"
              className="w-full px-2 py-1 rounded bg-white/40 border border-cyan-200 focus:ring-2 focus:ring-cyan-400 outline-none transition"
              min={rangeMin}
              max={1025}
            />
          </div>
        </div>
      </div>
      <button
        onClick={handleCustomSearch}
        className="mt-8 bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-full w-full sm:w-auto block mx-auto text-lg font-semibold shadow-lg transition transform hover:scale-105 focus:ring-2 focus:ring-cyan-400"
      >
        Apply Filters
      </button>
      <style jsx global>{`
        .sidebar-action-btn {
          /* Ensure pointer on hover for all sidebar action buttons */
        }
        select:focus {
          background-color: #1565c0 !important; /* dark blue shade */
          color: #fff;
          outline: none;
        }
      `}</style>
    </div>
  );
}
