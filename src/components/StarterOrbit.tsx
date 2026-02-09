import React, { useEffect, useMemo, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

const starters = [
  {
    name: "bulbasaur",
    label: "Bulbasaur",
    type: "grass",
    artwork:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
  },
  {
    name: "charmander",
    label: "Charmander",
    type: "fire",
    artwork:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
  },
  {
    name: "squirtle",
    label: "Squirtle",
    type: "water",
    artwork:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
  },
  {
    name: "pikachu",
    label: "Pikachu",
    type: "electric",
    artwork:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  },
  {
    name: "eevee",
    label: "Eevee",
    type: "normal",
    artwork:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
  },
  {
    name: "jigglypuff",
    label: "Jigglypuff",
    type: "fairy",
    artwork:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
  },
];

type StarterOrbitProps = {
  activeName: string | null;
  onSelect: (name: string) => void;
  onHoverType?: (type: string | null) => void;
};

export const StarterOrbit = ({ activeName, onSelect, onHoverType }: StarterOrbitProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [canParallax, setCanParallax] = useState(false);
  const isPaused = prefersReducedMotion || Boolean(hovered) || Boolean(activeName);
  const selected = activeName ?? "";
  const rotation = useMotionValue(0);
  const rotationDeg = useTransform(rotation, (value) => `${value}deg`);
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const smoothParallaxX = useSpring(parallaxX, { stiffness: 80, damping: 22, mass: 0.2 });
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 80, damping: 22, mass: 0.2 });

  useEffect(() => {
    if (prefersReducedMotion) {
      setCanParallax(false);
      return;
    }
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handleChange = () => setCanParallax(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [prefersReducedMotion]);

  useAnimationFrame((_, delta) => {
    if (isPaused) return;
    const next = (rotation.get() + delta * 0.008) % 360;
    rotation.set(next);
  });

  const items = useMemo(
    () =>
      starters.map((starter, index) => ({
        ...starter,
        angle: (360 / starters.length) * index,
      })),
    []
  );

  return (
    <div
      className="starter-orbit"
      onPointerMove={(event) => {
        if (!canParallax) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        parallaxX.set(Math.max(-1, Math.min(1, x)) * 6);
        parallaxY.set(Math.max(-1, Math.min(1, y)) * 6);
      }}
      onPointerLeave={() => {
        parallaxX.set(0);
        parallaxY.set(0);
      }}
    >
      <motion.div
        className="starter-orbit__ring"
        style={{ rotateY: rotationDeg }}
        animate={{ opacity: activeName ? 0 : 1 }}
        transition={{ duration: prefersReducedMotion ? 0.25 : 0.6, ease: "easeOut" }}
      >
        {items.map((starter) => (
          <StarterCard
            key={starter.name}
            starter={starter}
            rotation={rotation}
            parallaxX={smoothParallaxX}
            parallaxY={smoothParallaxY}
            isHovered={hovered === starter.name}
            isMuted={hovered ? hovered !== starter.name : false}
            isActive={starter.name === selected}
            onHover={(next) => setHovered(next ? starter.name : null)}
            onSelect={() => onSelect(starter.name)}
          />
        ))}
      </motion.div>

      {activeName ? (
        <motion.div
          className="starter-orbit__selected"
          initial={{ opacity: 0.9, scale: 1, y: 6 }}
          animate={{ opacity: 1, scale: 1.08, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.25 : 0.55, ease: "easeInOut" }}
        >
          <motion.img
            layoutId={`starter-${activeName}`}
            src={starters.find((item) => item.name === activeName)?.artwork ?? ""}
            alt={starters.find((item) => item.name === activeName)?.label ?? "Selected"}
            className="starter-orbit__image"
            transition={{ duration: prefersReducedMotion ? 0.25 : 0.55, ease: "easeInOut" }}
          />
        </motion.div>
      ) : null}
    </div>
  );
};

type StarterCardProps = {
  starter: { name: string; label: string; type: string; artwork: string; angle: number };
  rotation: MotionValue<number>;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
  isHovered: boolean;
  isMuted: boolean;
  isActive: boolean;
  onHover: (value: boolean) => void;
  onSelect: () => void;
  onHoverType?: (type: string | null) => void;
};

const StarterCard = ({
  starter,
  rotation,
  parallaxX,
  parallaxY,
  isHovered,
  isMuted,
  isActive,
  onHover,
  onSelect,
  onHoverType,
}: StarterCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const radius = 260;
  const hoverBoost = 40;
  const rotateY = starter.angle;
  const depth = useTransform(rotation, (value) => {
    const total = ((value + rotateY) % 360) * (Math.PI / 180);
    return Math.cos(total);
  });
  const faceScale = useTransform(depth, (value) => 0.9 + (value + 1) * 0.05 + (isHovered ? 0.05 : 0));
  const faceOpacity = useTransform(depth, (value) => {
    const base = 0.4 + (value + 1) * 0.3;
    return Math.min(1, base + (isHovered ? 0.3 : 0));
  });
  const faceSaturation = useTransform(depth, (value) => 0.65 + (value + 1) * 0.15 + (isHovered ? 0.2 : 0));
  const faceBrightness = useTransform(depth, (value) => 0.9 + (value + 1) * 0.05 + (isHovered ? 0.08 : 0));
  const faceFilter = useMotionTemplate`saturate(${faceSaturation}) brightness(${faceBrightness})`;

  return (
    <motion.button
      type="button"
      className={`starter-orbit__card ${isMuted ? "starter-orbit__card--muted" : ""} ${
        isActive ? "starter-orbit__card--active" : ""
      }`}
      style={{
        transform: `rotateY(${rotateY}deg) translateZ(${radius + (isHovered ? hoverBoost : 0)}px)`,
      }}
      onMouseEnter={() => {
        onHover(true);
        onHoverType?.(starter.type);
      }}
      onMouseLeave={() => {
        onHover(false);
        onHoverType?.(null);
      }}
      onFocus={() => {
        onHover(true);
        onHoverType?.(starter.type);
      }}
      onBlur={() => {
        onHover(false);
        onHoverType?.(null);
      }}
      onClick={onSelect}
      aria-label={`Select ${starter.label}`}
    >
      <motion.div
        className="starter-orbit__card-face"
        style={{
          scale: faceScale,
          opacity: faceOpacity,
          filter: faceFilter,
          x: parallaxX,
          y: parallaxY,
        }}
        animate={
          prefersReducedMotion
            ? { rotateZ: 0, scale: 1 }
            : {
                rotateZ: isHovered ? 0 : [-1.5, 1.5, -1.5],
                scale: isHovered ? 1.03 : 1,
              }
        }
        transition={{ duration: prefersReducedMotion ? 0.2 : 12, ease: "easeInOut", repeat: prefersReducedMotion ? 0 : Infinity }}
      >
        <motion.img
          layoutId={`starter-${starter.name}`}
          src={starter.artwork}
          alt={starter.label}
          className="starter-orbit__card-image"
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <span className="starter-orbit__card-label">{starter.label}</span>
      </motion.div>
    </motion.button>
  );
};
