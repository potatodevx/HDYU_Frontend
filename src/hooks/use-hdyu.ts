"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { usePrototypeAuth } from "@/components/prototype-auth";
import {
  PROTOTYPE_DATA_EVENT,
  addPrototypeActivity,
  getPrototypeActivities,
  type ActivityDraft,
  type PrototypeActivity,
} from "@/lib/prototype-storage";

// Public Devnet prototype mint. Environment variables remain optional overrides.
export const HDYU_MINT =
  process.env.NEXT_PUBLIC_HDYU_MINT?.trim() || "EsiTnsiLYidco3dakf98WVS5F1tkFyH8PRWFn86dS49F";
export const HDYU_DECIMALS = 9;

export interface HdyuTransaction {
  signature: string;
  blockTime: number | null;
  change: number;
  counterparty: string | null;
  status: "success" | "failed";
}

/** Live HDYU balance for a wallet address, refreshed every 20s. */
export function useHdyuBalance(owner: string | null | undefined) {
  const { connection } = useConnection();

  const { data, error, isLoading, mutate } = useSWR(
    owner ? ["hdyu-balance", owner, connection.rpcEndpoint] : null,
    async () => {
      const mint = new PublicKey(HDYU_MINT);
      const ata = getAssociatedTokenAddressSync(mint, new PublicKey(owner!), false, TOKEN_2022_PROGRAM_ID);
      try {
        const balance = await connection.getTokenAccountBalance(ata);
        return balance.value.uiAmount ?? 0;
      } catch {
        return 0;
      }
    },
    { refreshInterval: 20_000, revalidateOnFocus: true }
  );

  return { balance: data ?? null, error, isLoading, refresh: mutate };
}

export function useTransactions(address: string | null | undefined) {
  const { connection } = useConnection();
  const { data, error, isLoading, mutate } = useSWR(
    address ? ["hdyu-transactions", address, connection.rpcEndpoint] : null,
    async (): Promise<HdyuTransaction[]> => {
      const owner = new PublicKey(address!);
      const mint = new PublicKey(HDYU_MINT);
      const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_2022_PROGRAM_ID);
      const signatures = await connection.getSignaturesForAddress(ata, { limit: 25 });
      if (signatures.length === 0) return [];

      const parsed = await connection.getParsedTransactions(
        signatures.map((signature) => signature.signature),
        { maxSupportedTransactionVersion: 0 }
      );
      const ownerAddress = owner.toBase58();
      const mintAddress = mint.toBase58();

      return signatures.flatMap((signature, index) => {
        const transaction = parsed[index];
        if (!transaction?.meta) return [];
        const beforeBalances =
          transaction.meta.preTokenBalances?.filter((balance) => balance.mint === mintAddress) ?? [];
        const afterBalances =
          transaction.meta.postTokenBalances?.filter((balance) => balance.mint === mintAddress) ?? [];
        const before =
          beforeBalances.find((balance) => balance.owner === ownerAddress)?.uiTokenAmount.uiAmount ?? 0;
        const after =
          afterBalances.find((balance) => balance.owner === ownerAddress)?.uiTokenAmount.uiAmount ?? 0;
        const change = after - before;
        if (change === 0) return [];

        const counterparties = new Set<string>();
        for (const balance of [...beforeBalances, ...afterBalances]) {
          if (balance.owner && balance.owner !== ownerAddress) counterparties.add(balance.owner);
        }

        return [
          {
            signature: signature.signature,
            blockTime: signature.blockTime ?? null,
            change,
            counterparty: counterparties.values().next().value ?? null,
            status: signature.err ? "failed" : "success",
          } satisfies HdyuTransaction,
        ];
      });
    },
    { refreshInterval: 30_000, revalidateOnFocus: true }
  );

  return {
    transactions: data ?? [],
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useActivities() {
  const { user, isLoading: authLoading } = usePrototypeAuth();
  const [activities, setActivities] = useState<PrototypeActivity[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setActivities(user ? getPrototypeActivities(user.id) : []);
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    const initialLoad = window.setTimeout(refresh, 0);
    window.addEventListener(PROTOTYPE_DATA_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener(PROTOTYPE_DATA_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const submitActivity = useCallback(
    (draft: ActivityDraft) => {
      if (!user) throw new Error("Please sign in before submitting an activity");
      if (draft.title.trim().length < 3) throw new Error("Title is too short");
      if (draft.description.trim().length < 10) {
        throw new Error("Please describe the activity using at least 10 characters");
      }
      return addPrototypeActivity(user.id, draft);
    },
    [user]
  );

  return {
    activities,
    isLoading: authLoading || !loaded,
    error: null,
    refresh,
    submitActivity,
  };
}
