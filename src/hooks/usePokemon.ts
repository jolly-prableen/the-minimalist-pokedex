import { useQuery } from "@tanstack/react-query";
import { fetchPokemonByName } from "../api/pokeApi";
import type { PokemonResponse } from "../api/types";
import { formatId, formatName } from "../utils/format";
import { classifyStatBalance } from "../utils/balance";

const MAX_STAT = 200;

export type PokemonStatView = {
  label: string;
  value: number;
  percent: number;
  isHighlight: boolean;
  isStrongest: boolean;
  isWeakest: boolean;
  sequenceIndex: number;
};

export type PokemonView = {
  id: number;
  displayId: string;
  name: string;
  displayName: string;
  types: string[];
  primaryType?: string;
  artwork: string;
  shinyArtwork: string;
  stats: PokemonStatView[];
  abilities: string[];
  moves: string[];
  totalStats: number;
  balanceLabel: import("../utils/balance").StatBalance;
};

const statLabelMap: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

const toPokemonView = (data: PokemonResponse): PokemonView => {
  const official = data.sprites.other?.["official-artwork"];
  const fallback = data.sprites.front_default || "";
  const artwork = official?.front_default || fallback;
  const shinyArtwork = official?.front_shiny || fallback;
  const types = data.types.map((slot) => slot.type.name);

  const stats = data.stats.map((stat) => ({
    label: statLabelMap[stat.stat.name] ?? formatName(stat.stat.name),
    value: stat.base_stat,
    percent: Math.min(stat.base_stat / MAX_STAT, 1) * 100,
  }));
  const sortedByValue = [...stats].sort((a, b) => b.value - a.value);
  const strongestValue = sortedByValue[0]?.value ?? 0;
  const weakestValue = sortedByValue[sortedByValue.length - 1]?.value ?? 0;

  return {
    id: data.id,
    displayId: formatId(data.id),
    name: data.name,
    displayName: formatName(data.name),
    types,
    primaryType: types[0],
    artwork,
    shinyArtwork,
    stats: stats.map((stat, index, all) => {
      const sorted = [...all].sort((a, b) => b.value - a.value);
      const secondValue = sorted[1]?.value ?? sorted[0]?.value;
      const threshold = secondValue ?? stat.value;
      return {
        ...stat,
        isHighlight: stat.value >= threshold,
        isStrongest: stat.value === strongestValue,
        isWeakest: stat.value === weakestValue,
        sequenceIndex: index,
      };
    }),
    abilities: data.abilities.map((ability) => formatName(ability.ability.name)),
    moves: data.moves.slice(0, 6).map((move) => formatName(move.move.name)),
    totalStats: data.stats.reduce((sum, stat) => sum + stat.base_stat, 0),
    balanceLabel: classifyStatBalance(stats),
  };
};

// Data-fetching hook uses React Query and maps API data to a view model.
export const usePokemon = (name: string) =>
  useQuery({
    queryKey: ["pokemon", name],
    queryFn: () => fetchPokemonByName(name),
    enabled: Boolean(name),
    select: toPokemonView,
  });
