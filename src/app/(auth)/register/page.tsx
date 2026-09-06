"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { usePrototypeAuth } from "@/components/prototype-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = usePrototypeAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = register(form);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Welcome! Your HDYU ID is ${result.user.hdyuId}`);
      router.replace("/dashboard");
    } catch {
      toast.error("Could not create your account. Please try again.");
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
      <h2 className="font-display text-2xl font-extrabold text-white">Create your account</h2>
      <p className="mt-2 text-sm text-emerald-100/50">
        Free forever. You&apos;ll get a unique HDYU User ID.
      </p>
      <p className="mt-3 rounded-xl bg-emerald-400/8 px-3 py-2 text-xs text-emerald-100/55">
        Prototype mode: this account is saved only in this browser.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-emerald-100/60">Full name</label>
          <input
            className="input"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
          />
        </div>
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
            placeholder="Min. 8 characters, letters & numbers"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        <button className="btn-primary w-full !py-3" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-100/50">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-300 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
