import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthProvider";
import type { Role } from "../types/domain";

export function ProtectedRoute({ children, role }: PropsWithChildren<{ role?: Role }>) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-ink text-slate-200">Загрузка Family OS...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  if (role && profile?.role !== role) {
    return <Navigate to={profile?.role === "parent" ? "/parent/dashboard" : "/child/dashboard"} replace />;
  }

  return <>{children}</>;
}
