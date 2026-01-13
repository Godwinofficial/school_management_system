import { Navigate, useLocation, useParams } from "react-router-dom";
import { AuthService, UserRole } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import NotFound from "@/pages/NotFound";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole | UserRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { schoolSlug } = useParams(); // Capture the slug from valid routes
  const isAuthenticated = AuthService.isAuthenticated();
  const hasPermission = true; // Temporarily bypass permission check

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Validate School Slug if present
  // If the route has a :schoolSlug param, we MUST ensure validation
  if (schoolSlug) {
    const school = StorageService.getSchool(schoolSlug);

    // Exception for specific reserved keywords that might appear in this slot if routing rules are loose
    // (Though typically specific routes take precedence in react-router-dom)
    const reservedSlugs = ['admin', 'login', 'schools', 'settings', 'unauthorized', 'provinces', 'districts', 'national-stats', 'district-stats', 'provincial-stats', 'curriculum', 'examinations'];
    const isReserved = reservedSlugs.includes(schoolSlug);

    // Also check if the slug is actually just a method to get to a root page 
    // e.g. /dashboard matched as :schoolSlug if Route is /:schoolSlug? No, pure /dashboard is matched first.

    if (!school && !isReserved) {
      // If not a valid school matches the slug (ID or calculated slug), show 404
      return <NotFound />;
    }

    // Enforce school slug consistency for School-level users
    // If the user is restricted to a specific school, they should not browse other school slugs
    const user = AuthService.getCurrentUser();
    if (user?.role !== 'super_admin' && user?.school?.slug) {
      // If the current verified slug doesn't match the user's assigned slug
      // AND the user is not in a 'roaming' role (like district/provincial)
      // For now, assuming only school-level need strict slug enforcement.
      const userLevel = AuthService.getUserLevel(); // Need to call getLevel or check role

      // Check if user is bound to a single school
      if (userLevel === 'school' && user.school.slug !== schoolSlug && !isReserved) {
        // Redirect to their own correct slug
        return <Navigate to={`/${user.school.slug}/dashboard`} replace />;
      }
    }
  }

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}