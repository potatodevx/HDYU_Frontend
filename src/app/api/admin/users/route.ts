import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const params = new URL(req.url).searchParams;
  const query = params.get("q")?.trim();
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const pageSize = 25;

  const where = query
    ? {
        OR: [
          { email: { contains: query } },
          { name: { contains: query } },
          { userId: { contains: query.toUpperCase() } },
          { walletAddress: { contains: query } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        role: true,
        walletAddress: true,
        walletVerifiedAt: true,
        createdAt: true,
        _count: { select: { activities: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, pageSize });
}
