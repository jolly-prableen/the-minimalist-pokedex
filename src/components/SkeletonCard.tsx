import React from "react";
import { motion } from "framer-motion";
import type { MotionTuning } from "../utils/motion";

type SkeletonCardProps = {
  motionTuning?: MotionTuning;
};

export const SkeletonCard = ({ motionTuning }: SkeletonCardProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 * (motionTuning?.fadeMultiplier ?? 1), ease: motionTuning?.ease ?? "easeOut" }}
    className="grid gap-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft"
  >
    <div className="h-60 w-full animate-pulse rounded-2xl bg-slate-200/70" />
    <div className="h-6 w-2/3 animate-pulse rounded-full bg-slate-200/70" />
    <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200/70" />
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-3 w-full animate-pulse rounded-full bg-slate-200/70" />
      ))}
    </div>
  </motion.div>
);
