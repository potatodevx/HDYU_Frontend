import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { ACTIVITY_CATEGORIES } from "@/lib/utils";

const schema = z.object({
  category: z.enum(ACTIVITY_CATEGORIES.map((c) => c.value) as [string, ...string[]]),
  title: z.string().trim().min(3, "Title is too short").max(120),
  description: z.string().trim().min(10, "Please describe the activity (min 10 characters)").max(2000),
  proofUrl: z.string().trim().url("Proof must be a valid link").max(500).optional().or(z.literal("")),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activities = await prisma.activitySubmission.findMany({
    where: { userDbId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ activities });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`activity:${session.user.id}`, 10, 60 * 60_000)) {
    return NextResponse.json({ error: "Submission limit reached. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const activity = await prisma.activitySubmission.create({
    data: {
      userDbId: session.user.id,
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description,
      proofUrl: parsed.data.proofUrl || null,
    },
  });

  return NextResponse.json({ ok: true, activity }, { status: 201 });
}
