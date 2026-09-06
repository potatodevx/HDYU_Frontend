"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import nacl from "tweetnacl";
import { toast } from "sonner";
import { Loader2, Link2, ShieldCheck, Unlink } from "lucide-react";
import { shortAddress } from "@/lib/utils";
import { usePrototypeAuth } from "@/components/prototype-auth";
import { findPrototypeUserByWallet } from "@/lib/prototype-storage";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

/**
 * Prototype linking flow: connect -> sign -> verify locally -> save to this browser.
 */
export function WalletLinkCard() {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { user, updateUser } = usePrototypeAuth();
  const [busy, setBusy] = useState(false);

  const linkedAddress = user?.walletAddress ?? null;
  const connectedAddress = publicKey?.toBase58() ?? null;

  async function linkWallet() {
    if (!connectedAddress || !signMessage) {
      toast.error("Connect a wallet that supports message signing.");
      return;
    }
    setBusy(true);
    try {
      const alreadyLinked = findPrototypeUserByWallet(connectedAddress);
      if (alreadyLinked && alreadyLinked.email !== user?.email) {
        throw new Error("This wallet is already linked to another local prototype account.");
      }
      const message = new TextEncoder().encode(
        `HDYU prototype wallet verification\nHDYU ID: ${user?.hdyuId}\nWallet: ${connectedAddress}`
      );
      const signature = await signMessage(message);
      if (!publicKey || !nacl.sign.detached.verify(message, signature, publicKey.toBytes())) {
        throw new Error("Wallet signature verification failed");
      }
      updateUser({ walletAddress: connectedAddress });
      toast.success("Wallet linked to your HDYU account");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Wallet linking failed");
    } finally {
      setBusy(false);
    }
  }

  async function unlinkWallet() {
    setBusy(true);
    try {
      updateUser({ walletAddress: null });
      await disconnect().catch(() => {});
      toast.success("Wallet unlinked");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unlink failed");
    } finally {
      setBusy(false);
    }
  }

  // Already linked
  if (linkedAddress) {
    return (
      <div className="glass flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Wallet linked & verified</div>
            <div className="mt-0.5 font-mono text-xs text-emerald-100/50">{shortAddress(linkedAddress, 8)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WalletMultiButton />
          <button onClick={unlinkWallet} disabled={busy} className="btn-secondary !py-2 text-xs">
            <Unlink size={14} /> Unlink
          </button>
        </div>
      </div>
    );
  }

  // Not linked yet
  return (
    <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-400/15 p-2.5 text-emerald-300">
          <Link2 size={20} />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-white">Connect your Solana wallet</h3>
          <p className="mt-0.5 text-sm text-emerald-100/55">
            Link Phantom or Solflare to receive rewards and send HDYU. Your keys never leave your wallet.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <WalletMultiButton />
        {connectedAddress && (
          <button onClick={linkWallet} disabled={busy} className="btn-primary !py-2.5">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            Verify & Link {shortAddress(connectedAddress)}
          </button>
        )}
      </div>
      <p className="mt-4 text-xs text-emerald-100/40">
        Verification asks you to sign a message — it&apos;s free and does not send a transaction.
      </p>
    </div>
  );
}
