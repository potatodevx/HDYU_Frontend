"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", { ...form, redirect: false });
      if (res?.ok) {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
        <Image src="/logo.png" alt="HDYU" width={32} height={32} className="rounded-full" />
        <span className="font-display text-lg font-bold text-white">HDYU</span>
      </Link>
      <h2 className="font-display text-2xl font-extrabold text-white">Welcome back</h2>
      <p className="mt-2 text-sm text-emerald-100/50">Sign in to your HDYU dashboard.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button className="btn-primary w-full !py-3" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-100/50">
        New to HDYU?{" "}
        <Link href="/register" className="font-semibold text-emerald-300 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
