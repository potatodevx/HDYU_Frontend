"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      toast.success(`Welcome! Your HDYU ID is ${data.userId}`);
      const login = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (login?.ok) router.push("/dashboard");
      else router.push("/login");
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
