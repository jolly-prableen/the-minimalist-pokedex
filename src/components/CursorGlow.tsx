import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

// Cursor-following glow for a premium, interactive feel.
export const CursorGlow = () => {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const smoothX = useSpring(x, {
    stiffness: prefersReducedMotion ? 70 : 120,
    damping: prefersReducedMotion ? 28 : 20,
    mass: 0.25,
  });
  const smoothY = useSpring(y, {
    stiffness: prefersReducedMotion ? 70 : 120,
    damping: prefersReducedMotion ? 28 : 20,
    mass: 0.25,
  });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const offset = prefersReducedMotion ? 120 : 180;
      x.set(event.clientX - offset);
      y.set(event.clientY - offset);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [prefersReducedMotion, x, y]);

  return (
    <motion.div
      className="cursor-glow"
      style={{ translateX: smoothX, translateY: smoothY }}
      aria-hidden
    />
  );
};
