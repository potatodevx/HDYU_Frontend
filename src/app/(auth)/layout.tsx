import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Leaf, ShieldCheck, HandCoins } from "lucide-react";
import { authOptions } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-forest-900 p-12 lg:flex">
        <div className="grid-bg absolute inset-0" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <Image src="/logo.png" alt="HDYU" width={38} height={38} className="rounded-full" />
          <span className="font-display text-xl font-bold text-white">HDYU</span>
        </Link>
        <div className="relative">
          <h1 className="font-display max-w-md text-3xl font-extrabold leading-tight text-white">
            Turn green actions into on-chain rewards.
          </h1>
          <div className="mt-8 space-y-4">
            {[
              { icon: Leaf, text: "Earn HDYU for verified green activities" },
              { icon: ShieldCheck, text: "Non-custodial — your keys stay yours" },
              { icon: HandCoins, text: "Send, receive and redeem across the ecosystem" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-emerald-100/70">
                <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                  <f.icon size={16} />
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-emerald-100/40">
          © {new Date().getFullYear()} HDYU · Solana Token-2022
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
