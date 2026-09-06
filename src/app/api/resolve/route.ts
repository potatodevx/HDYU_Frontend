import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidSolanaAddress } from "@/lib/solana";

/**
 * Resolves a recipient for the send form:
 *  - a raw Solana address is returned as-is
 *  - an HDYU User ID (e.g. HDYU-482913) resolves to that user's linked wallet
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  if (isValidSolanaAddress(q)) {
    return NextResponse.json({ address: q, type: "address" });
  }

  const user = await prisma.user.findFirst({
    where: { userId: q.toUpperCase() },
    select: { userId: true, name: true, walletAddress: true },
  });

  if (!user) {
    return NextResponse.json({ error: "No HDYU user found with that ID" }, { status: 404 });
  }
  if (!user.walletAddress) {
    return NextResponse.json({ error: "That user has not linked a wallet yet" }, { status: 400 });
  }

  return NextResponse.json({
    address: user.walletAddress,
    type: "user",
    userId: user.userId,
    name: user.name,
  });
}
