import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { MotionTuning } from "../utils/motion";

type StatBarProps = {
  label: string;
  value: number;
  percent: number;
  motionTuning?: MotionTuning;
  isHighlight?: boolean;
  isStrongest?: boolean;
  isWeakest?: boolean;
  artwork: string;
  sequenceIndex?: number;
};

export const StatBar = ({
  label,
  value,
  percent,
  motionTuning,
  isHighlight,
  isStrongest,
  isWeakest,
  artwork,
  sequenceIndex = 0,
}: StatBarProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useLayoutEffect(() => {
    if (!trackRef.current) return;
    const element = trackRef.current;
    const update = () => setTrackWidth(element.getBoundingClientRect().width);
    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const targetWidth = Math.max(0, Math.min(trackWidth, (trackWidth * percent) / 100));
  const timing = {
    duration: 0.6 * (motionTuning?.durationMultiplier ?? 1),
    ease: motionTuning?.ease ?? "easeOut",
    delay: sequenceIndex * 0.05,
  };

  return (
    <div className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
      <span className={isHighlight ? "text-slate-700 font-semibold" : "text-slate-500"}>
        {label}
      </span>
      <div
        ref={trackRef}
        className={`relative w-full rounded-full bg-slate-200 ${
          isStrongest ? "h-2.5" : isWeakest ? "h-1.5" : "h-2"
        }`}
      >
        <motion.div
          className={`h-full rounded-full bg-[color:var(--accent)] ${
            isStrongest ? "opacity-95 shadow-[0_0_10px_rgba(255,255,255,0.45)]" : ""
          } ${isWeakest ? "opacity-45" : isHighlight ? "opacity-85" : "opacity-70"}`}
          initial={{ width: 0 }}
          animate={{ width: targetWidth }}
          transition={timing}
        />
        <motion.div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2"
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: targetWidth, opacity: [0, 0.6, 0] }}
          transition={timing}
        >
          <img
            src={artwork}
            alt=""
            className="h-4 w-4 rounded-full object-contain opacity-60"
          />
        </motion.div>
      </div>
      <motion.span
        className={isHighlight ? "text-slate-900 font-semibold" : "text-slate-600 font-medium"}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3 * (motionTuning?.fadeMultiplier ?? 1),
          ease: motionTuning?.ease ?? "easeOut",
        }}
      >
        {value}
      </motion.span>
    </div>
  );
};
