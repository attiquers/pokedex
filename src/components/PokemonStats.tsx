interface Stat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

interface PokemonStatsProps {
  stats: Stat[];
}

export default function PokemonStats({ stats }: PokemonStatsProps) {
  const maxStatValue = 255; // Max possible base stat in Pokémon games

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Base Stats</h2>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.stat.name} className="flex items-center">
            <span className="w-24 text-right pr-4 font-semibold text-gray-600 capitalize">
              {stat.stat.name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def')}:
            </span>
            <div className="flex-grow bg-gray-200 rounded-full h-3.5 relative">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(stat.base_stat / maxStatValue) * 100}%` }}
              ></div>
              <span className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xs font-bold text-gray-800">
                {stat.base_stat}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}