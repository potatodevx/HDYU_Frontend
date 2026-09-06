import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";

export const HDYU_DECIMALS = 9;

export function getCluster(): "devnet" | "mainnet-beta" {
  return process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "mainnet-beta" : "devnet";
}

export function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(getCluster());
}

let _connection: Connection | null = null;
export function getServerConnection(): Connection {
  if (!_connection) _connection = new Connection(getRpcUrl(), "confirmed");
  return _connection;
}

export function getMintAddress(): PublicKey | null {
  const raw = process.env.NEXT_PUBLIC_HDYU_MINT;
  if (!raw) return null;
  try {
    return new PublicKey(raw);
  } catch {
    return null;
  }
}

/** Loads the rewards hot-wallet keypair used for admin payout signing (server only). */
export function getRewardsKeypair(): Keypair {
  const secret = process.env.REWARDS_WALLET_SECRET;
  if (secret && secret.trim().length > 0) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
  }
  const filePath = process.env.REWARDS_WALLET_KEYPAIR_PATH;
  if (filePath) {
    const resolved = path.resolve(/* turbopackIgnore: true */ process.cwd(), filePath);
    if (fs.existsSync(resolved)) {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(resolved, "utf-8"))));
    }
  }
  throw new Error(
    "Rewards wallet not configured. Set REWARDS_WALLET_SECRET (JSON array) or REWARDS_WALLET_KEYPAIR_PATH."
  );
}

export function explorerTxUrl(signature: string): string {
  const suffix = getCluster() === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/tx/${signature}${suffix}`;
}

export function explorerAddressUrl(address: string): string {
  const suffix = getCluster() === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/account/${address}${suffix}`;
}

export function isValidSolanaAddress(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}
