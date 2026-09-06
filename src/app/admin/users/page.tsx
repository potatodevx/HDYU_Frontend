"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatDate, shortAddress } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CLUSTER_SUFFIX =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "" : "?cluster=devnet";

interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  walletAddress: string | null;
  walletVerifiedAt: string | null;
  createdAt: string;
  _count: { activities: number };
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR(
    `/api/admin/users?q=${encodeURIComponent(query)}&page=${page}`,
    fetcher,
    { keepPreviousData: true }
  );

  const users: AdminUser[] = data?.users ?? [];
  const total: number = data?.total ?? 0;
  const pageSize: number = data?.pageSize ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function copy(value: string) {
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Users</h1>
        <p className="mt-1 text-sm text-emerald-100/50">
          {total} registered account{total === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/35" />
        <input
          className="input !pl-10"
          placeholder="Search by name, email, HDYU ID or wallet…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-emerald-100/40">
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">HDYU ID</th>
              <th className="px-5 py-3.5">Wallet</th>
              <th className="px-5 py-3.5">Submissions</th>
              <th className="px-5 py-3.5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-emerald-100/40">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-emerald-100/40">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="transition hover:bg-white/3">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-white">
                      {u.name}
                      {u.role === "ADMIN" && (
                        <span className="ml-2 rounded bg-red-400/15 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-emerald-100/40">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => copy(u.userId)}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-300 hover:underline"
                    >
                      {u.userId} <Copy size={11} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.walletAddress ? (
                      <a
                        href={`https://solscan.io/account/${u.walletAddress}${CLUSTER_SUFFIX}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-100/70 hover:text-emerald-300"
                      >
                        <ShieldCheck size={12} className="text-emerald-400" />
                        {shortAddress(u.walletAddress, 5)}
                      </a>
                    ) : (
                      <span className="text-xs text-emerald-100/30">Not linked</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-emerald-100/60">{u._count.activities}</td>
                  <td className="px-5 py-3.5 text-xs text-emerald-100/45">{formatDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-secondary !py-1.5 text-xs"
          >
            Previous
          </button>
          <span className="text-xs text-emerald-100/50">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-secondary !py-1.5 text-xs"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
