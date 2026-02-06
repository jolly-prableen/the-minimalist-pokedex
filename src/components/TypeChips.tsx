import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatName } from "../utils/format";
import type { MotionTuning } from "../utils/motion";

type TypeChipsProps = {
  types: string[];
  motionTuning?: MotionTuning;
};

export const TypeChips = ({ types, motionTuning }: TypeChipsProps) => (
  <div className="flex flex-wrap gap-2">
    <AnimatePresence mode="popLayout">
      {types.map((type) => (
        <motion.span
          key={type}
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{
            duration: 0.25 * (motionTuning?.fadeMultiplier ?? 1),
            ease: motionTuning?.ease ?? "easeOut",
          }}
          className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
        >
          {formatName(type)}
        </motion.span>
      ))}
    </AnimatePresence>
  </div>
);
