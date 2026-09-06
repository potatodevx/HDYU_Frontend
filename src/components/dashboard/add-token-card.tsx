"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Copy, ExternalLink, Wallet, Info } from "lucide-react";
import { HDYU_MINT } from "@/hooks/use-hdyu";
import { shortAddress } from "@/lib/utils";

const CLUSTER_SUFFIX =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "" : "?cluster=devnet";

/**
 * "Add HDYU to wallet" helper. Solana wallets (Phantom/Solflare) list a token
 * automatically as soon as the wallet holds a balance — there is no manual
 * "add token" API like on Ethereum. This card gives users the mint address to
 * verify the token and explains the flow.
 */
export function AddTokenCard() {
  if (!HDYU_MINT) return null;

  function copyMint() {
    navigator.clipboard.writeText(HDYU_MINT!);
    toast.success("HDYU mint address copied");
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Image src="/logo.png" alt="HDYU" width={40} height={40} className="rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-white">HDYU Token</span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Token-2022
              </span>
            </div>
            <button
              onClick={copyMint}
              className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-xs text-emerald-100/50 transition hover:text-emerald-300"
              title="Copy mint address"
            >
              {shortAddress(HDYU_MINT, 8)} <Copy size={11} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={copyMint} className="btn-primary !py-2 text-sm">
            <Wallet size={15} /> Add to Wallet
          </button>
          <a
            href={`https://solscan.io/token/${HDYU_MINT}${CLUSTER_SUFFIX}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !py-2 text-sm"
          >
            <ExternalLink size={14} /> Explorer
          </a>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-white/4 px-4 py-3 text-xs leading-relaxed text-emerald-100/55">
        <Info size={14} className="mt-0.5 shrink-0 text-emerald-400" />
        <span>
          Phantom and Solflare list HDYU <strong className="text-emerald-200">automatically</strong> as
          soon as your wallet receives any amount — no manual adding needed. The button copies the
          official mint address so you can verify you&apos;re holding the genuine HDYU token
          {process.env.NEXT_PUBLIC_SOLANA_CLUSTER !== "mainnet-beta" && (
            <> (make sure Phantom is set to <strong className="text-emerald-200">Devnet</strong> in
            Settings → Developer Settings)</>
          )}
          .
        </span>
      </div>
    </div>
  );
}
