"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Loader2, Send, User, AlertTriangle } from "lucide-react";
import { WalletLinkCard } from "@/components/dashboard/wallet-link";
import { useHdyuBalance, HDYU_MINT, HDYU_DECIMALS } from "@/hooks/use-hdyu";
import { formatHdyu, shortAddress } from "@/lib/utils";
import { usePrototypeAuth } from "@/components/prototype-auth";
import { findPrototypeUserByHdyuId } from "@/lib/prototype-storage";

const CLUSTER_SUFFIX =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "" : "?cluster=devnet";

interface Resolved {
  address: string;
  type: "address" | "user";
  userId?: string;
  name?: string;
}

export default function SendPage() {
  const { user } = usePrototypeAuth();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const linked = user?.walletAddress ?? null;
  const { balance, refresh } = useHdyuBalance(linked);

  const [recipientInput, setRecipientInput] = useState("");
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [resolving, setResolving] = useState(false);
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [lastSig, setLastSig] = useState<string | null>(null);

  const connectedMatchesLinked = publicKey && linked && publicKey.toBase58() === linked;

  async function resolveRecipient() {
    const q = recipientInput.trim();
    if (!q) return;
    setResolving(true);
    setResolved(null);
    try {
      let result: Resolved;
      try {
        result = { address: new PublicKey(q).toBase58(), type: "address" };
      } catch {
        const matchedUser = findPrototypeUserByHdyuId(q);
        if (!matchedUser) throw new Error("No HDYU user found with that ID on this browser");
        if (!matchedUser.walletAddress) throw new Error("That user has not linked a wallet yet");
        result = {
          address: matchedUser.walletAddress,
          type: "user",
          userId: matchedUser.hdyuId,
          name: matchedUser.name,
        };
      }
      if (result.address === linked) throw new Error("You cannot send HDYU to yourself");
      setResolved(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Recipient lookup failed");
    } finally {
      setResolving(false);
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!HDYU_MINT) return toast.error("HDYU token is not configured yet.");
    if (!publicKey) return toast.error("Connect your wallet first.");
    if (!connectedMatchesLinked)
      return toast.error("The connected wallet does not match your linked wallet.");
    if (!resolved) return toast.error("Verify the recipient first.");

    const value = Number(amount);
    if (!value || value <= 0) return toast.error("Enter a valid amount.");
    if (balance !== null && value > balance) return toast.error("Amount exceeds your balance.");

    setSending(true);
    setLastSig(null);
    try {
      const mint = new PublicKey(HDYU_MINT);
      const recipient = new PublicKey(resolved.address);
      const fromAta = getAssociatedTokenAddressSync(mint, publicKey, false, TOKEN_2022_PROGRAM_ID);
      const toAta = getAssociatedTokenAddressSync(mint, recipient, false, TOKEN_2022_PROGRAM_ID);
      const rawAmount = BigInt(Math.round(value * 10 ** HDYU_DECIMALS));

      const tx = new Transaction().add(
        createAssociatedTokenAccountIdempotentInstruction(
          publicKey, toAta, recipient, mint, TOKEN_2022_PROGRAM_ID
        ),
        createTransferCheckedInstruction(
          fromAta, mint, toAta, publicKey, rawAmount, HDYU_DECIMALS, [], TOKEN_2022_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(tx, connection);
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature, ...latest }, "confirmed");

      setLastSig(signature);
      setRecipientInput("");
      setResolved(null);
      setAmount("");
      refresh();
      toast.success(`Sent ${formatHdyu(value)} HDYU`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      if (msg.toLowerCase().includes("insufficient") && msg.toLowerCase().includes("lamport")) {
        toast.error("Not enough SOL in your wallet to pay the network fee (~0.001 SOL needed).");
      } else if (msg.includes("User rejected")) {
        toast.error("Transaction cancelled in wallet.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Send HDYU</h1>
        <p className="mt-1 text-sm text-emerald-100/50">
          Transfer HDYU to another HDYU user or any Solana wallet. Signed securely in your own wallet.
        </p>
      </div>

      {!linked ? (
        <WalletLinkCard />
      ) : (
        <>
          {!connectedMatchesLinked && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/8 p-4 text-sm text-amber-200/90">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                Connect the wallet linked to your account ({shortAddress(linked, 6)}) to send HDYU.
                <div className="mt-2"><WalletLinkCard /></div>
              </div>
            </div>
          )}

          <form onSubmit={onSend} className="glass space-y-5 rounded-3xl p-7">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">
                Recipient — HDYU User ID or Solana address
              </label>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="HDYU-123456 or wallet address"
                  value={recipientInput}
                  onChange={(e) => {
                    setRecipientInput(e.target.value);
                    setResolved(null);
                  }}
                />
                <button
                  type="button"
                  onClick={resolveRecipient}
                  disabled={resolving || !recipientInput.trim()}
                  className="btn-secondary shrink-0 !px-4 !py-2 text-sm"
                >
                  {resolving ? <Loader2 className="animate-spin" size={15} /> : "Verify"}
                </button>
              </div>
              {resolved && (
                <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-emerald-400/8 px-3.5 py-2.5 text-sm text-emerald-200">
                  {resolved.type === "user" ? <User size={15} /> : <CheckCircle2 size={15} />}
                  {resolved.type === "user"
                    ? `${resolved.name} (${resolved.userId}) — ${shortAddress(resolved.address, 6)}`
                    : `Valid address: ${shortAddress(resolved.address, 8)}`}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-100/60">Amount</label>
                {balance !== null && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(balance))}
                    className="text-xs font-bold text-emerald-300 hover:underline"
                  >
                    Max: {formatHdyu(balance)} HDYU
                  </button>
                )}
              </div>
              <input
                className="input"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button
              className="btn-primary w-full !py-3"
              disabled={sending || !resolved || !amount || !connectedMatchesLinked}
            >
              {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={16} />}
              {sending ? "Confirm in your wallet…" : "Send HDYU"}
            </button>

            <p className="text-center text-xs text-emerald-100/40">
              A small SOL network fee (≈0.001 SOL) applies. You will approve this transaction in your wallet.
            </p>
          </form>

          {lastSig && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-400/25 bg-emerald-400/8 px-5 py-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-emerald-200">
                <CheckCircle2 size={18} className="text-emerald-400" />
                Transfer confirmed on-chain
              </div>
              <a
                href={`https://solscan.io/tx/${lastSig}${CLUSTER_SUFFIX}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300 hover:underline"
              >
                View <ExternalLink size={13} />
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
