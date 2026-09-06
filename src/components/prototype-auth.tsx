"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  getPrototypeSessionUser,
  loginPrototypeUser,
  logoutPrototypeUser,
  registerPrototypeUser,
  updatePrototypeUser,
  type PrototypeUser,
} from "@/lib/prototype-storage";

interface PrototypeAuthContextValue {
  user: PrototypeUser | null;
  isLoading: boolean;
  register: typeof registerPrototypeUser;
  login: typeof loginPrototypeUser;
  logout: () => void;
  updateUser: (updates: Pick<PrototypeUser, "walletAddress">) => PrototypeUser | null;
}

const PrototypeAuthContext = createContext<PrototypeAuthContextValue | null>(null);

export function PrototypeAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PrototypeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncSession = () => {
      setUser(getPrototypeSessionUser());
      setIsLoading(false);
    };
    syncSession();
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  const register = useCallback((input: { name: string; email: string; password: string }) => {
    const result = registerPrototypeUser(input);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = loginPrototypeUser(email, password);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutPrototypeUser();
    setUser(null);
  }, []);

  const updateUser = useCallback(
    (updates: Pick<PrototypeUser, "walletAddress">) => {
      if (!user) return null;
      const updated = updatePrototypeUser(user.email, updates);
      if (updated) setUser(updated);
      return updated;
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, isLoading, register, login, logout, updateUser }),
    [user, isLoading, register, login, logout, updateUser]
  );

  return <PrototypeAuthContext.Provider value={value}>{children}</PrototypeAuthContext.Provider>;
}

export function usePrototypeAuth() {
  const context = useContext(PrototypeAuthContext);
  if (!context) throw new Error("usePrototypeAuth must be used inside PrototypeAuthProvider");
  return context;
}

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-emerald-300">
      <Loader2 className="animate-spin" size={28} aria-label="Checking account" />
    </div>
  );
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const { user, isLoading } = usePrototypeAuth();
  const allowed = Boolean(user && (!adminOnly || user.role === "ADMIN"));

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (adminOnly && user.role !== "ADMIN") router.replace("/dashboard");
  }, [adminOnly, isLoading, router, user]);

  if (isLoading || !allowed) return <AuthLoading />;
  return children;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = usePrototypeAuth();

  useEffect(() => {
    if (!isLoading && user) router.replace(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }, [isLoading, router, user]);

  if (isLoading || user) return <AuthLoading />;
  return children;
}
