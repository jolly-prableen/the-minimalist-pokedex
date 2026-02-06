import React from "react";
import { motion } from "framer-motion";

// Subtle animated orbs for a premium, lively background.
export const AmbientOrbs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.div
      className="orb orb--one"
      animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="orb orb--two"
      animate={{ y: [0, 24, 0], x: [0, -12, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);
