export type PokemonStat = {
  base_stat: number;
  stat: { name: string };
};

export type PokemonType = {
  type: { name: string };
};

export type PokemonSprites = {
  front_default: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
};

export type PokemonResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  stats: PokemonStat[];
  types: PokemonType[];
  sprites: PokemonSprites;
  abilities: { ability: { name: string } }[];
  moves: { move: { name: string } }[];
};
