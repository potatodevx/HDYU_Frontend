"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Coins } from "lucide-react";
import { FallingLeaves } from "./nature";

const STATS = [
  { value: "1B", label: "Max Supply (Hard Cap)" },
  { value: "Token-2022", label: "Solana Standard" },
  { value: "Non-Custodial", label: "Your Keys, Your HDYU" },
  { value: "7+", label: "Ways to Earn" },
];

const HEADLINE_1 = ["Earn", "rewards", "for", "living"];
const HEADLINE_2 = ["Spend", "them", "across", "a", "real"];

const EASE = [0.21, 0.65, 0.36, 1] as const;

function Word({ children, index, gradient }: { children: string; index: number; gradient?: boolean }) {
  return (
    <motion.span
      className={`inline-block ${gradient ? "text-gradient" : ""}`}
      initial={{ opacity: 0, y: 26, rotateX: 40 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.65, delay: 0.15 + index * 0.07, ease: EASE }}
    >
      {children}&nbsp;
    </motion.span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* backdrop layers (parallax) */}
      <div className="grid-bg absolute inset-0" />
      <motion.div
        style={reduce ? undefined : { y: glowY }}
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[140px] animate-glow"
      />
      <div className="pointer-events-none absolute top-40 -left-40 h-96 w-96 rounded-full bg-lime-500/7 blur-[120px]" />
      <FallingLeaves />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative mx-auto max-w-7xl px-6 text-center"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/6 px-4 py-1.5 text-xs font-semibold text-lime-300"
        >
          <span className="sway inline-flex"><Leaf size={13} /></span>
          Green Utility Token on Solana · Token-2022
        </motion.div>

        <h1 className="font-display mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl" style={{ perspective: 600 }}>
          <span className="block">
            {HEADLINE_1.map((w, i) => (
              <Word key={w} index={i}>{w}</Word>
            ))}
            <Word index={4} gradient>green.</Word>
          </span>
          <span className="block">
            {HEADLINE_2.map((w, i) => (
              <Word key={w} index={i + 6}>{w}</Word>
            ))}
            <Word index={11} gradient>ecosystem.</Word>
          </span>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-emerald-100/60 sm:text-lg"
        >
          HDYU — Harmony Development & Yield Utility — rewards verified green activities, natural
          farming, sustainable purchases and travel, and connects them to products, merchants and a
          future marketplace. All on Solana, all in your own wallet.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/register" className="btn-primary !px-7 !py-3.5 text-base">
            Start Earning HDYU <ArrowRight size={18} />
          </Link>
          <Link href="/#token" className="btn-secondary !px-7 !py-3.5 text-base">
            <Coins size={18} /> Token Details
          </Link>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.25 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-emerald-100/40"
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          Your private keys never touch our servers — connect Phantom or Solflare.
        </motion.div>

        {/* stats */}
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 1.35 } } }}
          className="glass mx-auto mt-16 grid max-w-4xl grid-cols-2 divide-white/5 rounded-2xl sm:grid-cols-4 sm:divide-x"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 22, scale: 0.92 },
                visible: {
                  opacity: 1, y: 0, scale: 1,
                  transition: { type: "spring", stiffness: 220, damping: 20 },
                },
              }}
              className="px-6 py-6"
            >
              <div className="font-display text-xl font-bold text-white sm:text-2xl">{s.value}</div>
              <div className="mt-1 text-xs text-emerald-100/50">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
