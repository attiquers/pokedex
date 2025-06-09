interface Type {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonTypesProps {
  types: Type[];
}

// Function to get a distinct color for each type
const getTypeColor = (typeName: string): string => {
  const colors: { [key: string]: string } = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    grass: 'bg-green-500',
    electric: 'bg-yellow-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-600',
    ground: 'bg-yellow-700',
    flying: 'bg-blue-300',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-800',
    ghost: 'bg-indigo-700',
    dragon: 'bg-purple-700',
    steel: 'bg-gray-500',
    dark: 'bg-gray-800',
    fairy: 'bg-pink-300',
  };
  return colors[typeName.toLowerCase()] || 'bg-gray-500'; // Default gray
};

export default function PokemonTypes({ types }: PokemonTypesProps) {
  if (!types || types.length === 0) return null;

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Type</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {types.map((typeInfo) => (
          <span
            key={typeInfo.type.name}
            className={`px-6 py-2 rounded-full text-white text-xl font-bold shadow-md capitalize ${getTypeColor(typeInfo.type.name)}`}
          >
            {typeInfo.type.name}
          </span>
        ))}
      </div>
    </div>
  );
}