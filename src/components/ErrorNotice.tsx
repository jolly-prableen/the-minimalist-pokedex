import React from "react";

export const ErrorNotice = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm text-slate-500 shadow-soft">
    {message}
  </div>
);
