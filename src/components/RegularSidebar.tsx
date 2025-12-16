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
  LogOut,
  ClipboardCheck,
  Clock,
  DollarSign,
  MessageSquare,
  ChevronLeft,
  ChevronRight
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
import { cn } from "@/lib/utils";

const getMenuItems = (userRole: UserRole, userLevel: string) => {
  const baseItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
  ];

  // Enhanced menu for Head Teacher and Deputy Head
  if (userRole === 'head_teacher' || userRole === 'deputy_head') {
    const items = [...baseItems];
    items.push({ title: "Students", url: "/students", icon: Users });
    items.push({ title: "Classes", url: "/classes", icon: BookOpen });
    items.push({ title: "Academic Records", url: "/academic-records", icon: Award });
    items.push({ title: "Reports", url: "/reports", icon: FileText });
    items.push({ title: "Statistics", url: "/statistics", icon: BarChart3 });
    items.push({ title: "Attendance", url: "/attendance", icon: ClipboardCheck });
    items.push({ title: "Timetable", url: "/timetable", icon: Clock });
    items.push({ title: "Messaging", url: "/messaging", icon: MessageSquare });
    return items;
  }

  if (userLevel === 'school') {
    const items = [...baseItems];
    if (AuthService.hasPermission(['manage_students', 'view_reports'])) {
      items.push({ title: "Students", url: "/students", icon: Users });
    }
    if (AuthService.hasPermission('manage_students')) {
      items.push({ title: "Add Student", url: "/students/add", icon: UserPlus });
    }
    if (AuthService.hasPermission('manage_staff')) {
      items.push({ title: "Teachers", url: "/teachers", icon: GraduationCap });
    }
    if (AuthService.hasPermission(['manage_classes', 'manage_students'])) {
      items.push({ title: "Classes", url: "/classes", icon: BookOpen });
    }
    items.push({ title: "Attendance", url: "/attendance", icon: ClipboardCheck });
    items.push({ title: "Timetable", url: "/timetable", icon: Clock });
    if (AuthService.hasPermission('manage_assessments')) {
      items.push({ title: "Academic Records", url: "/academic-records", icon: Award });
    }
    if (AuthService.hasPermission('manage_finance')) {
      items.push({ title: "Finance", url: "/finance", icon: DollarSign });
    }
    if (AuthService.hasPermission('view_reports')) {
      items.push({ title: "Reports", url: "/reports", icon: FileText });
      items.push({ title: "Statistics", url: "/statistics", icon: BarChart3 });
    }
    items.push({ title: "Messaging", url: "/messaging", icon: MessageSquare });
    return items;
  }

  if (userLevel === 'district') {
    return [
      ...baseItems,
      { title: "Schools", url: "/schools", icon: School },
      { title: "District Stats", url: "/district-stats", icon: TrendingUp },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Planning", url: "/planning", icon: Calendar },
      { title: "Messaging", url: "/messaging", icon: MessageSquare },
    ];
  }

  if (userLevel === 'provincial') {
    return [
      ...baseItems,
      { title: "Districts", url: "/districts", icon: Shield },
      { title: "Provincial Stats", url: "/provincial-stats", icon: TrendingUp },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Planning", url: "/planning", icon: Calendar },
      { title: "Messaging", url: "/messaging", icon: MessageSquare },
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
      { title: "Messaging", url: "/messaging", icon: MessageSquare },
    ];
  }

  return baseItems;
};

export function RegularSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const user = AuthService.getCurrentUser();
  const userLevel = AuthService.getUserLevel();

  if (!user) return null;

  const menuItems = getMenuItems(user.role, userLevel);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-md"
    );

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
    <Sidebar
      side="left"
      variant="inset"
      className={cn(
        "border-r bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-xl blur opacity-75"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-sidebar-foreground truncate">
                  {user.school ? user.school.name : 'Education Registry'}
                </h2>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.school
                    ? `${user.school.type} School`
                    : user.district
                      ? `${user.district} District`
                      : user.province
                        ? `${user.province} Province`
                        : 'National System'
                  }
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-sidebar-accent transition-all duration-200",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="p-3 space-y-4">
        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              {getRoleDisplayName(user.role)}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        collapsed && "mx-auto"
                      )} />
                      {!collapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Account
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90",
                      collapsed && "mx-auto"
                    )} />
                    {!collapsed && <span className="truncate">Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-3 space-y-3">
        {!collapsed && (
          <div className="px-3 py-2.5 bg-sidebar-accent/50 rounded-xl backdrop-blur-sm border border-sidebar-border/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          onClick={handleLogout}
          className={cn(
            "w-full border-sidebar-border/50 bg-sidebar-accent/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 shadow-sm",
            collapsed && "h-10 w-10 mx-auto"
          )}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}