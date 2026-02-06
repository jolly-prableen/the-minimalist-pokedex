import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Cursor-following glow for a premium, interactive feel.
export const CursorGlow = () => {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const smoothX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.2 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.2 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      x.set(event.clientX - 180);
      y.set(event.clientY - 180);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y]);

  return (
    <motion.div
      className="cursor-glow"
      style={{ translateX: smoothX, translateY: smoothY }}
      aria-hidden
    />
  );
};
