import type { PokemonView } from "../hooks/usePokemon";

const pickStat = (pokemon: PokemonView, label: string) =>
  pokemon.stats.find((stat) => stat.label.toLowerCase() === label.toLowerCase());

const compareStat = (current: PokemonView, previous: PokemonView, label: string) => {
  const currentStat = pickStat(current, label);
  const previousStat = pickStat(previous, label);
  if (!currentStat || !previousStat) return null;

  if (currentStat.value === previousStat.value) {
    return `${label.toLowerCase()} is the same`;
  }
  return currentStat.value > previousStat.value
    ? `${label.toLowerCase()} is higher`
    : `${label.toLowerCase()} is lower`;
};

// Generate a single, subtle comparison sentence between two Pokémon.
export const buildComparisonInsight = (current: PokemonView, previous: PokemonView) => {
  const candidates = ["Attack", "Defense", "Speed"];
  const phrases = candidates
    .map((label) => compareStat(current, previous, label))
    .filter(Boolean) as string[];

  if (!phrases.length) return null;
  const concise = phrases.slice(0, 2).join(" and ");
  return `Compared to ${previous.displayName}, ${current.displayName} ${concise}.`;
};
