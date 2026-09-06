import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@hdyu.local";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      userId: "HDYU-ADMIN1",
      email,
      name: "HDYU Admin",
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });
  console.log(`Admin created: ${email}`);
  console.log("CHANGE THE ADMIN PASSWORD BEFORE PRODUCTION (ADMIN_PASSWORD env var).");
}

main().finally(() => prisma.$disconnect());
