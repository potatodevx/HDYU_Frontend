"use client";

import useSWR from "swr";
import Link from "next/link";
import { Users, Wallet, Clock, Coins, ArrowRight, ScrollText } from "lucide-react";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminOverviewPage() {
  const { data, isLoading } = useSWR("/api/admin/stats", fetcher, { refreshInterval: 30_000 });

  const cards = [
    { label: "Registered Users", value: data?.totalUsers, icon: Users, tint: "text-emerald-300 bg-emerald-400/10" },
    { label: "Wallets Linked", value: data?.walletsLinked, icon: Wallet, tint: "text-teal-300 bg-teal-400/10" },
    { label: "Pending Reviews", value: data?.submissions?.pending, icon: Clock, tint: "text-amber-300 bg-amber-400/10" },
    { label: "HDYU Rewards Paid", value: data?.totalRewardsPaid?.toLocaleString(), icon: Coins, tint: "text-emerald-300 bg-emerald-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Ecosystem Overview</h1>
        <p className="mt-1 text-sm text-emerald-100/50">Live statistics for the HDYU Phase 1 platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass card-hover rounded-2xl p-6">
            <div className={`inline-flex rounded-xl p-2.5 ${c.tint}`}>
              <c.icon size={18} />
            </div>
            <div className="font-display mt-3 text-2xl font-extrabold text-white">
              {isLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-white/10" /> : c.value ?? 0}
            </div>
            <div className="mt-1 text-xs text-emerald-100/45">{c.label}</div>
          </div>
        ))}
      </div>

      {data?.submissions?.pending > 0 && (
        <Link
          href="/admin/rewards"
          className="card-hover flex items-center justify-between rounded-2xl border border-amber-400/25 bg-amber-400/8 px-6 py-5"
        >
          <div className="flex items-center gap-3 text-sm font-semibold text-amber-200">
            <Clock size={18} />
            {data.submissions.pending} submission{data.submissions.pending > 1 ? "s" : ""} waiting for review
          </div>
          <ArrowRight size={17} className="text-amber-300" />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-3 text-lg font-bold text-white">Recent Payouts</h2>
          <div className="glass rounded-2xl">
            {(data?.recentPayouts ?? []).length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-emerald-100/45">No payouts yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.recentPayouts.map((p: { id: string; user: { userId: string; name: string }; rewardAmount: number; paidAt: string }) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="text-sm font-semibold text-white">{p.user.name}</div>
                      <div className="text-xs text-emerald-100/40">
                        {p.user.userId} · {formatDate(p.paidAt)}
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-300">
                      +{p.rewardAmount?.toLocaleString()} HDYU
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <ScrollText size={17} className="text-emerald-400" /> Audit Trail
          </h2>
          <div className="glass rounded-2xl">
            {(data?.recentLogs ?? []).length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-emerald-100/45">No admin actions yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.recentLogs.map((log: { id: string; action: string; detail: string; adminEmail: string; createdAt: string }) => (
                  <div key={log.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">{log.action}</span>
                      <span className="text-[11px] text-emerald-100/35">{formatDate(log.createdAt)}</span>
                    </div>
                    <div className="mt-1 break-all text-xs text-emerald-100/50">{log.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
