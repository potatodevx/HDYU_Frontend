import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWalletMessage } from "@/lib/wallet-message";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  address: z.string().min(32).max(50),
  signature: z.string().min(64).max(150), // base58-encoded ed25519 signature
});

/** Link a Solana wallet to the logged-in HDYU account after verifying ownership. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`wallet-link:${clientIp(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { address, signature } = parsed.data;

  let pubkey: PublicKey;
  try {
    pubkey = new PublicKey(address);
  } catch {
    return NextResponse.json({ error: "Invalid Solana address" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.walletNonce) {
    return NextResponse.json({ error: "No pending verification. Request a new nonce." }, { status: 400 });
  }

  const message = new TextEncoder().encode(buildWalletMessage(user.userId, user.walletNonce));
  let verified = false;
  try {
    verified = nacl.sign.detached.verify(message, bs58.decode(signature), pubkey.toBytes());
  } catch {
    verified = false;
  }
  if (!verified) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const taken = await prisma.user.findUnique({ where: { walletAddress: address } });
  if (taken && taken.id !== user.id) {
    return NextResponse.json(
      { error: "This wallet is already linked to another HDYU account." },
      { status: 409 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { walletAddress: address, walletVerifiedAt: new Date(), walletNonce: null },
  });

  return NextResponse.json({ ok: true, address });
}

/** Unlink the wallet from the current account. */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: null, walletVerifiedAt: null, walletNonce: null },
  });
  return NextResponse.json({ ok: true });
}
