import { AdminShell } from "@/components/admin/shell";
import { ProtectedRoute } from "@/components/prototype-auth";

export const metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
