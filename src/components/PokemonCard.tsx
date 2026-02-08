import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { MotionStyle } from "framer-motion";
import type { PokemonView } from "../hooks/usePokemon";
import { TypeChips } from "./TypeChips";
import { StatBar } from "./StatBar";
import { useUIStore } from "../store/uiStore";
import { getThemeForType } from "../utils/theme";
import { formatName } from "../utils/format";

type PokemonCardProps = {
  pokemon: PokemonView;
  isShiny: boolean;
  motionTuning: import("../utils/motion").MotionTuning;
  comparisonInsight?: string | null;
  comparisonTrends?: Record<string, "up" | "down" | "same">;
  isLoading?: boolean;
  onFlipChange?: (isFlipped: boolean) => void;
  initialFlipped?: boolean;
  showFlipHint?: boolean;
  showShinyHint?: boolean;
  spotlight?: boolean;
  isCollected?: boolean;
  onCollect?: (type: string) => void;
  openSource?: "search" | "starter" | "collection" | "favorites" | null;
};

export const PokemonCard = ({
  pokemon,
  isShiny,
  motionTuning,
  comparisonInsight,
  comparisonTrends,
  isLoading,
  onFlipChange,
  initialFlipped,
  showFlipHint,
  showShinyHint,
  spotlight,
  isCollected,
  onCollect,
  openSource,
}: PokemonCardProps) => (
  <InteractiveCard
    pokemon={pokemon}
    isShiny={isShiny}
    motionTuning={motionTuning}
    comparisonInsight={comparisonInsight}
    comparisonTrends={comparisonTrends}
    isLoading={isLoading}
    onFlipChange={onFlipChange}
    initialFlipped={initialFlipped}
    showFlipHint={showFlipHint}
    showShinyHint={showShinyHint}
    spotlight={spotlight}
    isCollected={isCollected}
    onCollect={onCollect}
    openSource={openSource}
  />
);

