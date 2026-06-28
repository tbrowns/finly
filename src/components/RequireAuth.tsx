import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import type { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-sm text-shell-mutedForeground">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
