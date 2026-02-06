import React, { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PokemonView } from "../hooks/usePokemon";
import { TypeChips } from "./TypeChips";
import { StatBar } from "./StatBar";

type PokemonCardProps = {
  pokemon: PokemonView;
  isShiny: boolean;
  motionTuning: import("../utils/motion").MotionTuning;
  comparisonInsight?: string | null;
  onFlipChange?: (isFlipped: boolean) => void;
  initialFlipped?: boolean;
  showFlipHint?: boolean;
  showShinyHint?: boolean;
};

export const PokemonCard = ({
  pokemon,
  isShiny,
  motionTuning,
  comparisonInsight,
  onFlipChange,
  initialFlipped,
  showFlipHint,
  showShinyHint,
}: PokemonCardProps) => (
  <InteractiveCard
    pokemon={pokemon}
    isShiny={isShiny}
    motionTuning={motionTuning}
    comparisonInsight={comparisonInsight}
    onFlipChange={onFlipChange}
    initialFlipped={initialFlipped}
    showFlipHint={showFlipHint}
    showShinyHint={showShinyHint}
  />
);

const InteractiveCard = ({
  pokemon,
  isShiny,
  motionTuning,
  comparisonInsight,
  onFlipChange,
  initialFlipped,
  showFlipHint,
  showShinyHint,
}: PokemonCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isFlipped, setIsFlipped] = useState(initialFlipped ?? false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothX = useSpring(rotateX, { stiffness: 120, damping: 18 });
  const smoothY = useSpring(rotateY, { stiffness: 120, damping: 18 });
  const glowX = useTransform(smoothY, [-8, 8], [30, 70]);
  const glowY = useTransform(smoothX, [-8, 8], [30, 70]);
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.6), transparent 55%)`;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
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
    setIsFlipped((prev) => {
      const next = !prev;
      onFlipChange?.(next);
      return next;
    });
  };

  React.useEffect(() => {
    setIsFlipped(initialFlipped ?? false);
  }, [initialFlipped]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
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
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{
        duration: 0.45 * motionTuning.durationMultiplier,
        delay: 0.05,
        ease: motionTuning.ease,
      }}
      style={{ rotateX: smoothX, rotateY: smoothY, transformStyle: "preserve-3d" }}
      className="focus-card relative grid gap-8 rounded-3xl border border-white/70 bg-white/90 p-8 shadow-soft transition-shadow hover:shadow-[0_30px_80px_rgba(15,23,42,0.2)] lg:grid-cols-[280px_1fr]"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background: glowBackground,
          WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 80%)",
        } as React.CSSProperties}
      />
      <motion.div
        className="relative col-span-full grid gap-8 lg:grid-cols-[280px_1fr]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6 * motionTuning.durationMultiplier,
          ease: motionTuning.ease,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex aspect-square items-center justify-center rounded-3xl bg-[color:var(--accent-soft)]" style={{ backfaceVisibility: "hidden" }}>
          <img
            src={isShiny ? pokemon.shinyArtwork : pokemon.artwork}
            alt={pokemon.displayName}
            className="h-52 w-52 object-contain"
          />
        </div>
        <div className="space-y-6" style={{ backfaceVisibility: "hidden" }}>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent)]">
              {pokemon.displayId}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              {pokemon.displayName}
            </h2>
            <TypeChips types={pokemon.types} motionTuning={motionTuning} />
          </div>
          <div className="space-y-3">
            {pokemon.stats.map((stat) => (
              <StatBar
                key={stat.label}
                {...stat}
                motionTuning={motionTuning}
                artwork={isShiny ? pokemon.shinyArtwork : pokemon.artwork}
              />
            ))}
          </div>
          {(showFlipHint || showShinyHint) && (
            <p className="text-xs text-slate-400">
              {showFlipHint ? "Tip: Tap the card to flip." : null}
              {showFlipHint && showShinyHint ? " " : null}
              {showShinyHint ? "Tip: Toggle Shiny for alternate artwork." : null}
            </p>
          )}
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
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-[color:var(--accent-soft)]">
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent)]">
                Detail Lab
              </p>
              <p className="text-sm text-slate-500">Primary Type</p>
              <p className="text-2xl font-semibold text-slate-900">{pokemon.primaryType}</p>
            </div>
          </div>
          <div className="space-y-4 p-6">
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
                    <span
                      key={move}
                      className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500"
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Tap to flip back</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