const InteractiveCard = ({
  pokemon,
  isShiny,
  motionTuning,
  comparisonInsight,
  comparisonTrends,
  isLoading,
  onFlipChange,
  initialFlipped,
  showFlipHint,
  showShinyHint,
  spotlight,
  isCollected,
  onCollect,
  openSource,
}: PokemonCardProps) => {
  const prefersReducedMotion = useReducedMotion();
    const entryMotion = React.useMemo(() => {
      switch (openSource) {
        case "starter":
          return { initial: { opacity: 0, y: 18, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 } };
        case "collection":
          return { initial: { opacity: 0, y: 10, scale: 0.99 }, animate: { opacity: 1, y: 0, scale: 1 } };
        case "favorites":
          return { initial: { opacity: 0, y: 8, scale: 0.99 }, animate: { opacity: 1, y: 0, scale: 1 } };
        case "search":
        default:
          return { initial: { opacity: 0, y: 12, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 } };
      }
    }, [openSource]);

    const sourceLabel = React.useMemo(() => {
      switch (openSource) {
        case "starter":
          return "Starter";
        case "collection":
          return "Collection";
        case "favorites":
          return "Favorite";
        case "search":
          return "Search";
        default:
          return null;
      }
    }, [openSource]);
  const { favorites, toggleFavorite } = useUIStore();
  const isFavorite = Boolean(favorites[pokemon.name]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isFlipped, setIsFlipped] = useState(initialFlipped ?? false);
  const [isMovePreview, setIsMovePreview] = useState(false);
  const [selectedMove, setSelectedMove] = useState<{ name: string; label: string } | null>(null);
  const [moveDetails, setMoveDetails] = useState<{ type?: string; category?: string } | null>(null);
  const [moveTypes, setMoveTypes] = useState<Record<string, string | undefined>>({});
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: prefersReducedMotion ? 90 : 120, damping: 18 });
  const smoothY = useSpring(rotateY, { stiffness: prefersReducedMotion ? 90 : 120, damping: 18 });
  const glowX = useTransform(smoothY, [-8, 8], [30, 70]);
  const glowY = useTransform(smoothX, [-8, 8], [30, 70]);
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.6), transparent 55%)`;
  const glowStyle: MotionStyle = {
    background: glowBackground,
    WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 80%)",
  };

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    rotateX.set(((y - midY) / midY) * -6);
    rotateY.set(((x - midX) / midX) * 6);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const toggleFlip = () => {
    if (isMovePreview) {
      setIsMovePreview(false);
      return;
    }
    setIsFlipped((prev) => {
      const next = !prev;
      onFlipChange?.(next);
      return next;
    });
  };

  React.useEffect(() => {
    setIsFlipped(initialFlipped ?? false);
  }, [initialFlipped]);

  useEffect(() => {
    if (!selectedMove) {
      setMoveDetails(null);
      return;
    }
    const controller = new AbortController();
    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/move/${selectedMove.name}`,
          { signal: controller.signal }
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          type?: { name?: string };
          damage_class?: { name?: string };
        };
        setMoveDetails({
          type: data.type?.name,
          category: data.damage_class?.name,
        });
      } catch {
        if (!controller.signal.aborted) {
          setMoveDetails(null);
        }
      }
    };
    fetchDetails();
    return () => controller.abort();
  }, [selectedMove]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    setMoveTypes({});

    const fetchMoveTypes = async () => {
      const entries = await Promise.all(
        pokemon.moves.map(async (move) => {
          try {
            const response = await fetch(
              `https://pokeapi.co/api/v2/move/${move.name}`,
              { signal: controller.signal }
            );
            if (!response.ok) return [move.name, undefined] as const;
            const data = (await response.json()) as { type?: { name?: string } };
            return [move.name, data.type?.name] as const;
          } catch {
            return [move.name, undefined] as const;
          }
        })
      );

      if (!isActive) return;
      setMoveTypes(
        entries.reduce<Record<string, string | undefined>>((acc, [name, type]) => {
          acc[name] = type;
          return acc;
        }, {})
      );
    };

    fetchMoveTypes();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [pokemon.moves]);

  const moveMotion = React.useMemo(() => {
    if (prefersReducedMotion) {
      return { y: [0, -2, 0], scale: [1, 1.01, 1] };
    }
    const name = selectedMove?.name ?? "idle";
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = (hash + name.charCodeAt(i) * (i + 3)) % 7;
    }
    switch (hash) {
      case 0:
        return { y: [0, -6, 0], scale: [1, 1.02, 1] };
      case 1:
        return { y: [0, -4, 0], rotate: [0, -1.5, 0], scale: [1, 1.01, 1] };
      case 2:
        return { x: [0, 4, 0], scale: [1, 1.015, 1] };
      case 3:
        return { y: [0, 3, 0], rotate: [0, 1.5, 0] };
      case 4:
        return { scale: [1, 1.03, 1], rotate: [0, 0.8, 0] };
      case 5:
        return { y: [0, -5, 0], rotate: [0, 0.6, 0] };
      default:
        return { y: [0, -6, 0], scale: [1, 1.02, 1] };
    }
  }, [prefersReducedMotion, selectedMove?.name]);

  const statHints = React.useMemo(() => {
    const statMap = pokemon.stats.reduce<Record<string, number>>((acc, stat) => {
      acc[stat.label.toLowerCase()] = stat.value;
      return acc;
    }, {});

    const attack = statMap["attack"] ?? 0;
    const specialAttack = statMap["sp. attack"] ?? 0;
    const defense = statMap["defense"] ?? 0;
    const specialDefense = statMap["sp. defense"] ?? 0;
    const speed = statMap["speed"] ?? 0;
    const hp = statMap["hp"] ?? 0;
    const offense = (attack + specialAttack) / 2;
    const bulk = (defense + specialDefense) / 2;
    const top = Math.max(offense, bulk, speed, hp);

    const hints: string[] = [];

    if (offense >= 110 && bulk <= 75) {
      hints.push("Glass cannon");
    } else {
      if (offense >= 110 || (offense === top && offense >= 95)) hints.push("Offensive");
      if (bulk >= 110 || (bulk === top && bulk >= 90)) hints.push("Defensive");
    }

    if (speed >= 110 || (speed === top && speed >= 95)) hints.push("Fast");
    if (hp >= 120 && bulk >= 90) hints.push("Sturdy");

    if (hints.length === 0) hints.push("Balanced");

    return Array.from(new Set(hints)).slice(0, 2);
  }, [pokemon.stats]);

  const sortedStats = [...pokemon.stats].sort((a, b) => b.value - a.value);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!isCollected && onCollect && pokemon.types[0]) {
        onCollect(pokemon.types[0]);
      } else {
        toggleFlip();
      }
    }
    if (event.key === " ") {
      event.preventDefault();
      toggleFlip();
    }
  };

  return (
    <motion.section
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      onClick={toggleFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      initial={entryMotion.initial}
      animate={{
        ...entryMotion.animate,
        scale: spotlight ? 1.015 : entryMotion.animate.scale,
        boxShadow: spotlight
          ? "0 36px 95px rgba(15, 23, 42, 0.22)"
          : "0 24px 60px rgba(15, 23, 42, 0.14)",
      }}
      whileHover={prefersReducedMotion ? { y: -1 } : { y: -4 }}
      transition={{
        duration: 0.35 * motionTuning.durationMultiplier,
        delay: 0.05,
        ease: motionTuning.ease,
      }}
      style={{ rotateX: smoothX, rotateY: smoothY, transformStyle: "preserve-3d" }}
      className="focus-card relative grid gap-8 rounded-3xl border border-white/70 bg-white/90 p-8 shadow-soft transition-shadow hover:shadow-[0_30px_80px_rgba(15,23,42,0.2)] lg:grid-cols-[280px_1fr]"
    >
      <div className="absolute right-5 top-5 z-30 flex flex-col items-end gap-2">
        <motion.button
          type="button"
          className={`rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] shadow-soft transition ${
            isLoading
              ? "cursor-not-allowed text-slate-300"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            if (!isFavorite && !isLoading) {
              toggleFavorite(pokemon.name);
            }
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Favorited" : "Add to favorites"}
          disabled={isFavorite || Boolean(isLoading)}
          animate={
            isFavorite
              ? { scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {isFavorite ? "★ Favorite" : "☆ Favorite"}
        </motion.button>
        <motion.button
          type="button"
          className={`rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] shadow-soft transition ${
            isCollected || isLoading
              ? "cursor-not-allowed text-slate-300"
              : "text-slate-400 hover:text-slate-600"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            if (!isLoading) {
              onCollect?.(pokemon.types[0]);
            }
          }}
          aria-pressed={Boolean(isCollected)}
          aria-label={isCollected ? "Collected" : "Add to collection"}
          disabled={Boolean(isCollected) || Boolean(isLoading)}
          animate={
            isCollected
              ? { scale: [1, 1.04, 1], opacity: [1, 0.9, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {isCollected ? "✓ Collect" : "＋ Collect"}
        </motion.button>
      </div>
      <motion.div
        aria-hidden="true"
        className="card-aura pointer-events-none"
        initial={{ opacity: 0.5, scale: 0.98 }}
        animate={{ opacity: [0.45, 0.6, 0.45], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl z-10"
        style={glowStyle}
      />
      <motion.div
        className="relative col-span-full grid gap-8 lg:grid-cols-[280px_1fr] z-20"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6 * motionTuning.durationMultiplier,
          ease: motionTuning.ease,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex aspect-square items-center justify-center rounded-3xl bg-[color:var(--accent-soft)] lg:self-center" style={{ backfaceVisibility: "hidden" }}>
          <motion.img
            layoutId={`starter-${pokemon.name}`}
            src={isShiny ? pokemon.shinyArtwork : pokemon.artwork}
            alt={pokemon.displayName}
            className="h-52 w-52 object-contain"
            initial={{ y: 8, scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              repeat: 0,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="space-y-6" style={{ backfaceVisibility: "hidden" }}>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent)]">
              {pokemon.displayId}
            </p>
            {sourceLabel ? (
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-slate-400">
                {sourceLabel}
              </p>
            ) : null}
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              {pokemon.displayName}
            </h2>
            <TypeChips types={pokemon.types} motionTuning={motionTuning} />
          </div>
          <motion.div
            className="space-y-3"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {sortedStats.map((stat, index) => (
              <StatBar
                key={stat.label}
                {...stat}
                trend={comparisonTrends?.[stat.label]}
                sequenceIndex={index}
                motionTuning={motionTuning}
                artwork={isShiny ? pokemon.shinyArtwork : pokemon.artwork}
              />
            ))}
          </motion.div>
          {(showFlipHint || showShinyHint) && (
            <p className="text-xs text-slate-400">
              {showFlipHint ? "Tip: Tap the card to flip." : null}
              {showFlipHint && showShinyHint ? " " : null}
              {showShinyHint ? "Tip: Toggle Shiny for alternate artwork." : null}
            </p>
          )}
          {statHints.length ? (
            <p className="text-xs text-slate-400">{statHints.join(" · ")}</p>
          ) : null}
          <p className="text-xs text-slate-500">Balance: {pokemon.balanceLabel}</p>
          {comparisonInsight ? (
            <p className="text-xs text-slate-500">{comparisonInsight}</p>
          ) : null}
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Tap to flip</p>
        </div>

        <div
          className="absolute inset-0 grid gap-8 lg:grid-cols-[280px_1fr] rounded-3xl bg-white/90 p-0"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <motion.div
            className="absolute inset-0 grid gap-8 lg:grid-cols-[280px_1fr] rounded-3xl bg-white/90 p-0"
            animate={{ rotateY: isMovePreview ? 180 : 0 }}
            transition={{ duration: 0.5 * motionTuning.durationMultiplier, ease: motionTuning.ease }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-[color:var(--accent-soft)] lg:self-center lg:ml-2" style={{ backfaceVisibility: "hidden" }}>
              <div className="space-y-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent)]">
                  Detail Lab
                </p>
                <p className="text-sm text-slate-500">Primary Type</p>
                <p className="text-2xl font-semibold text-slate-900">{pokemon.primaryType}</p>
              </div>
            </div>
            <div className="space-y-4 p-6" style={{ backfaceVisibility: "hidden" }}>
              <h3 className="text-lg font-semibold text-slate-900">Base Stat Summary</h3>
              <p className="text-sm text-slate-500">Total stats: {pokemon.totalStats}</p>
              <div className="space-y-2">
                {pokemon.stats.slice(0, 3).map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between text-sm text-slate-600">
                    <span>{stat.label}</span>
                    <span className="font-semibold text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35 * (motionTuning.fadeMultiplier ?? 1),
                  delay: 0.18,
                  ease: motionTuning.ease,
                }}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Abilities</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability}
                        className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Signature Moves</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pokemon.moves.map((move) => (
                      <button
                        key={move.name}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedMove(move);
                          setIsMovePreview(true);
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          moveTypes[move.name] === pokemon.primaryType
                            ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)] hover:text-[color:var(--accent)]"
                            : moveTypes[move.name]
                              ? "bg-white/70 text-slate-400 hover:text-slate-600"
                              : "bg-white/80 text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {move.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Tap to flip back</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 grid gap-8 lg:grid-cols-[280px_1fr] rounded-3xl bg-white/90 p-0"
            animate={{ rotateY: isMovePreview ? 0 : 180 }}
            transition={{ duration: 0.5 * motionTuning.durationMultiplier, ease: motionTuning.ease }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-[color:var(--accent-soft)] lg:self-center lg:ml-2" style={{ backfaceVisibility: "hidden" }}>
              <motion.img
                key={selectedMove?.name ?? "idle"}
                src={isShiny ? pokemon.shinyArtwork : pokemon.artwork}
                alt={pokemon.displayName}
                className="h-44 w-44 object-contain"
                initial={{ y: 8, scale: 1 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ duration: 0.6, repeat: 0, ease: "easeInOut" }}
              />
            </div>
            <div
              className="space-y-4 p-6"
              style={{
                backfaceVisibility: "hidden",
                background: `linear-gradient(180deg, ${
                  getThemeForType(moveDetails?.type ?? pokemon.primaryType).soft
                }, rgba(255,255,255,0))`,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent)]">
                Move Preview
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                {selectedMove ? selectedMove.label : "Select a move"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {moveDetails?.type ? (
                  <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                    {formatName(moveDetails.type)}
                  </span>
                ) : null}
                {moveDetails?.category ? (
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                    {formatName(moveDetails.category)}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsMovePreview(false);
                }}
                className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 transition hover:text-slate-600"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};
