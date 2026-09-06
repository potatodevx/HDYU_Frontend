"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrototypeAuth } from "@/components/prototype-auth";

const LINKS = [
  { href: "/#vision", label: "Vision" },
  { href: "/#earn", label: "Earn HDYU" },
  { href: "/#utility", label: "Utility" },
  { href: "/#token", label: "Token" },
  { href: "/#roadmap", label: "Roadmap" },
];

export function Navbar() {
  const { user } = usePrototypeAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong shadow-lg shadow-black/20" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="HDYU" width={34} height={34} className="rounded-full" priority />
          <span className="font-display text-lg font-800 tracking-tight text-white font-bold">
            HDYU
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-emerald-100/70 transition hover:text-emerald-300"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="btn-primary !py-2">
              {user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-emerald-100/80 transition hover:text-white"
              >
                Sign in
              </Link>
              <Link href="/register" className="btn-primary !py-2">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="text-emerald-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="glass-strong border-t border-white/5 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-emerald-100/80"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              {user ? (
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                  className="btn-primary flex-1 !py-2"
                  onClick={() => setOpen(false)}
                >
                  {user.role === "ADMIN" ? "Admin Panel" : "Dashboard"}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary flex-1 !py-2" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className="btn-primary flex-1 !py-2" onClick={() => setOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
