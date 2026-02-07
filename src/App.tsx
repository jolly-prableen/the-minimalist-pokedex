import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion, AnimatePresence, useAnimation } from "framer-motion";
import { usePokemon } from "./hooks/usePokemon";
import { useUIStore } from "./store/uiStore";
import { getThemeForType } from "./utils/theme";
import { formatName } from "./utils/format";
import { buildComparisonInsight } from "./utils/compare";
import { SearchBar } from "./components/SearchBar";
import { ShinyToggle } from "./components/ShinyToggle";
import { PokemonCard } from "./components/PokemonCard";
import { SkeletonCard } from "./components/SkeletonCard";
import { ErrorNotice } from "./components/ErrorNotice";
import { AmbientOrbs } from "./components/AmbientOrbs";
import { CursorGlow } from "./components/CursorGlow";
import { getMotionTuning } from "./utils/motion";
import { StarterOrbit } from "./components/StarterOrbit.tsx";

const normalizeQuery = (value: string) => value.trim().toLowerCase();

const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [queryConfidence, setQueryConfidence] = useState<"exact" | "corrected">("exact");
  const [orbitHidden, setOrbitHidden] = useState(false);
  const [activeStarter, setActiveStarter] = useState<string | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [bagPulse, setBagPulse] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);

  const {
    isShiny,
    accent,
    accentSoft,
    setShiny,
    setAccent,
    cardState,
    setCardState,
    collection,
    markCollected,
    removeCollected,
    history,
    addHistory,
  } = useUIStore();
  const pokemonQuery = usePokemon(query);
  const previousPokemonRef = useRef<typeof pokemonQuery.data | null>(null);
  const [comparisonInsight, setComparisonInsight] = useState<string | null>(null);
  const [statTrends, setStatTrends] = useState<Record<string, "up" | "down" | "same">>({});

  const pokemon = pokemonQuery.data;
  const hasQuery = Boolean(query);
  const errorMessage = pokemonQuery.isError ? (pokemonQuery.error as Error).message : null;
  const showSkeleton = pokemonQuery.isLoading;
  const showCard = Boolean(pokemon) && !pokemonQuery.isLoading && !pokemonQuery.isError;
  const showEmptyState = !pokemon && hasQuery && pokemonQuery.isSuccess;
  const spotlightActive = showCard;
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

  const groupedCollection = useMemo(() => {
    const grouped = Object.entries(collection).reduce<Record<string, string[]>>(
      (acc, [name, meta]) => {
        const type = meta.primaryType;
        acc[type] = acc[type] ? [...acc[type], name] : [name];
        return acc;
      },
      {}
    );
    console.info("Collection groups", Object.keys(grouped));
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [collection]);

  useEffect(() => {
    if (!pokemon) return;
    const types = pokemon.types ?? [];
    const primary = types[0] ?? pokemon.primaryType ?? "normal";
    const themeType = primary === "normal" && types[1] ? types[1] : primary;
    const theme = getThemeForType(themeType);
    setAccent(theme.accent, theme.soft);
  }, [pokemon?.id, pokemon?.types, pokemon?.primaryType, setAccent]);

  useEffect(() => {
    if (!pokemon) return;
    const previous = previousPokemonRef.current;
    if (previous && previous.name !== pokemon.name) {
      setComparisonInsight(buildComparisonInsight(pokemon, previous));
      const previousStats = new Map(previous.stats.map((stat) => [stat.label, stat.value]));
      const nextTrends: Record<string, "up" | "down" | "same"> = {};
      pokemon.stats.forEach((stat) => {
        const prevValue = previousStats.get(stat.label);
        if (prevValue === undefined) return;
        if (stat.value > prevValue) nextTrends[stat.label] = "up";
        else if (stat.value < prevValue) nextTrends[stat.label] = "down";
        else nextTrends[stat.label] = "same";
      });
      setStatTrends(nextTrends);
    } else {
      setStatTrends({});
    }
    previousPokemonRef.current = pokemon;
  }, [pokemon]);

  useEffect(() => {
    if (!pokemon) return;
    addHistory(pokemon.name);
  }, [pokemon?.name, addHistory]);

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

  useEffect(() => {
    if (!query) {
      setOrbitHidden(false);
      setActiveStarter(null);
    }
  }, [query]);
  const cardFlightRef = useRef<HTMLDivElement | null>(null);
  const bagButtonRef = useRef<HTMLButtonElement | null>(null);
  const cardControls = useAnimation();

  const handleCollect = async (type?: string) => {
    if (!pokemon) return;
    if (collection[pokemon.name]) return;
    if (!type) return;
    if (isCollecting) return;
    setIsCollecting(true);
    const cardEl = cardFlightRef.current;
    const bagEl = bagButtonRef.current;
    if (!cardEl || !bagEl) {
      setIsCollecting(false);
      return;
    }
    const cardRect = cardEl.getBoundingClientRect();
    const bagRect = bagEl.getBoundingClientRect();
    const x = bagRect.left + bagRect.width / 2 - (cardRect.left + cardRect.width / 2);
    const y = bagRect.top + bagRect.height / 2 - (cardRect.top + cardRect.height / 2);

    await cardControls.start({
      scale: 1.02,
      y: -6,
      transition: { duration: 0.18, ease: "easeOut" },
    });
    await cardControls.start({
      x,
      y,
      scale: 0.94,
      opacity: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    });

    const collectedEntry = { name: pokemon.name, primaryType: type };
    console.info("Collected Pokémon", collectedEntry);
    markCollected(pokemon.name, type);
    setBagPulse((prev) => prev + 1);
    await cardControls.start({ x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: 0 } });
    setIsCollecting(false);
  };

  useEffect(() => {
    if (showCard) {
      setOrbitHidden(true);
    }
  }, [showCard]);

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

  const handleReturnHome = () => {
    setQuery("");
    setInputValue("");
    setActiveStarter(null);
    setOrbitHidden(false);
  };

  const focusTransition = {
    duration: 0.45 * motionTuning.durationMultiplier,
    ease: motionTuning.ease,
  };

  const showStarterOrbit = (!hasQuery || Boolean(activeStarter)) && !orbitHidden;

  return (
    <LayoutGroup>
      <motion.div
        className={`app-shell relative min-h-screen overflow-hidden ${
          spotlightActive ? "focus-mode" : ""
        }`}
      >
        <motion.div
          animate={{ opacity: spotlightActive ? 0.7 : 0.85 }}
          transition={focusTransition}
        >
          <CursorGlow />
        </motion.div>
        <motion.div
          animate={{ opacity: spotlightActive ? 0.78 : 0.9 }}
          transition={focusTransition}
        >
          <AmbientOrbs />
        </motion.div>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
          <motion.header
            className="focus-dim flex flex-col items-start justify-between gap-6 md:flex-row md:items-center"
            animate={{
              opacity: spotlightActive ? 0.78 : 1,
              filter: spotlightActive
                ? "saturate(0.94) brightness(0.99)"
                : "saturate(1) brightness(1)",
            }}
            transition={focusTransition}
          >
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
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {showCard && (
                  <motion.button
                    type="button"
                    onClick={handleReturnHome}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-soft transition hover:text-slate-700"
                    aria-label="Return to home"
                  >
                    ← Home
                  </motion.button>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => setCollectionOpen((prev) => !prev)}
                  className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 shadow-soft transition hover:text-slate-600"
                  aria-pressed={collectionOpen}
                  aria-label="Toggle collection"
                  ref={bagButtonRef}
                  key={bagPulse}
                  initial={{ scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 18px rgba(148,163,184,0.35)", "0 0 0 rgba(0,0,0,0)"],
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  🧳 {Object.keys(collection).length}
                </motion.button>
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
              </div>
            </div>
          </motion.header>

          <AnimatePresence>
            {collectionOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-slate-600 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    Collection Bag
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {Object.keys(collection).length} collected
                  </span>
                </div>
                {Object.keys(collection).length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No Pokémon collected yet.</p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {groupedCollection.map(([type, names]) => (
                      <div key={type} className="space-y-2">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
                          {formatName(type)}
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {names.sort().map((name) => (
                            <div
                              key={name}
                              className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 shadow-soft"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setCollectionOpen(false);
                                  setInputValue(name);
                                  setQueryConfidence("exact");
                                  setQuery(name);
                                }}
                                className="flex-1 text-left transition hover:text-slate-700"
                              >
                                {name}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCollected(name)}
                                className="ml-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:text-slate-600"
                                aria-label={`Remove ${name} from collection`}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showStarterOrbit && (
              <motion.div
                key="starter-orbit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <StarterOrbit
                  activeName={activeStarter}
                  onSelect={(name: string) => {
                    setActiveStarter(name);
                    setInputValue(name);
                    setQueryConfidence("exact");
                    setQuery(name);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="focus-dim"
            animate={{
              opacity: spotlightActive ? 0.8 : 1,
              filter: spotlightActive ? "saturate(0.95)" : "saturate(1)",
            }}
            transition={focusTransition}
          >
            <SearchBar value={inputValue} onChange={setInputValue} onSubmit={handleSubmit} />
          </motion.div>

          {history.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {history.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setInputValue(name);
                    setQueryConfidence("exact");
                    setQuery(name);
                  }}
                  className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 shadow-soft transition hover:text-slate-600"
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {statusMessage && (
            <motion.div
              className="focus-dim rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-500 shadow-soft"
              animate={{
                opacity: spotlightActive ? 0.78 : 1,
                filter: spotlightActive ? "saturate(0.95)" : "saturate(1)",
              }}
              transition={focusTransition}
            >
              {statusMessage}
            </motion.div>
          )}

          {errorMessage && <ErrorNotice message={errorMessage} />}

          {showSkeleton && <SkeletonCard motionTuning={motionTuning} />}

          {showCard && pokemon ? (
            <motion.div
              ref={cardFlightRef}
              animate={cardControls}
            >
              <PokemonCard
                pokemon={pokemon}
                isShiny={isShiny}
                motionTuning={motionTuning}
                comparisonInsight={comparisonInsight}
                comparisonTrends={statTrends}
                onFlipChange={(next) => {
                  if (pokemon) {
                    setCardState(pokemon.name, { isFlipped: next });
                  }
                }}
                initialFlipped={currentCardState?.isFlipped ?? false}
                showFlipHint={showFlipHint}
                showShinyHint={showShinyHint}
                spotlight={spotlightActive}
                isCollected={Boolean(collection[pokemon.name])}
                onCollect={handleCollect}
              />
            </motion.div>
          ) : null}

          {showEmptyState && <ErrorNotice message="No Pokémon data available." />}
        </div>
      </motion.div>
    </LayoutGroup>
  );
};

export default App;
