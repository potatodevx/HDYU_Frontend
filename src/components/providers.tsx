"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { Toaster } from "sonner";
import { PrototypeAuthProvider } from "@/components/prototype-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => {
    const configuredEndpoint = process.env.NEXT_PUBLIC_RPC_URL?.trim();
    if (configuredEndpoint) return configuredEndpoint;
    return clusterApiUrl(
      process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "mainnet-beta" : "devnet"
    );
  }, []);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <PrototypeAuthProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#0a2a1c",
                  border: "1px solid rgba(110,231,183,0.2)",
                  color: "#e7f3ec",
                },
              }}
            />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </PrototypeAuthProvider>
  );
}
