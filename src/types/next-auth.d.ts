import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hdyuId: string;
      role: string;
      walletAddress: string | null;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbId?: string;
    hdyuId?: string;
    role?: string;
    walletAddress?: string | null;
  }
}
