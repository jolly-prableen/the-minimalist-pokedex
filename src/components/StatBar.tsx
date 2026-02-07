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
  trend?: "up" | "down" | "same";
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
  trend,
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
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.32 * (motionTuning?.fadeMultiplier ?? 1),
        ease: motionTuning?.ease ?? "easeOut",
      },
    },
  };

  const barVariants = {
    hidden: { width: 0 },
    show: (width: number) => ({
      width,
      transition: timing,
    }),
  };

  const dotVariants = {
    hidden: { x: 0, opacity: 0 },
    show: (width: number) => ({
      x: width,
      opacity: [0, 0.6, 0],
      transition: timing,
    }),
  };

  return (
    <motion.div
      className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm"
      variants={rowVariants}
    >
      <span
        className={
          isStrongest
            ? "text-slate-800 font-semibold"
            : isWeakest
            ? "text-slate-400"
            : isHighlight
            ? "text-slate-700 font-semibold"
            : "text-slate-500"
        }
      >
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
          variants={barVariants}
          custom={targetWidth}
        />
        <motion.div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2"
          variants={dotVariants}
          custom={targetWidth}
        >
          <img
            src={artwork}
            alt=""
            className="h-4 w-4 rounded-full object-contain opacity-60"
          />
        </motion.div>
      </div>
      <span
        className={
          isStrongest
            ? "text-slate-900 font-semibold"
            : isWeakest
            ? "text-slate-400"
            : isHighlight
            ? "text-slate-900 font-semibold"
            : "text-slate-600 font-medium"
        }
      >
        {value}
        {trend === "up" ? (
          <span className="ml-2 text-[0.65rem] font-semibold uppercase text-emerald-400">
            ▲
          </span>
        ) : null}
        {trend === "down" ? (
          <span className="ml-2 text-[0.65rem] font-semibold uppercase text-rose-400">
            ▼
          </span>
        ) : null}
      </span>
    </motion.div>
  );
};
