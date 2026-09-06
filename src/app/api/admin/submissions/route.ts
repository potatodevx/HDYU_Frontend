import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = new URL(req.url).searchParams.get("status");
  const where = status && status !== "ALL" ? { status } : {};

  const submissions = await prisma.activitySubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { userId: true, name: true, email: true, walletAddress: true } },
    },
  });

  return NextResponse.json({ submissions });
}
