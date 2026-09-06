"use client";

import useSWR from "swr";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";

export const HDYU_MINT = process.env.NEXT_PUBLIC_HDYU_MINT || null;
export const HDYU_DECIMALS = 9;

/** Live HDYU balance for a wallet address, refreshed every 20s. */
export function useHdyuBalance(owner: string | null | undefined) {
  const { connection } = useConnection();

  const { data, error, isLoading, mutate } = useSWR(
    owner && HDYU_MINT ? ["hdyu-balance", owner] : null,
    async () => {
      const mint = new PublicKey(HDYU_MINT!);
      const ata = getAssociatedTokenAddressSync(mint, new PublicKey(owner!), false, TOKEN_2022_PROGRAM_ID);
      try {
        const balance = await connection.getTokenAccountBalance(ata);
        return balance.value.uiAmount ?? 0;
      } catch {
        // Token account doesn't exist yet — balance is 0.
        return 0;
      }
    },
    { refreshInterval: 20_000, revalidateOnFocus: true }
  );

  return { balance: data ?? null, error, isLoading, refresh: mutate };
}

const jsonFetcher = (url: string) =>
  fetch(url).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? "Request failed");
    return data;
  });

export function useTransactions(address: string | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    address ? `/api/transactions?address=${address}` : null,
    jsonFetcher,
    { refreshInterval: 30_000 }
  );
  return {
    transactions: (data?.transactions ?? []) as {
      signature: string;
      blockTime: number | null;
      change: number;
      counterparty: string | null;
      status: string;
    }[],
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useActivities() {
  const { data, error, isLoading, mutate } = useSWR("/api/activities", jsonFetcher);
  return {
    activities: (data?.activities ?? []) as {
      id: string;
      category: string;
      title: string;
      description: string;
      status: string;
      rewardAmount: number | null;
      adminNote: string | null;
      payoutTx: string | null;
      createdAt: string;
    }[],
    error,
    isLoading,
    refresh: mutate,
  };
}
