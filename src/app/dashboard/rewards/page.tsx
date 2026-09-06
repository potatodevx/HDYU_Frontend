"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sprout, ExternalLink, Clock, CheckCircle2, XCircle, Coins } from "lucide-react";
import { useActivities } from "@/hooks/use-hdyu";
import { ACTIVITY_CATEGORIES, categoryLabel, formatDate } from "@/lib/utils";
import { WalletLinkCard } from "@/components/dashboard/wallet-link";
import { usePrototypeAuth } from "@/components/prototype-auth";

const CLUSTER_SUFFIX =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "" : "?cluster=devnet";

const STATUS_UI: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: { label: "Under Review", className: "bg-amber-400/10 text-amber-300", icon: Clock },
  APPROVED: { label: "Approved — payout soon", className: "bg-sky-400/10 text-sky-300", icon: CheckCircle2 },
  PROCESSING: { label: "Payout processing", className: "bg-sky-400/10 text-sky-300", icon: Loader2 },
  PAID: { label: "Reward Paid", className: "bg-emerald-400/12 text-emerald-300", icon: Coins },
  REJECTED: { label: "Not Approved", className: "bg-red-400/10 text-red-300", icon: XCircle },
};

export default function RewardsPage() {
  const { user } = usePrototypeAuth();
  const { activities, submitActivity, isLoading } = useActivities();
  const [form, setForm] = useState({ category: "GREEN_ACTIVITY", title: "", description: "", proofUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  const wallet = user?.walletAddress ?? null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      submitActivity(form);
      toast.success("Activity submitted for review");
      setForm({ category: "GREEN_ACTIVITY", title: "", description: "", proofUrl: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Green Rewards</h1>
        <p className="mt-1 text-sm text-emerald-100/50">
          Submit a verified green activity. Once approved, HDYU is sent to your wallet from the
          rewards treasury.
        </p>
      </div>

      {!wallet && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/8 px-5 py-4 text-sm text-amber-200/90">
            Link your wallet first — approved rewards are paid directly to your Solana wallet.
          </div>
          <WalletLinkCard />
        </div>
      )}

      <form onSubmit={onSubmit} className="glass space-y-5 rounded-3xl p-7">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
            <Sprout size={19} />
          </div>
          <h2 className="font-display text-lg font-bold text-white">Submit an activity</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-forest-900">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">Title</label>
            <input
              className="input"
              placeholder="e.g. Planted 5 trees in my community"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              minLength={3}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">Description</label>
          <textarea
            className="input min-h-28 resize-y"
            placeholder="Describe what you did, when and where. The more detail, the faster the review."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            minLength={10}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">
            Proof link <span className="font-normal text-emerald-100/35">(optional — photo/video URL)</span>
          </label>
          <input
            className="input"
            type="url"
            placeholder="https://…"
            value={form.proofUrl}
            onChange={(e) => setForm({ ...form, proofUrl: e.target.value })}
          />
        </div>

        <button className="btn-primary !py-3" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" size={17} /> : <Sprout size={16} />}
          Submit for Review
        </button>
      </form>

      <div>
        <h2 className="font-display mb-3 text-lg font-bold text-white">My Submissions</h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass h-24 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="glass rounded-2xl px-6 py-10 text-center text-sm text-emerald-100/45">
            No submissions yet — your first green activity is waiting.
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const ui = STATUS_UI[a.status] ?? STATUS_UI.PENDING;
              return (
                <div key={a.id} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{a.title}</div>
                      <div className="mt-1 text-xs text-emerald-100/45">
                        {categoryLabel(a.category)} · {formatDate(a.createdAt)}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${ui.className}`}>
                      <ui.icon size={12} className={a.status === "PROCESSING" ? "animate-spin" : ""} />
                      {ui.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-emerald-100/60">{a.description}</p>
                  {a.status === "PENDING" && a.rewardAmount ? (
                    <div className="mt-3 font-mono text-sm font-bold text-emerald-300">
                      Estimated reward: {a.rewardAmount.toLocaleString()} HDYU
                    </div>
                  ) : null}
                  {(a.status === "PAID" || a.status === "APPROVED") && a.rewardAmount ? (
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                      <span className="font-mono font-bold text-emerald-300">
                        +{a.rewardAmount.toLocaleString()} HDYU
                      </span>
                      {a.payoutTx && (
                        <a
                          href={`https://solscan.io/tx/${a.payoutTx}${CLUSTER_SUFFIX}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300/80 hover:underline"
                        >
                          View payout <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  ) : null}
                  {a.adminNote && (
                    <div className="mt-3 rounded-xl bg-white/4 px-4 py-2.5 text-xs text-emerald-100/55">
                      <span className="font-bold text-emerald-100/70">Review note:</span> {a.adminNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
