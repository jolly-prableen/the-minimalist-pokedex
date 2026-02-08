import type { PokemonResponse } from "./types";

const BASE_URL = "https://pokeapi.co/api/v2";

// API access is isolated here to keep hooks and components clean.
export const fetchPokemonByName = async (name: string): Promise<PokemonResponse> => {
  const response = await fetch(`${BASE_URL}/pokemon/${name}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No Pokémon found. Try another name.");
    }
    throw new Error("Unable to reach PokéAPI. Please try again.");
  }
  return response.json();
};
