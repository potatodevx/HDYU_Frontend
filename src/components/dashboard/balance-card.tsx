"use client";

import Link from "next/link";
import { RefreshCw, Send, Download, Sprout } from "lucide-react";
import { useHdyuBalance, HDYU_MINT } from "@/hooks/use-hdyu";
import { formatHdyu, shortAddress } from "@/lib/utils";

export function BalanceCard({ address }: { address: string }) {
  const { balance, isLoading, refresh } = useHdyuBalance(address);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 via-forest-850 to-teal-500/8 p-7 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-[80px]" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/50">
            HDYU Balance
          </div>
          <div className="font-display mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {!HDYU_MINT ? (
              <span className="text-xl text-emerald-100/50">Token not configured</span>
            ) : balance === null || isLoading ? (
              <span className="inline-block h-11 w-44 animate-pulse rounded-lg bg-white/10" />
            ) : (
              <>
                {formatHdyu(balance)} <span className="text-xl font-bold text-emerald-300">HDYU</span>
              </>
            )}
          </div>
          <div className="mt-2 font-mono text-xs text-emerald-100/40">{shortAddress(address, 8)}</div>
        </div>
        <button
          onClick={() => refresh()}
          className="rounded-xl bg-white/8 p-2.5 text-emerald-100/60 transition hover:bg-white/15 hover:text-white"
          title="Refresh balance"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="relative mt-7 grid grid-cols-3 gap-3">
        <Link href="/dashboard/send" className="btn-primary !py-2.5 text-sm">
          <Send size={15} /> Send
        </Link>
        <Link href="/dashboard/receive" className="btn-secondary !py-2.5 text-sm">
          <Download size={15} /> Receive
        </Link>
        <Link href="/dashboard/rewards" className="btn-secondary !py-2.5 text-sm">
          <Sprout size={15} /> Earn
        </Link>
      </div>
    </div>
  );
}
