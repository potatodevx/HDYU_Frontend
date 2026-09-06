import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { generateHdyuUserId } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Invalid email address").max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[a-zA-Z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Retry on the rare userId collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const user = await prisma.user.create({
        data: { userId: generateHdyuUserId(), email: normalizedEmail, name, passwordHash },
        select: { userId: true, email: true },
      });
      return NextResponse.json({ ok: true, userId: user.userId }, { status: 201 });
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code !== "P2002") throw e;
    }
  }
  return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
}
