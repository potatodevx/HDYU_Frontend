"use client";

import { ArrowDownLeft, ArrowUpRight, ExternalLink, Inbox } from "lucide-react";
import { useTransactions } from "@/hooks/use-hdyu";
import { formatHdyu, shortAddress } from "@/lib/utils";

const CLUSTER_SUFFIX =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "" : "?cluster=devnet";

export function TransactionList({ address, limit }: { address: string; limit?: number }) {
  const { transactions, isLoading, error } = useTransactions(address);
  const items = limit ? transactions.slice(0, limit) : transactions;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass h-[72px] animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 text-sm text-emerald-100/50">
        Could not load history right now — the network may be busy. It refreshes automatically.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass flex flex-col items-center rounded-2xl px-6 py-12 text-center">
        <div className="rounded-2xl bg-white/5 p-4 text-emerald-100/30">
          <Inbox size={28} />
        </div>
        <p className="mt-4 text-sm font-semibold text-white">No HDYU transactions yet</p>
        <p className="mt-1 max-w-xs text-xs text-emerald-100/45">
          Earn your first HDYU by submitting a green activity, or receive some from another user.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((tx) => {
        const received = tx.change > 0;
        return (
          <a
            key={tx.signature}
            href={`https://solscan.io/tx/${tx.signature}${CLUSTER_SUFFIX}`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass card-hover flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`rounded-xl p-2.5 ${
                  received ? "bg-emerald-400/12 text-emerald-300" : "bg-orange-400/10 text-orange-300"
                }`}
              >
                {received ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {received ? "Received" : "Sent"} HDYU
                </div>
                <div className="mt-0.5 text-xs text-emerald-100/45">
                  {tx.counterparty ? `${received ? "From" : "To"} ${shortAddress(tx.counterparty)}` : "On-chain transfer"}
                  {tx.blockTime
                    ? ` · ${new Date(tx.blockTime * 1000).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : ""}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-sm font-bold ${received ? "text-emerald-300" : "text-orange-300"}`}>
                {received ? "+" : ""}
                {formatHdyu(tx.change)}
              </span>
              <ExternalLink size={13} className="text-emerald-100/30" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
