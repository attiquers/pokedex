// components/PokemonBasicInfo.tsx

import { PokemonData } from '@/app/pokemon/[name]/page'; // Import the type

interface PokemonBasicInfoProps {
  height: number; // in meters
  weight: number; // in kilograms
  category: string;
  abilities: PokemonData['abilities'];
  maleRatio: number | null;
  femaleRatio: number | null;
  baseHappiness: number | null; // Added based on typical Pokemon info
}

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);


export default function PokemonBasicInfo({
  height,
  weight,
  category,
  abilities,
  maleRatio,
  femaleRatio,
  baseHappiness,
}: PokemonBasicInfoProps) {
  return (
    <div className="bg-[#334155] rounded-xl p-6 shadow-lg border border-gray-600">
      <h3 className="text-xl font-bold text-gray-100 mb-4">Basic Info</h3>
      <div className="grid grid-cols-2 gap-4 text-gray-300 text-lg">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-200">Height</span>
          <span>{height.toFixed(1)} m</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-200">Weight</span>
          <span>{weight.toFixed(1)} kg</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-200">Category</span>
          <span>{category} Pokémon</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-200">Ability</span>
          <span>
            {abilities.map(a => capitalizeFirstLetter(a.ability.name)).join(', ')}
          </span>
        </div>
        {maleRatio !== null && femaleRatio !== null && (
            <div className="flex flex-col col-span-2">
                <span className="font-semibold text-gray-200 mb-1">Gender</span>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8 6a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"></path></svg>
                        <span className="text-blue-400">{maleRatio.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-pink-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8 6a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"></path></svg>
                        <span className="text-pink-400">{femaleRatio.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        )}
        {baseHappiness !== null && (
             <div className="flex flex-col col-span-2">
                <span className="font-semibold text-gray-200">Base Happiness</span>
                <span>{baseHappiness}</span>
             </div>
        )}
      </div>
    </div>
  );
}