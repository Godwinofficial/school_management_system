import { Navigate, useLocation } from "react-router-dom";
import { AuthService, UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = AuthService.isAuthenticated();
  const hasPermission = requiredRoles ? AuthService.hasPermission(requiredRoles) : true;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}