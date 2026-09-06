import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [totalUsers, walletsLinked, pending, approved, paid, rejected, paidAggregate, recentPayouts, recentLogs] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { walletAddress: { not: null } } }),
      prisma.activitySubmission.count({ where: { status: "PENDING" } }),
      prisma.activitySubmission.count({ where: { status: "APPROVED" } }),
      prisma.activitySubmission.count({ where: { status: "PAID" } }),
      prisma.activitySubmission.count({ where: { status: "REJECTED" } }),
      prisma.activitySubmission.aggregate({
        where: { status: "PAID" },
        _sum: { rewardAmount: true },
      }),
      prisma.activitySubmission.findMany({
        where: { status: "PAID" },
        orderBy: { paidAt: "desc" },
        take: 8,
        include: { user: { select: { userId: true, name: true } } },
      }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    ]);

  return NextResponse.json({
    totalUsers,
    walletsLinked,
    submissions: { pending, approved, paid, rejected },
    totalRewardsPaid: paidAggregate._sum.rewardAmount ?? 0,
    recentPayouts,
    recentLogs,
  });
}
