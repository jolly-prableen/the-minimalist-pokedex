import React from "react";

type ShinyToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

export const ShinyToggle = ({ checked, onChange }: ShinyToggleProps) => (
  <label className="flex items-center gap-3 text-sm font-medium text-slate-500">
    <span>Shiny</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative flex h-7 w-12 items-center rounded-full border border-slate-200 p-1 transition ${
        checked ? "bg-[color:var(--accent)] justify-end" : "bg-slate-200 justify-start"
      }`}
      aria-pressed={checked}
    >
      <span
        className="h-5 w-5 rounded-full bg-white shadow transition"
      />
    </button>
  </label>
);
