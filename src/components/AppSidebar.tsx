import { AuthService } from "@/lib/auth";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { RegularSidebar } from "./RegularSidebar";

export function AppSidebar() {
    const user = AuthService.getCurrentUser();

    if (!user) return null;

    // If user is super admin, show the SuperAdminSidebar
    if (user.role === 'super_admin') {
        return <SuperAdminSidebar />;
    }

    // Otherwise show the regular sidebar
    return <RegularSidebar />;
}
