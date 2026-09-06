import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/admin";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    rewardAmount: z.number().positive("Reward must be positive").max(10_000_000),
    adminNote: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal("reject"),
    adminNote: z.string().trim().max(500).optional(),
  }),
]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const submission = await prisma.activitySubmission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: `Submission is already ${submission.status}` }, { status: 409 });
  }

  const data =
    parsed.data.action === "approve"
      ? {
          status: "APPROVED",
          rewardAmount: parsed.data.rewardAmount,
          adminNote: parsed.data.adminNote ?? null,
          reviewedBy: session.user.email ?? "admin",
          reviewedAt: new Date(),
        }
      : {
          status: "REJECTED",
          adminNote: parsed.data.adminNote ?? null,
          reviewedBy: session.user.email ?? "admin",
          reviewedAt: new Date(),
        };

  const updated = await prisma.activitySubmission.update({ where: { id }, data });

  await audit(
    session.user.email ?? "admin",
    parsed.data.action === "approve" ? "SUBMISSION_APPROVED" : "SUBMISSION_REJECTED",
    `submission=${id}` +
      (parsed.data.action === "approve" ? ` reward=${parsed.data.rewardAmount} HDYU` : "")
  );

  return NextResponse.json({ ok: true, submission: updated });
}
