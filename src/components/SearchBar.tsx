import React, { useCallback, useEffect, useRef, useState } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onSubmit }, ref) => {
    const examples = ["pikachu", "eevee", "charizard"];
    const [placeholder, setPlaceholder] = useState(
      `Search by name (e.g., ${examples[0]})`
    );
    const [placeholderOpacity, setPlaceholderOpacity] = useState(1);
    const hasRunRef = useRef(false);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const stopAnimation = useCallback(() => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setPlaceholderOpacity(1);
    }, []);

    useEffect(() => {
      if (typeof window === "undefined") return;
      if (value) {
        stopAnimation();
      }
    }, [value, stopAnimation]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      if (hasRunRef.current || value) return;
      hasRunRef.current = true;

      let stepIndex = 0;
      intervalRef.current = window.setInterval(() => {
        stepIndex += 1;
        if (stepIndex >= examples.length) {
          stopAnimation();
          return;
        }
        setPlaceholderOpacity(0);
        timeoutRef.current = window.setTimeout(() => {
          setPlaceholder(`Search by name (e.g., ${examples[stepIndex]})`);
          requestAnimationFrame(() => setPlaceholderOpacity(1));
        }, 180);
      }, 1500);

      return stopAnimation;
    }, [examples, stopAnimation, value]);

    return (
      <form
        className="flex w-full items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-soft transition duration-300 ease-out hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)] focus-within:scale-[1.01] focus-within:border-[color:var(--accent)] focus-within:shadow-[0_24px_70px_rgba(15,23,42,0.2)] focus-within:ring-4 focus-within:ring-[color:var(--accent-soft)]"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input
          ref={ref}
          className="placeholder-fade w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:var(--accent-soft)]"
          style={{ "--placeholder-opacity": placeholderOpacity } as React.CSSProperties}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
        >
          Search
        </button>
      </form>
    );
  }
);

SearchBar.displayName = "SearchBar";
