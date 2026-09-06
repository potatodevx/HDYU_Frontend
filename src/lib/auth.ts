import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbId = user?.id ?? token.dbId;
      if (dbId) {
        // Re-read on each JWT refresh so wallet linking / role changes
        // propagate to the session without forcing re-login.
        const dbUser = await prisma.user.findUnique({
          where: { id: dbId as string },
          select: { id: true, userId: true, role: true, walletAddress: true, name: true },
        });
        if (dbUser) {
          token.dbId = dbUser.id;
          token.hdyuId = dbUser.userId;
          token.role = dbUser.role;
          token.walletAddress = dbUser.walletAddress;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.dbId as string;
        session.user.hdyuId = token.hdyuId as string;
        session.user.role = token.role as string;
        session.user.walletAddress = (token.walletAddress as string | null) ?? null;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
  },
};
