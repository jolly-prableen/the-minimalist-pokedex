export const typeThemeMap: Record<string, { accent: string; soft: string }> = {
  fire: { accent: "#d9776f", soft: "rgba(217, 119, 111, 0.18)" },
  water: { accent: "#7aa7d9", soft: "rgba(122, 167, 217, 0.18)" },
  grass: { accent: "#7bbf92", soft: "rgba(123, 191, 146, 0.18)" },
  electric: { accent: "#e5c25b", soft: "rgba(229, 194, 91, 0.18)" },
  psychic: { accent: "#c48ad9", soft: "rgba(196, 138, 217, 0.18)" },
  ice: { accent: "#8cc9d9", soft: "rgba(140, 201, 217, 0.18)" },
  dragon: { accent: "#8f87d9", soft: "rgba(143, 135, 217, 0.18)" },
  dark: { accent: "#7c7b8a", soft: "rgba(124, 123, 138, 0.18)" },
  fairy: { accent: "#e7a0c7", soft: "rgba(231, 160, 199, 0.18)" },
  fighting: { accent: "#d08a7f", soft: "rgba(208, 138, 127, 0.18)" },
  flying: { accent: "#9db1d6", soft: "rgba(157, 177, 214, 0.18)" },
  poison: { accent: "#b27ac5", soft: "rgba(178, 122, 197, 0.18)" },
  ground: { accent: "#c8a07a", soft: "rgba(200, 160, 122, 0.18)" },
  rock: { accent: "#bca57a", soft: "rgba(188, 165, 122, 0.18)" },
  bug: { accent: "#a3c16c", soft: "rgba(163, 193, 108, 0.18)" },
  ghost: { accent: "#8e8ab9", soft: "rgba(142, 138, 185, 0.18)" },
  steel: { accent: "#9fa9b6", soft: "rgba(159, 169, 182, 0.18)" },
  normal: { accent: "#a7a3a3", soft: "rgba(167, 163, 163, 0.18)" },
};

export const getThemeForType = (type?: string) => {
  if (!type) return typeThemeMap.normal;
  const normalized = type.toLowerCase();
  return typeThemeMap[normalized] ?? typeThemeMap.normal;
};
