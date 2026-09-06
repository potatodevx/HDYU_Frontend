"use client";

import { motion, useReducedMotion } from "framer-motion";

/* Deterministic leaf configs (SSR-safe — no Math.random to avoid hydration mismatch). */
const LEAVES = [
  { left: "6%", size: 18, duration: 19, delay: 0, drift: 42, opacity: 0.16, hue: "#4ade80" },
  { left: "14%", size: 12, duration: 24, delay: 6, drift: -30, opacity: 0.12, hue: "#a3e635" },
  { left: "24%", size: 22, duration: 17, delay: 3, drift: 55, opacity: 0.2, hue: "#34d399" },
  { left: "36%", size: 14, duration: 26, delay: 10, drift: -45, opacity: 0.11, hue: "#4ade80" },
  { left: "48%", size: 16, duration: 21, delay: 1, drift: 35, opacity: 0.15, hue: "#a3e635" },
  { left: "58%", size: 11, duration: 28, delay: 8, drift: -25, opacity: 0.1, hue: "#6ee7b7" },
  { left: "68%", size: 20, duration: 18, delay: 4, drift: 48, opacity: 0.18, hue: "#4ade80" },
  { left: "78%", size: 13, duration: 23, delay: 12, drift: -38, opacity: 0.13, hue: "#34d399" },
  { left: "88%", size: 17, duration: 20, delay: 7, drift: 30, opacity: 0.16, hue: "#a3e635" },
  { left: "94%", size: 12, duration: 25, delay: 2, drift: -50, opacity: 0.11, hue: "#6ee7b7" },
];

function LeafShape({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.5 7.5 4.5 13 12 22c7.5-9 5.5-14.5 0-20Z"
        fill={color}
      />
      <path d="M12 5v14" stroke="#04120c" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Gently falling, drifting leaves. Renders nothing for reduced-motion users. */
export function FallingLeaves() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="leaf"
          style={
            {
              left: leaf.left,
              "--leaf-duration": `${leaf.duration}s`,
              "--leaf-delay": `-${leaf.delay}s`,
              "--leaf-drift": `${leaf.drift}px`,
              "--leaf-opacity": leaf.opacity,
            } as React.CSSProperties
          }
        >
          <LeafShape size={leaf.size} color={leaf.hue} />
        </span>
      ))}
    </div>
  );
}

const draw = (delay: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.4, delay, ease: [0.45, 0, 0.2, 1] as const },
      opacity: { duration: 0.3, delay },
    },
  },
});

const leafPop = (delay: number) => ({
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 16, delay },
  },
});

/**
 * A sprout that draws itself (stem first, then leaves unfold) when scrolled
 * into view — line-art style, used as a section decoration.
 */
export function GrowingSprout({ className, size = 180 }: { className?: string; size?: number }) {
  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      aria-hidden
    >
      {/* soil mound */}
      <motion.path
        d="M28 104c10-7 54-7 64 0"
        stroke="#65a30d"
        strokeWidth="3"
        strokeLinecap="round"
        variants={draw(0)}
      />
      {/* main stem */}
      <motion.path
        d="M60 104C60 84 58 66 60 44"
        stroke="#4ade80"
        strokeWidth="3.5"
        strokeLinecap="round"
        variants={draw(0.3)}
      />
      {/* left branch */}
      <motion.path
        d="M60 78C50 74 42 66 40 54"
        stroke="#4ade80"
        strokeWidth="3"
        strokeLinecap="round"
        variants={draw(0.9)}
      />
      {/* right branch */}
      <motion.path
        d="M60 64C70 60 78 52 80 40"
        stroke="#4ade80"
        strokeWidth="3"
        strokeLinecap="round"
        variants={draw(1.1)}
      />
      {/* leaves */}
      <motion.path
        d="M40 54c-8-2-12-8-12-16 8 0 14 4 15 12"
        fill="#a3e635"
        variants={leafPop(1.5)}
        style={{ transformOrigin: "40px 54px" }}
      />
      <motion.path
        d="M80 40c8-2 12-8 12-16-8 0-14 4-15 12"
        fill="#a3e635"
        variants={leafPop(1.7)}
        style={{ transformOrigin: "80px 40px" }}
      />
      <motion.path
        d="M60 44c-9-4-11-13-8-22 9 3 13 11 11 20"
        fill="#4ade80"
        variants={leafPop(1.9)}
        style={{ transformOrigin: "60px 44px" }}
      />
      <motion.path
        d="M60 44c9-4 11-13 8-22-9 3-13 11-11 20"
        fill="#34d399"
        variants={leafPop(2.05)}
        style={{ transformOrigin: "60px 44px" }}
      />
    </motion.svg>
  );
}
