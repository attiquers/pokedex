interface Ability {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

interface PokemonBasicInfoProps {
  height: number;
  weight: number;
  category: string;
  abilities: Ability[];
  maleRatio: number | null;
  femaleRatio: number | null;
}

export default function PokemonBasicInfo({
  height,
  weight,
  category,
  abilities,
  maleRatio,
  femaleRatio,
}: PokemonBasicInfoProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Basic Information</h2>
      <div className="grid grid-cols-2 gap-4 text-lg">
        <div>
          <span className="font-semibold text-gray-700">Height:</span> {height / 10} m
        </div>
        <div>
          <span className="font-semibold text-gray-700">Category:</span> {category}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Weight:</span> {weight / 10} kg
        </div>
        <div>
          <span className="font-semibold text-gray-700">Abilities:</span>
          <div className="flex flex-wrap gap-x-2">
            {abilities.map((ab, index) => (
              <span key={ab.ability.name} className="capitalize">
                {ab.ability.name}
                {ab.is_hidden && <span className="text-sm text-gray-500">(H)</span>}
                {index < abilities.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
        {maleRatio !== null && femaleRatio !== null && (
            <div className="col-span-2">
            <span className="font-semibold text-gray-700">Gender: </span>
                {maleRatio > 0 && (
                    <span className="text-blue-500 font-bold mr-2">♂ {maleRatio}%</span>
                )}
                {femaleRatio > 0 && (
                    <span className="text-pink-500 font-bold">♀ {femaleRatio}%</span>
                )}
            </div>
        )}
        {maleRatio === 0 && femaleRatio === 0 && (
          <div className="col-span-2">
            <span className="font-semibold text-gray-700">Gender:</span> Genderless
          </div>
        )}
      </div>
    </div>
  );
}