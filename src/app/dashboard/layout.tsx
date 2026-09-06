import { DashboardShell } from "@/components/dashboard/shell";
import { ProtectedRoute } from "@/components/prototype-auth";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
