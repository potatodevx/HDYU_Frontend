"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  Download,
  History,
  Sprout,
  LogOut,
  Menu,
  X,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePrototypeAuth } from "@/components/prototype-auth";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/send", label: "Send", icon: Send },
  { href: "/dashboard/receive", label: "Receive", icon: Download },
  { href: "/dashboard/rewards", label: "Green Rewards", icon: Sprout },
  { href: "/dashboard/history", label: "History", icon: History },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = usePrototypeAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hdyuId = user?.hdyuId;

  function copyId() {
    if (!hdyuId) return;
    navigator.clipboard.writeText(hdyuId);
    toast.success("HDYU ID copied");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-6 py-6">
        <Image src="/logo.png" alt="HDYU" width={32} height={32} className="rounded-full" />
        <span className="font-display text-lg font-bold text-white">HDYU</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-emerald-400/12 text-emerald-300"
                  : "text-emerald-100/55 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        {hdyuId && (
          <button
            onClick={copyId}
            className="mb-3 flex w-full items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5 text-left transition hover:bg-white/10"
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/40">
                Your HDYU ID
              </div>
              <div className="font-mono text-sm font-bold text-emerald-300">{hdyuId}</div>
            </div>
            <Copy size={14} className="text-emerald-100/40" />
          </button>
        )}
        <div className="flex items-center justify-between px-1">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
            <div className="truncate text-xs text-emerald-100/40">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="rounded-lg p-2 text-emerald-100/50 transition hover:bg-white/5 hover:text-white"
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass-strong fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/5 lg:block">
        {sidebar}
      </aside>

      {/* Mobile header + drawer */}
      <div className="glass-strong fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="HDYU" width={28} height={28} className="rounded-full" />
          <span className="font-display font-bold text-white">HDYU</span>
        </Link>
        <button onClick={() => setMobileOpen((v) => !v)} className="p-2 text-emerald-100">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="glass-strong absolute inset-y-0 left-0 w-72 pt-14">{sidebar}</aside>
        </div>
      )}

      <main className="flex-1 px-4 pb-16 pt-20 sm:px-8 lg:ml-64 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      <div className="pointer-events-none fixed right-0 top-0 -z-10 h-96 w-96 rounded-full bg-emerald-500/6 blur-[140px]" />
    </div>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
      <ShieldCheck size={12} /> Verified
    </span>
  );
}
