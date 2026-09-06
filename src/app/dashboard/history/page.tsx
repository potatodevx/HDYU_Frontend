"use client";

import { useSession } from "next-auth/react";
import { WalletLinkCard } from "@/components/dashboard/wallet-link";
import { TransactionList } from "@/components/dashboard/tx-list";

export default function HistoryPage() {
  const { data: session } = useSession();
  const wallet = session?.user.walletAddress ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Transaction History</h1>
        <p className="mt-1 text-sm text-emerald-100/50">
          Your on-chain HDYU transfers. Click any entry to view it on Solscan.
        </p>
      </div>

      {!wallet ? <WalletLinkCard /> : <TransactionList address={wallet} />}
    </div>
  );
}
