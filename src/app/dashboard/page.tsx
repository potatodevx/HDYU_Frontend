"use client";

import Link from "next/link";
import { ArrowRight, Sprout } from "lucide-react";
import { WalletLinkCard } from "@/components/dashboard/wallet-link";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { AddTokenCard } from "@/components/dashboard/add-token-card";
import { TransactionList } from "@/components/dashboard/tx-list";
import { useActivities } from "@/hooks/use-hdyu";
import { usePrototypeAuth } from "@/components/prototype-auth";

export default function DashboardPage() {
  const { user } = usePrototypeAuth();
  const { activities } = useActivities();
  const wallet = user?.walletAddress ?? null;

  const pendingCount = activities.filter((a) => a.status === "PENDING").length;
  const earned = activities
    .filter((a) => a.status === "PAID")
    .reduce((sum, a) => sum + (a.rewardAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-emerald-100/50">
          Your green ecosystem hub — earn, hold and use HDYU.
        </p>
      </div>

      <WalletLinkCard />

      {wallet && (
        <>
          <BalanceCard address={wallet} />

          <AddTokenCard />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass card-hover rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100/40">
                  Rewards Earned
                </div>
                <Sprout size={16} className="text-emerald-400" />
              </div>
              <div className="font-display mt-2 text-2xl font-extrabold text-white">
                {earned.toLocaleString()} <span className="text-sm text-emerald-300">HDYU</span>
              </div>
              <div className="mt-1 text-xs text-emerald-100/45">
                {pendingCount > 0 ? `${pendingCount} submission${pendingCount > 1 ? "s" : ""} awaiting review` : "All submissions reviewed"}
              </div>
            </div>
            <Link href="/dashboard/rewards" className="card-hover flex flex-col justify-center rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/12 to-transparent p-6">
              <div className="font-display text-base font-bold text-white">Submit a green activity</div>
              <div className="mt-1 text-sm text-emerald-100/55">
                Gardening, farming, eco-purchases, travel — get rewarded in HDYU.
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300">
                Go to Green Rewards <ArrowRight size={15} />
              </div>
            </Link>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">Recent Activity</h2>
              <Link href="/dashboard/history" className="text-sm font-semibold text-emerald-300 hover:underline">
                View all
              </Link>
            </div>
            <TransactionList address={wallet} limit={5} />
          </div>
        </>
      )}
    </div>
  );
}
