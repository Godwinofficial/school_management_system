import { NavLink, useLocation } from "react-router-dom";
import { 
  GraduationCap, 
  Home, 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  School, 
  FileText,
  TrendingUp,
  Shield,
  BookOpen,
  Calendar,
  Award,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AuthService, UserRole } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const getMenuItems = (userRole: UserRole, userLevel: string) => {
  const baseItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
  ];

  if (userLevel === 'school') {
    return [
      ...baseItems,
      { title: "Students", url: "/students", icon: Users },
      { title: "Add Student", url: "/students/add", icon: UserPlus },
      { title: "Teachers", url: "/teachers", icon: GraduationCap },
      { title: "Classes", url: "/classes", icon: BookOpen },
      { title: "Academic Records", url: "/academic-records", icon: Award },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Statistics", url: "/statistics", icon: BarChart3 },
    ];
  }

  if (userLevel === 'district') {
    return [
      ...baseItems,
      { title: "Schools", url: "/schools", icon: School },
      { title: "District Stats", url: "/district-stats", icon: TrendingUp },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Planning", url: "/planning", icon: Calendar },
    ];
  }

  if (userLevel === 'provincial') {
    return [
      ...baseItems,
      { title: "Districts", url: "/districts", icon: Shield },
      { title: "Provincial Stats", url: "/provincial-stats", icon: TrendingUp },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Planning", url: "/planning", icon: Calendar },
    ];
  }

  if (userLevel === 'national') {
    return [
      ...baseItems,
      { title: "Provinces", url: "/provinces", icon: Shield },
      { title: "National Stats", url: "/national-stats", icon: TrendingUp },
      { title: "Curriculum", url: "/curriculum", icon: BookOpen },
      { title: "Examinations", url: "/examinations", icon: Award },
      { title: "Reports", url: "/reports", icon: FileText },
    ];
  }

  return baseItems;
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();
  
  if (!user) return null;

  const menuItems = getMenuItems(user.role, userLevel);
  
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50";

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const getRoleDisplayName = (role: UserRole): string => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r-2`} collapsible="icon">
      <SidebarHeader className="border-b-2 border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-success rounded-xl text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">Education Registry</h2>
              <p className="text-xs text-sidebar-foreground/70">National System</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-wider text-xs font-medium">
            {!collapsed && `${getRoleDisplayName(user.role)}`}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase tracking-wider text-xs font-medium">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/settings" className={getNavCls}>
                      <Settings className="h-5 w-5" />
                      <span className="ml-3">Settings</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-sidebar-border p-4">
        {!collapsed && (
          <div className="mb-4 p-3 bg-sidebar-accent/50 rounded-lg">
            <div className="text-sm font-semibold text-sidebar-foreground">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-sidebar-foreground/70">{user.email}</div>
            {user.school && (
              <div className="text-xs text-sidebar-foreground/70 mt-1 font-medium">{user.school.name}</div>
            )}
          </div>
        )}
        <Button
          variant="outline"
          size={collapsed ? "icon" : "sm"}
          onClick={handleLogout}
          className="w-full border-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:border-primary/50 font-semibold"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}