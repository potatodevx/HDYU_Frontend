import { NextResponse } from "next/server";
import { PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/admin";
import { getServerConnection, getMintAddress, getRewardsKeypair, HDYU_DECIMALS } from "@/lib/solana";

/**
 * Executes an approved reward payout on-chain, signed by the rewards hot wallet.
 * Double-payout protection: the submission is atomically moved
 * APPROVED -> PROCESSING before any transaction is sent; only one request can win.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const mint = getMintAddress();
  if (!mint) {
    return NextResponse.json(
      { error: "HDYU mint is not configured (NEXT_PUBLIC_HDYU_MINT)." },
      { status: 500 }
    );
  }

  const submission = await prisma.activitySubmission.findUnique({
    where: { id },
    include: { user: { select: { walletAddress: true, userId: true } } },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (!submission.rewardAmount || submission.rewardAmount <= 0) {
    return NextResponse.json({ error: "Submission has no approved reward amount" }, { status: 400 });
  }
  if (!submission.user.walletAddress) {
    return NextResponse.json(
      { error: "User has not linked a wallet — cannot pay out." },
      { status: 400 }
    );
  }

  // Atomic claim: only proceeds if status is still APPROVED.
  const claimed = await prisma.activitySubmission.updateMany({
    where: { id, status: "APPROVED" },
    data: { status: "PROCESSING" },
  });
  if (claimed.count === 0) {
    return NextResponse.json(
      { error: `Payout not available (status: ${submission.status}).` },
      { status: 409 }
    );
  }

  try {
    const connection = getServerConnection();
    const rewards = getRewardsKeypair();
    const recipient = new PublicKey(submission.user.walletAddress);

    const fromAta = getAssociatedTokenAddressSync(mint, rewards.publicKey, false, TOKEN_2022_PROGRAM_ID);
    const toAta = getAssociatedTokenAddressSync(mint, recipient, false, TOKEN_2022_PROGRAM_ID);
    const rawAmount = BigInt(Math.round(submission.rewardAmount * 10 ** HDYU_DECIMALS));

    const tx = new Transaction().add(
      createAssociatedTokenAccountIdempotentInstruction(
        rewards.publicKey, toAta, recipient, mint, TOKEN_2022_PROGRAM_ID
      ),
      createTransferCheckedInstruction(
        fromAta, mint, toAta, rewards.publicKey, rawAmount, HDYU_DECIMALS, [], TOKEN_2022_PROGRAM_ID
      )
    );

    const signature = await sendAndConfirmTransaction(connection, tx, [rewards], {
      commitment: "confirmed",
      maxRetries: 3,
    });

    const updated = await prisma.activitySubmission.update({
      where: { id },
      data: { status: "PAID", payoutTx: signature, paidAt: new Date() },
    });

    await audit(
      session.user.email ?? "admin",
      "REWARD_PAID",
      `submission=${id} user=${submission.user.userId} amount=${submission.rewardAmount} HDYU tx=${signature}`
    );

    return NextResponse.json({ ok: true, signature, submission: updated });
  } catch (e: unknown) {
    // Roll back to APPROVED so the payout can be retried after fixing the cause.
    await prisma.activitySubmission.update({ where: { id }, data: { status: "APPROVED" } });
    const message = e instanceof Error ? e.message : "Unknown error";
    await audit(session.user.email ?? "admin", "REWARD_PAYOUT_FAILED", `submission=${id} error=${message}`);
    return NextResponse.json(
      {
        error:
          "Payout transaction failed. Check that the rewards wallet holds enough HDYU and SOL for fees. " +
          `Details: ${message}`,
      },
      { status: 502 }
    );
  }
}
