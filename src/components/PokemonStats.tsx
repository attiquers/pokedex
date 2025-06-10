// components/PokemonStats.tsx

import { PokemonData } from '@/app/pokemon/[name]/page'; // Import the type

interface PokemonStatsProps {
  stats: PokemonData['stats'];
}

const statNameMap: { [key: string]: string } = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

const getStatBarColor = (value: number): string => {
  if (value >= 120) return 'bg-green-500';
  if (value >= 90) return 'bg-lime-500';
  if (value >= 60) return 'bg-yellow-500';
  if (value >= 30) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function PokemonStats({ stats }: PokemonStatsProps) {
  const maxStatValue = 255; // Max possible base stat in Pokemon

  return (
    <div className="grid grid-cols-1 gap-4">
      {stats.map((statInfo) => (
        <div key={statInfo.stat.name} className="flex items-center">
          <div className="w-24 text-gray-300 font-semibold text-sm">
            {statNameMap[statInfo.stat.name] || statInfo.stat.name.toUpperCase()}
          </div>
          <div className="w-12 text-center text-gray-200 font-bold text-sm">
            {statInfo.base_stat}
          </div>
          <div className="flex-grow bg-gray-600 rounded-full h-3.5 ml-3 relative overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${getStatBarColor(statInfo.base_stat)}`}
              style={{ width: `${(statInfo.base_stat / maxStatValue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}