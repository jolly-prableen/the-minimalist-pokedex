import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Subtle animated orbs for a premium, lively background.
export const AmbientOrbs = () => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="orb orb--one"
        animate={
          prefersReducedMotion ? { y: [0, -6, 0], x: [0, 4, 0] } : { y: [0, -20, 0], x: [0, 10, 0] }
        }
        transition={{ duration: prefersReducedMotion ? 24 : 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb orb--two"
        animate={
          prefersReducedMotion ? { y: [0, 8, 0], x: [0, -5, 0] } : { y: [0, 24, 0], x: [0, -12, 0] }
        }
        transition={{ duration: prefersReducedMotion ? 26 : 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
