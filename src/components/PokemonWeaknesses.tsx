// components/PokemonWeaknesses.tsx

interface PokemonWeaknessesProps {
  weaknesses: string[];
  typeColors: { [key: string]: string }; // Pass the color map
}

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

// Emoji mapping for types (re-defined or import from a central utility)
const typeEmojis: { [key: string]: string } = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  grass: '🌿', // Grass emoji
  electric: '⚡',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️', // Poison emoji
  ground: '⛰️',
  flying: '🦅',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  steel: '⚙️',
  dark: '🌙',
  fairy: '✨',
};

export default function PokemonWeaknesses({ weaknesses, typeColors }: PokemonWeaknessesProps) {
  return (
    <div className="bg-[#334155] rounded-xl p-6 shadow-lg border border-gray-600">
      <h3 className="text-xl font-bold text-gray-100 mb-4">Weakness</h3>
      {weaknesses.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {weaknesses.map((weaknessType) => (
            <span
              key={weaknessType}
              className={`px-5 py-2 rounded-full text-white font-semibold text-lg shadow-md flex items-center justify-center ${typeColors[weaknessType] || 'bg-gray-500'}`}
            >
              {typeEmojis[weaknessType]} <span className="ml-2">{capitalizeFirstLetter(weaknessType)}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-300">No notable weaknesses.</p>
      )}
    </div>
  );
}