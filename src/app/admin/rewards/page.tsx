"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  HandCoins,
  Filter,
} from "lucide-react";
import { categoryLabel, formatDate, shortAddress, cn } from "@/lib/utils";

const CLUSTER_SUFFIX =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "" : "?cluster=devnet";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const FILTERS = ["PENDING", "APPROVED", "PAID", "REJECTED", "ALL"] as const;

interface Submission {
  id: string;
  category: string;
  title: string;
  description: string;
  proofUrl: string | null;
  status: string;
  rewardAmount: number | null;
  adminNote: string | null;
  payoutTx: string | null;
  createdAt: string;
  user: { userId: string; name: string; email: string; walletAddress: string | null };
}

export default function AdminRewardsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const { data, mutate, isLoading } = useSWR(`/api/admin/submissions?status=${filter}`, fetcher, {
    refreshInterval: 20_000,
  });
  const submissions: Submission[] = data?.submissions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Reward Approvals</h1>
        <p className="mt-1 text-sm text-emerald-100/50">
          Verify activities, approve rewards, and distribute HDYU from the rewards wallet.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter size={15} className="text-emerald-100/40" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition",
              filter === f
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-white/5 text-emerald-100/50 hover:bg-white/10"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-14 text-center text-sm text-emerald-100/45">
          No {filter === "ALL" ? "" : filter.toLowerCase()} submissions.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <SubmissionCard key={s.id} submission={s} onChanged={() => mutate()} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ submission: s, onChanged }: { submission: Submission; onChanged: () => void }) {
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function review(action: "approve" | "reject") {
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/submissions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "approve"
            ? { action, rewardAmount: Number(amount), adminNote: note || undefined }
            : { action, adminNote: note || undefined }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      toast.success(action === "approve" ? `Approved — ${amount} HDYU` : "Submission rejected");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function payout() {
    setBusy("payout");
    try {
      const res = await fetch(`/api/admin/submissions/${s.id}/payout`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payout failed");
      toast.success(`Paid ${s.rewardAmount} HDYU on-chain`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payout failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-white">{s.title}</div>
          <div className="mt-1 text-xs text-emerald-100/45">
            {categoryLabel(s.category)} · {formatDate(s.createdAt)}
          </div>
          <div className="mt-1.5 text-xs text-emerald-100/55">
            <span className="font-semibold text-white">{s.user.name}</span> ({s.user.userId}) ·{" "}
            {s.user.email} ·{" "}
            {s.user.walletAddress ? (
              <span className="font-mono">{shortAddress(s.user.walletAddress, 6)}</span>
            ) : (
              <span className="font-bold text-amber-300">no wallet linked</span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-bold",
            s.status === "PENDING" && "bg-amber-400/10 text-amber-300",
            s.status === "APPROVED" && "bg-sky-400/10 text-sky-300",
            s.status === "PROCESSING" && "bg-sky-400/10 text-sky-300",
            s.status === "PAID" && "bg-emerald-400/12 text-emerald-300",
            s.status === "REJECTED" && "bg-red-400/10 text-red-300"
          )}
        >
          {s.status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-emerald-100/60">{s.description}</p>

      {s.proofUrl && (
        <a
          href={s.proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:underline"
        >
          View proof <ExternalLink size={11} />
        </a>
      )}

      {s.status === "PENDING" && (
        <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-white/5 pt-5">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-emerald-100/40">
              Reward (HDYU)
            </label>
            <input
              className="input !w-32"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="min-w-48 flex-1">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-emerald-100/40">
              Note (optional)
            </label>
            <input
              className="input"
              placeholder="Visible to the user"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button
            onClick={() => review("approve")}
            disabled={!!busy || !Number(amount)}
            className="btn-primary !py-2.5 text-sm"
          >
            {busy === "approve" ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle2 size={15} />}
            Approve
          </button>
          <button
            onClick={() => review("reject")}
            disabled={!!busy}
            className="btn-secondary !border-red-400/25 !bg-red-400/8 !py-2.5 text-sm !text-red-300"
          >
            {busy === "reject" ? <Loader2 className="animate-spin" size={15} /> : <XCircle size={15} />}
            Reject
          </button>
        </div>
      )}

      {s.status === "APPROVED" && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
          <div className="text-sm text-emerald-100/60">
            Approved for <span className="font-mono font-bold text-emerald-300">{s.rewardAmount?.toLocaleString()} HDYU</span>
            {!s.user.walletAddress && (
              <span className="ml-2 text-xs font-bold text-amber-300">— user must link a wallet first</span>
            )}
          </div>
          <button
            onClick={payout}
            disabled={!!busy || !s.user.walletAddress}
            className="btn-primary !py-2.5 text-sm"
          >
            {busy === "payout" ? <Loader2 className="animate-spin" size={15} /> : <HandCoins size={15} />}
            {busy === "payout" ? "Sending on-chain…" : "Distribute Reward"}
          </button>
        </div>
      )}

      {s.status === "PAID" && s.payoutTx && (
        <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-4 text-sm">
          <span className="font-mono font-bold text-emerald-300">+{s.rewardAmount?.toLocaleString()} HDYU paid</span>
          <a
            href={`https://solscan.io/tx/${s.payoutTx}${CLUSTER_SUFFIX}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300/80 hover:underline"
          >
            View transaction <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}
