export type MotionTuning = {
  durationMultiplier: number;
  fadeMultiplier: number;
  ease: "easeOut" | "easeInOut" | [number, number, number, number];
};

const defaultTuning: MotionTuning = {
  durationMultiplier: 1,
  fadeMultiplier: 1,
  ease: "easeOut",
};

// Subtle motion tuning based on Pokémon primary type.
export const getMotionTuning = (type?: string): MotionTuning => {
  if (!type) return defaultTuning;
  switch (type) {
    case "fire":
      return { ...defaultTuning, durationMultiplier: 0.9 };
    case "rock":
      return { ...defaultTuning, ease: [0.2, 0.9, 0.25, 1] };
    case "ghost":
      return { ...defaultTuning, fadeMultiplier: 1.15, ease: "easeInOut" };
    default:
      return defaultTuning;
  }
};
