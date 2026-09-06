import Link from "next/link";
import Image from "next/image";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-forest-900/40">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="HDYU" width={36} height={36} className="rounded-full" />
              <span className="font-display text-lg font-bold text-white">HDYU</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-100/50">
              Harmony Development & Yield Utility — a Solana Token-2022 utility token connecting green
              activities, natural farming, sustainable products, travel services and partner merchants
              into one ecosystem.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300/60">
              <Leaf size={14} />
              Built on Solana · Token-2022 · Non-custodial
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Ecosystem</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-emerald-100/50">
              <li><Link className="transition hover:text-emerald-300" href="/#earn">Earn HDYU</Link></li>
              <li><Link className="transition hover:text-emerald-300" href="/#utility">Use HDYU</Link></li>
              <li><Link className="transition hover:text-emerald-300" href="/#token">Token Details</Link></li>
              <li><Link className="transition hover:text-emerald-300" href="/#roadmap">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-emerald-100/50">
              <li><Link className="transition hover:text-emerald-300" href="/register">Create Account</Link></li>
              <li><Link className="transition hover:text-emerald-300" href="/login">Sign In</Link></li>
              <li><Link className="transition hover:text-emerald-300" href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-emerald-100/40 sm:flex-row">
          <span>© {new Date().getFullYear()} HDYU — Harmony Development & Yield Utility.</span>
          <span>HDYU is a utility token. Nothing on this site is financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
