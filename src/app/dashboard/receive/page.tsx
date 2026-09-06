"use client";

import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { WalletLinkCard } from "@/components/dashboard/wallet-link";
import { AddTokenCard } from "@/components/dashboard/add-token-card";
import { usePrototypeAuth } from "@/components/prototype-auth";

export default function ReceivePage() {
  const { user } = usePrototypeAuth();
  const wallet = user?.walletAddress ?? null;
  const hdyuId = user?.hdyuId;

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Receive HDYU</h1>
        <p className="mt-1 text-sm text-emerald-100/50">
          Share your address or HDYU ID — anyone in the ecosystem can send you HDYU.
        </p>
      </div>

      {!wallet ? (
        <WalletLinkCard />
      ) : (
        <>
        <AddTokenCard />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass flex flex-col items-center rounded-3xl p-8">
            <div className="rounded-2xl bg-white p-4">
              <QRCodeSVG value={wallet} size={210} level="M" marginSize={1} />
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100/40">
              <Download size={13} /> Scan to get your wallet address
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-100/40">
                Your Solana wallet address
              </div>
              <div className="mt-2 break-all font-mono text-sm text-white">{wallet}</div>
              <button onClick={() => copy(wallet, "Address")} className="btn-secondary mt-4 !py-2 text-sm">
                <Copy size={14} /> Copy address
              </button>
            </div>

            {hdyuId && (
              <div className="glass rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100/40">
                  Your HDYU User ID
                </div>
                <div className="font-display mt-2 text-2xl font-extrabold text-emerald-300">{hdyuId}</div>
                <p className="mt-1 text-xs text-emerald-100/45">
                  Other HDYU users can send to this ID directly — no long address needed.
                </p>
                <button onClick={() => copy(hdyuId, "HDYU ID")} className="btn-secondary mt-4 !py-2 text-sm">
                  <Copy size={14} /> Copy ID
                </button>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
