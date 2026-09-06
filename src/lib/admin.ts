import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/** Returns the session if the caller is an authenticated ADMIN, otherwise null. */
export async function requireAdmin(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function audit(adminEmail: string, action: string, detail: string) {
  await prisma.auditLog.create({ data: { adminEmail, action, detail } });
}
