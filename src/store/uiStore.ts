import { create } from "zustand";

type UIState = {
  isShiny: boolean;
  accent: string;
  accentSoft: string;
  cardState: Record<string, { isShiny: boolean; isFlipped: boolean; hasUsedShiny: boolean }>;
  setShiny: (value: boolean) => void;
  setAccent: (accent: string, accentSoft: string) => void;
  setCardState: (name: string, next: Partial<{ isShiny: boolean; isFlipped: boolean; hasUsedShiny: boolean }>) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isShiny: false,
  accent: "#9aa4b2",
  accentSoft: "rgba(154, 164, 178, 0.18)",
  cardState: {},
  setShiny: (value) => set({ isShiny: value }),
  setAccent: (accent, accentSoft) => set({ accent, accentSoft }),
  setCardState: (name, next) =>
    set((state) => ({
      cardState: {
        ...state.cardState,
        [name]: {
          isShiny: state.cardState[name]?.isShiny ?? false,
          isFlipped: state.cardState[name]?.isFlipped ?? false,
          hasUsedShiny: state.cardState[name]?.hasUsedShiny ?? false,
          ...next,
        },
      },
    })),
}));
