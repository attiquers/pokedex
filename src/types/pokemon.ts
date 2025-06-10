// src/types/pokemon.ts

export interface EvolutionNode {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionNode[];
}

export interface Type {
  slot: number;
  type: { name: string; url: string };
}

interface Ability {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

interface Stat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}









// pokemnond data

interface SpriteOther {
  'official-artwork'?: { front_default: string | null; front_shiny: string | null };
  home?: { front_default: string | null; front_shiny: string | null };
  dream_world?: { front_default: string | null };
}
interface Sprites {
  front_default: string | null;
  other: SpriteOther;
}

interface Cries {
  latest: string | null;
  legacy: string | null;
}

export interface PokemonData {
  abilities: Ability[];
  base_experience: number;
  cries: Cries;
  forms: { name: string; url: string }[];
  height: number; // decimetres (1/10th of a meter)
  id: number;
  name: string;
  species: { name: string; url: string };
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  weight: number; // hectograms (1/10th of a kilogram)
}