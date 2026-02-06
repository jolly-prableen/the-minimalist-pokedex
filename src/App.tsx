import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePokemon } from "./hooks/usePokemon";
import { useUIStore } from "./store/uiStore";
import { getThemeForType } from "./utils/theme";
import { buildComparisonInsight } from "./utils/compare";
import { SearchBar } from "./components/SearchBar";
import { ShinyToggle } from "./components/ShinyToggle";
import { PokemonCard } from "./components/PokemonCard";
import { SkeletonCard } from "./components/SkeletonCard";
import { ErrorNotice } from "./components/ErrorNotice";
import { AmbientOrbs } from "./components/AmbientOrbs";
import { CursorGlow } from "./components/CursorGlow";
import { getMotionTuning } from "./utils/motion";

const normalizeQuery = (value: string) => value.trim().toLowerCase();

const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [queryConfidence, setQueryConfidence] = useState<"exact" | "corrected">("exact");

  const { isShiny, accent, accentSoft, setShiny, setAccent, cardState, setCardState } = useUIStore();
  const pokemonQuery = usePokemon(query);
  const previousPokemonRef = useRef<typeof pokemonQuery.data | null>(null);
  const [comparisonInsight, setComparisonInsight] = useState<string | null>(null);

  const pokemon = pokemonQuery.data;
  const hasQuery = Boolean(query);
  const errorMessage = pokemonQuery.isError ? (pokemonQuery.error as Error).message : null;
  const showSkeleton = pokemonQuery.isLoading;
  const showCard = Boolean(pokemon) && !pokemonQuery.isLoading && !pokemonQuery.isError;
  const showEmptyState = !pokemon && hasQuery && pokemonQuery.isSuccess;
  const baseMotionTuning = getMotionTuning(pokemon?.primaryType);
  const motionTuning = {
    ...baseMotionTuning,
    durationMultiplier:
      baseMotionTuning.durationMultiplier * (queryConfidence === "exact" ? 0.98 : 1.05),
  };
  const currentCardState = pokemon ? cardState[pokemon.name] : undefined;
  const showFlipHint = showCard && !currentCardState?.isFlipped;
  const showShinyHint = showCard && !currentCardState?.hasUsedShiny;

  const statusMessage = useMemo(() => {
    if (!hasQuery) {
      return "Search for a Pokémon to reveal its product card.";
    }
    if (pokemonQuery.isLoading) {
      return "Fetching premium data from PokéAPI…";
    }
    return null;
  }, [hasQuery, pokemonQuery.isLoading]);

  useEffect(() => {
    if (pokemon?.primaryType) {
      const theme = getThemeForType(pokemon.primaryType);
      setAccent(theme.accent, theme.soft);
    }
  }, [pokemon?.primaryType, setAccent]);

  useEffect(() => {
    if (!pokemon) return;
    const previous = previousPokemonRef.current;
    if (previous && previous.name !== pokemon.name) {
      setComparisonInsight(buildComparisonInsight(pokemon, previous));
    }
    previousPokemonRef.current = pokemon;
  }, [pokemon]);

  useEffect(() => {
    if (!pokemon) return;
    const stored = cardState[pokemon.name];
    setShiny(stored?.isShiny ?? false);
  }, [pokemon, cardState, setShiny]);

  useEffect(() => {
    // Keep CSS variables synced with the UI state.
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-soft", accentSoft);
  }, [accent, accentSoft]);

  const handleSubmit = () => {
    const raw = inputValue.trim().toLowerCase();
    const normalized = normalizeQuery(inputValue);
    if (!normalized) {
      setQuery("");
      return;
    }
    setQueryConfidence(raw === normalized ? "exact" : "corrected");
    setQuery(normalized);
  };

  return (
    <div
      className={`app-shell relative min-h-screen overflow-hidden ${
        showCard ? "focus-mode" : ""
      }`}
    >
      <CursorGlow />
      <AmbientOrbs />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="focus-dim flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent)]">
              The Minimalist Pokédex
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Premium Pokémon Search
            </h1>
            <p className="text-sm text-slate-500">
              Apple-inspired clarity with fluid, data-driven interactions.
            </p>
          </div>
          <div className="glass flex items-center gap-4 rounded-full border border-white/70 px-5 py-3 shadow-soft">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Studio Mode
            </span>
            <ShinyToggle
              checked={isShiny}
              onChange={(value) => {
                setShiny(value);
                if (pokemon) {
                  setCardState(pokemon.name, { isShiny: value, hasUsedShiny: true });
                }
              }}
            />
          </div>
        </header>

        <div className="focus-dim">
          <SearchBar value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
        </div>

        {statusMessage && (
          <div className="focus-dim rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-500 shadow-soft">
            {statusMessage}
          </div>
        )}

        {errorMessage && <ErrorNotice message={errorMessage} />}

        {showSkeleton && <SkeletonCard motionTuning={motionTuning} />}

        {showCard && pokemon ? (
          <PokemonCard
            pokemon={pokemon}
            isShiny={isShiny}
            motionTuning={motionTuning}
            comparisonInsight={comparisonInsight}
            onFlipChange={(next) => {
              if (pokemon) {
                setCardState(pokemon.name, { isFlipped: next });
              }
            }}
            initialFlipped={currentCardState?.isFlipped ?? false}
            showFlipHint={showFlipHint}
            showShinyHint={showShinyHint}
          />
        ) : null}

        {showEmptyState && <ErrorNotice message="No Pokémon data available." />}
      </div>
    </div>
  );
};

export default App;
