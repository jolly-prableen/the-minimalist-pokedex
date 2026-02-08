import React from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onSubmit }, ref) => (
    <form
      className="flex w-full items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-soft transition hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input
        ref={ref}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:var(--accent-soft)]"
        placeholder="Search by name (e.g., pikachu)"
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
  )
);

SearchBar.displayName = "SearchBar";
