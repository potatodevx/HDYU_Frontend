"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Sprout,
  Flower2,
  Wheat,
  ShoppingBag,
  Plane,
  Users,
  Megaphone,
  Store,
  Gift,
  QrCode,
  ArrowLeftRight,
  Palmtree,
  Wallet,
  HandCoins,
  Repeat,
  TrendingUp,
  ShieldCheck,
  Lock,
  Coins,
  Landmark,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem, SectionLabel } from "./reveal";
import { GrowingSprout } from "./nature";

const EASE = [0.21, 0.65, 0.36, 1] as const;

/* ---------------------------------- Vision ---------------------------------- */

const LOOP_STEPS = [
  { icon: Sprout, title: "Do", text: "Complete a verified green activity — gardening, farming, sustainable purchases, travel." },
  { icon: HandCoins, title: "Earn", text: "Approved activities are rewarded with HDYU sent straight to your wallet." },
  { icon: Wallet, title: "Hold", text: "HDYU lives in your own non-custodial Solana wallet. We never hold your keys." },
  { icon: Repeat, title: "Use", text: "Redeem for travel benefits, green products, merchant services — or send to anyone." },
];

export function VisionSection() {
  const reduce = useReducedMotion();
  return (
    <section id="vision" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionLabel>Our Vision</SectionLabel>
          <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            A utility token with a purpose beyond trading
          </h2>
          <p className="mt-5 text-base leading-relaxed text-emerald-100/60">
            HDYU is not created only as a tradable crypto token. It is the common currency of a
            growing green ecosystem — connecting people who garden, farm naturally, buy sustainably
            and travel responsibly with the products, merchants and services that share those values.
          </p>
          <p className="mt-4 text-base leading-relaxed text-emerald-100/60">
            Every HDYU in circulation represents participation in that ecosystem: earned through
            verified real-world activities, held in your own Solana wallet, and spent on real
            benefits.
          </p>
          <GrowingSprout className="mt-6 -ml-4" size={150} />
        </Reveal>
        <Reveal delay={0.15}>
          <div className="glass card-hover rounded-3xl p-8">
            <div className="flex items-center gap-3">
              <div className="chip rounded-xl bg-emerald-400/10 p-3 text-emerald-300"><Sprout size={22} /></div>
              <h3 className="font-display text-lg font-bold text-white">The HDYU Loop</h3>
            </div>
            <motion.div
              className="mt-6 space-y-4"
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.22 } } }}
            >
              {LOOP_STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  className="flex gap-4"
                  variants={{
                    hidden: { opacity: 0, x: -22 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="chip rounded-lg bg-white/5 p-2 text-lime-300"><step.icon size={17} /></div>
                    {i < LOOP_STEPS.length - 1 && (
                      <motion.div
                        className="mt-1 w-px origin-top bg-gradient-to-b from-lime-400/50 to-emerald-400/10"
                        variants={{
                          hidden: { height: 0 },
                          visible: { height: 24, transition: { duration: 0.4, ease: EASE } },
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{step.title}</div>
                    <div className="mt-0.5 text-sm text-emerald-100/55">{step.text}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------- Earn ----------------------------------- */

const EARN_WAYS = [
  { icon: Sprout, title: "Green & Environmental Activities", text: "Tree planting, clean-ups, conservation and verified environmental action." },
  { icon: Flower2, title: "Home & Terrace Gardening", text: "Grow your own — document your home or terrace garden and earn." },
  { icon: Wheat, title: "Organic & Natural Farming", text: "Natural farming practices rewarded, from soil health to chemical-free harvests." },
  { icon: ShoppingBag, title: "Sustainable Purchases", text: "Buying eco-friendly and green products earns HDYU back." },
  { icon: Plane, title: "Travel Activities", text: "Eco-travel packages, promotions and travel-linked campaigns." },
  { icon: Users, title: "Referrals", text: "Bring friends into the ecosystem and share the rewards." },
  { icon: Megaphone, title: "Ecosystem Campaigns", text: "Seasonal challenges and community campaigns with HDYU prize pools." },
];

export function EarnSection() {
  return (
    <section id="earn" className="relative py-24">
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-emerald-500/8 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel>Earn HDYU</SectionLabel>
          <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Real activities. Verified. Rewarded.
          </h2>
          <p className="mt-4 text-emerald-100/60">
            Submit your activity from the dashboard, our team verifies it, and approved rewards are
            distributed on-chain from the HDYU treasury — directly to your wallet.
          </p>
        </Reveal>
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EARN_WAYS.map((w) => (
            <StaggerItem key={w.title}>
              <div className="glass card-hover h-full rounded-2xl p-6">
                <div className="chip inline-flex rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                  <w.icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-white">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100/55">{w.text}</p>
              </div>
            </StaggerItem>
          ))}
          <StaggerItem>
            <div className="card-hover flex h-full flex-col justify-center rounded-2xl border border-lime-400/25 bg-gradient-to-br from-lime-500/12 via-emerald-500/8 to-transparent p-6">
              <h3 className="font-display text-base font-bold text-white">Ready to start?</h3>
              <p className="mt-2 text-sm text-emerald-100/60">
                Create your free HDYU account and submit your first activity today.
              </p>
              <a href="/register" className="btn-primary mt-4 w-fit !py-2 text-sm">Create Account</a>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------------------------- Utility ---------------------------------- */

const USE_WAYS = [
  { icon: Palmtree, title: "Travel Benefits", text: "Redeem HDYU against travel packages and eco-tourism offers." },
  { icon: ShoppingBag, title: "Green Marketplace", text: "Purchase eco-friendly and organic products in our future marketplace." },
  { icon: Store, title: "Partner Merchants", text: "Pay for products and services across our partner merchant network." },
  { icon: Gift, title: "Offers & Membership", text: "Unlock special offers, discounts and membership tiers." },
  { icon: ArrowLeftRight, title: "User-to-User Transfers", text: "Send HDYU to any HDYU user or Solana wallet — instantly, on-chain." },
  { icon: QrCode, title: "QR Payments (Coming)", text: "Scan-and-pay at partner merchants with QR-based redemptions." },
];

export function UtilitySection() {
  return (
    <section id="utility" className="mx-auto max-w-7xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionLabel>Use HDYU</SectionLabel>
        <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          A token you can actually use
        </h2>
        <p className="mt-4 text-emerald-100/60">
          HDYU utility grows phase by phase — starting with transfers and rewards, expanding into
          travel, marketplace and merchant payments.
        </p>
      </Reveal>
      <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {USE_WAYS.map((w) => (
          <StaggerItem key={w.title}>
            <div className="glass card-hover h-full rounded-2xl p-6">
              <div className="chip inline-flex rounded-xl bg-teal-400/10 p-3 text-teal-300">
                <w.icon size={20} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-white">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/55">{w.text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ----------------------------------- Token ----------------------------------- */

const TOKEN_FACTS = [
  { icon: Coins, label: "Maximum Supply", value: "1,000,000,000 HDYU", note: "Hard cap — minting closes permanently at 1B" },
  { icon: ShieldCheck, label: "Standard", value: "Token-2022", note: "Solana's audited token extensions program" },
  { icon: Landmark, label: "Treasury", value: "Secured & Controlled", note: "Hardware-wallet secured, multisig-ready" },
  { icon: Lock, label: "Compatibility", value: "Wallet & DEX Ready", note: "Minimal extensions for Phantom, Solflare, Jupiter, Raydium" },
];

export function TokenSection() {
  return (
    <section id="token" className="relative py-24">
      <div className="pointer-events-none absolute left-0 top-32 h-80 w-80 rounded-full bg-teal-500/8 blur-[120px]" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>The Token</SectionLabel>
            <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Built on Solana. Built to last.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-emerald-100/60">
              HDYU is deployed with Solana&apos;s Token-2022 standard using a deliberately minimal
              configuration — on-chain metadata and nothing that could compromise future wallet or
              DEX compatibility. No transfer fees. No freeze authority. No hidden mechanics.
            </p>
            <p className="mt-4 text-base leading-relaxed text-emerald-100/60">
              Supply is minted to the secured treasury in transparent phases as the ecosystem
              grows, with a hard cap of one billion HDYU — the moment the cap is reached, minting
              is permanently closed on-chain for everyone, including the team.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200/80">
              <TrendingUp size={16} className="shrink-0 text-emerald-400" />
              Phase 3 introduces DEX liquidity (HDYU/USDC) for a transparent, on-chain liquidity route.
            </div>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {TOKEN_FACTS.map((f) => (
              <StaggerItem key={f.label}>
                <div className="glass card-hover h-full rounded-2xl p-6">
                  <div className="chip inline-flex rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
                    <f.icon size={18} />
                  </div>
                  <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-emerald-100/40">{f.label}</div>
                  <div className="font-display mt-1 text-base font-bold text-white">{f.value}</div>
                  <div className="mt-1 text-xs text-emerald-100/50">{f.note}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Roadmap ---------------------------------- */

const PHASES = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "Now",
    items: ["HDYU Token on Solana", "Website, accounts & dashboard", "Non-custodial wallet integration", "Send / receive / transfers", "Admin-verified green rewards"],
  },
  {
    phase: "Phase 2",
    title: "Ecosystem",
    status: "Next",
    items: ["Automated reward engine", "Green activity verification at scale", "Partner & merchant system", "Marketplace", "QR-based merchant payments"],
  },
  {
    phase: "Phase 3",
    title: "Liquidity",
    status: "Future",
    items: ["DEX integration (Jupiter / Raydium)", "HDYU / USDC liquidity pool", "Transparent liquidity route", "Wider ecosystem expansion"],
  },
];

export function RoadmapSection() {
  const reduce = useReducedMotion();
  return (
    <section id="roadmap" className="mx-auto max-w-7xl px-6 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionLabel>Roadmap</SectionLabel>
        <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Utility first. Liquidity when it&apos;s earned.
        </h2>
      </Reveal>

      {/* growing path connecting the phases */}
      <div className="relative mt-14">
        <motion.div
          aria-hidden
          className="absolute -top-4 left-[8%] hidden h-[3px] origin-left rounded-full bg-gradient-to-r from-lime-400/70 via-emerald-400/50 to-emerald-400/10 lg:block"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: EASE }}
          style={{ width: "84%" }}
        />
        <Stagger className="grid gap-6 lg:grid-cols-3">
          {PHASES.map((p, i) => (
            <StaggerItem key={p.phase}>
              <div className={`card-hover h-full rounded-2xl p-7 ${i === 0 ? "border border-lime-400/30 bg-gradient-to-b from-lime-500/10 via-emerald-500/8 to-transparent" : "glass"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300/90">{p.phase}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${i === 0 ? "bg-lime-400/20 text-lime-300" : "bg-white/5 text-emerald-100/50"}`}>
                    {p.status}
                  </span>
                </div>
                <h3 className="font-display mt-3 text-xl font-bold text-white">{p.title}</h3>
                <motion.ul
                  className="mt-5 space-y-2.5"
                  initial={reduce ? false : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 + i * 0.15 } } }}
                >
                  {p.items.map((item) => (
                    <motion.li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-emerald-100/60"
                      variants={{
                        hidden: { opacity: 0, x: -14 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
                      }}
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400/80" />
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------ CTA ------------------------------------ */

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-forest-850 to-lime-500/8 px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-emerald-400/15 blur-[100px]" />
          <GrowingSprout className="pointer-events-none absolute -bottom-6 right-6 opacity-40 sm:opacity-70" size={130} />
          <h2 className="font-display relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Join the green economy.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-emerald-100/60">
            Create your HDYU account, connect your Solana wallet, and turn everyday green actions
            into on-chain rewards.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/register" className="btn-primary !px-8 !py-3.5 text-base">Create Free Account</a>
            <a href="/login" className="btn-secondary !px-8 !py-3.5 text-base">Sign In</a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
