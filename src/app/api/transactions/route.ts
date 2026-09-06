import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { authOptions } from "@/lib/auth";
import { getServerConnection, getMintAddress } from "@/lib/solana";

export interface HdyuTransaction {
  signature: string;
  blockTime: number | null;
  change: number; // positive = received, negative = sent
  counterparty: string | null;
  status: "success" | "failed";
}

// Small in-memory cache to protect the RPC from repeated dashboard loads.
const cache = new Map<string, { at: number; data: HdyuTransaction[] }>();
const CACHE_TTL_MS = 20_000;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const address = new URL(req.url).searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  const mint = getMintAddress();
  if (!mint) return NextResponse.json({ transactions: [], note: "Token not configured" });

  let owner: PublicKey;
  try {
    owner = new PublicKey(address);
  } catch {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const cached = cache.get(address);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ transactions: cached.data });
  }

  const connection = getServerConnection();
  const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_2022_PROGRAM_ID);

  try {
    const signatures = await connection.getSignaturesForAddress(ata, { limit: 25 });
    if (signatures.length === 0) {
      cache.set(address, { at: Date.now(), data: [] });
      return NextResponse.json({ transactions: [] });
    }

    const parsed = await connection.getParsedTransactions(
      signatures.map((s) => s.signature),
      { maxSupportedTransactionVersion: 0 }
    );

    const mintStr = mint.toBase58();
    const transactions: HdyuTransaction[] = [];

    for (let i = 0; i < signatures.length; i++) {
      const sig = signatures[i];
      const tx = parsed[i];
      if (!tx?.meta) continue;

      const pre = tx.meta.preTokenBalances?.filter((b) => b.mint === mintStr) ?? [];
      const post = tx.meta.postTokenBalances?.filter((b) => b.mint === mintStr) ?? [];

      const ownerStr = owner.toBase58();
      const preMine = pre.find((b) => b.owner === ownerStr);
      const postMine = post.find((b) => b.owner === ownerStr);
      const before = preMine?.uiTokenAmount.uiAmount ?? 0;
      const after = postMine?.uiTokenAmount.uiAmount ?? 0;
      const change = after - before;
      if (change === 0) continue;

      // The counterparty is the other owner whose HDYU balance moved.
      const others = new Set<string>();
      for (const b of [...pre, ...post]) {
        if (b.owner && b.owner !== ownerStr) others.add(b.owner);
      }

      transactions.push({
        signature: sig.signature,
        blockTime: sig.blockTime ?? null,
        change,
        counterparty: others.size > 0 ? [...others][0] : null,
        status: sig.err ? "failed" : "success",
      });
    }

    cache.set(address, { at: Date.now(), data: transactions });
    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json(
      { error: "Could not load transaction history. RPC may be rate-limited — try again shortly." },
      { status: 502 }
    );
  }
}
