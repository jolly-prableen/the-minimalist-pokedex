import { create } from "zustand";

type UIState = {
  isShiny: boolean;
  accent: string;
  accentSoft: string;
  prefersReducedMotion: boolean | null;
  cardState: Record<string, { isShiny: boolean; isFlipped: boolean; hasUsedShiny: boolean }>;
  favorites: Record<string, true>;
  collection: Record<string, { primaryType: string }>;
  history: string[];
  setShiny: (value: boolean) => void;
  setPrefersReducedMotion: (value: boolean) => void;
  setAccent: (accent: string, accentSoft: string) => void;
  setCardState: (name: string, next: Partial<{ isShiny: boolean; isFlipped: boolean; hasUsedShiny: boolean }>) => void;
  toggleFavorite: (name: string) => void;
  markCollected: (name: string, primaryType: string) => void;
  removeCollected: (name: string) => void;
  addHistory: (name: string) => void;
};

const FAVORITES_KEY = "minimalist-pokedex:favorites";
const COLLECTION_KEY = "minimalist-pokedex:collection";
const COLLECTION_VERSION_KEY = "minimalist-pokedex:collection:version";
const COLLECTION_VERSION = 3;
const HISTORY_KEY = "minimalist-pokedex:history";
const HISTORY_LIMIT = 8;
const UI_PREFS_KEY = "minimalist-pokedex:ui-preferences";

type StoredUIPreferences = {
  isShiny?: boolean;
  prefersReducedMotion?: boolean;
};

const loadUIPreferences = (): StoredUIPreferences => {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as StoredUIPreferences;
    return {};
  } catch {
    return {};
  }
};

const saveUIPreferences = (next: StoredUIPreferences) => {
  try {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(next));
  } catch {
    // ignore write errors (private mode, etc.)
  }
};

const loadFavorites = (): Record<string, true> => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, true>;
    return {};
  } catch {
    return {};
  }
};

const loadCollection = (): Record<string, { primaryType: string }> => {
  try {
    const version = Number(localStorage.getItem(COLLECTION_VERSION_KEY) ?? 0);
    if (version !== COLLECTION_VERSION) {
      localStorage.removeItem(COLLECTION_KEY);
      localStorage.setItem(COLLECTION_VERSION_KEY, String(COLLECTION_VERSION));
      return {};
    }
    const raw = localStorage.getItem(COLLECTION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const entries = Object.entries(parsed as Record<string, unknown>);
    return entries.reduce<Record<string, { primaryType: string }>>((acc, [name, value]) => {
      if (typeof value === "object" && value && "primaryType" in value) {
        const stored = (value as { primaryType?: string }).primaryType;
        if (stored) {
          acc[name] = { primaryType: stored };
        }
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const saveFavorites = (favorites: Record<string, true>) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // ignore write errors (private mode, etc.)
  }
};

const saveCollection = (collection: Record<string, { primaryType: string }>) => {
  try {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
  } catch {
    // ignore write errors (private mode, etc.)
  }
};

const loadHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((name) => typeof name === "string").slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
};

const saveHistory = (history: string[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore write errors (private mode, etc.)
  }
};

const uiPrefs = loadUIPreferences();

export const useUIStore = create<UIState>((set) => ({
  isShiny: uiPrefs.isShiny ?? false,
  accent: "#9aa4b2",
  accentSoft: "rgba(154, 164, 178, 0.18)",
  prefersReducedMotion: uiPrefs.prefersReducedMotion ?? null,
  cardState: {},
  favorites: loadFavorites(),
  collection: loadCollection(),
  history: loadHistory(),
  setShiny: (value) =>
    set((state) => {
      saveUIPreferences({
        isShiny: value,
        prefersReducedMotion: state.prefersReducedMotion ?? undefined,
      });
      return { ...state, isShiny: value };
    }),
  setPrefersReducedMotion: (value) =>
    set((state) => {
      saveUIPreferences({
        isShiny: state.isShiny,
        prefersReducedMotion: value,
      });
      return { ...state, prefersReducedMotion: value };
    }),
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
  toggleFavorite: (name) =>
    set((state) => {
      const next = { ...state.favorites };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = true;
      }
      saveFavorites(next);
      return { favorites: next };
    }),
  markCollected: (name, primaryType) =>
    set((state) => {
      if (state.collection[name]) return state;
      const next = { ...state.collection, [name]: { primaryType } };
      saveCollection(next);
      return { collection: next };
    }),
  removeCollected: (name) =>
    set((state) => {
      if (!state.collection[name]) return state;
      const next = { ...state.collection };
      delete next[name];
      saveCollection(next);
      return { collection: next };
    }),
  addHistory: (name) =>
    set((state) => {
      const next = [name, ...state.history.filter((entry) => entry !== name)].slice(
        0,
        HISTORY_LIMIT
      );
      saveHistory(next);
      return { history: next };
    }),
}));
