import { Home, School, Users, DollarSign, BarChart3, MessageSquare, Database, Settings, LogOut, Building2, CreditCard, FileText, Bell, Mail, Upload, Download, Shield, Activity } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SuperAdminSidebar() {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const handleLogout = () => {
        AuthService.logout();
        // Redirection is now handled by AuthService.logout()
    };

    const menuItems = [
        {
            title: "Overview",
            icon: Home,
            url: "/admin/dashboard",
        },
        {
            title: "School Management",
            icon: School,
            items: [
                { title: "All Schools", url: "/admin/schools", icon: Building2 },
                { title: "Onboard New School", url: "/admin/schools/add", icon: Upload },
                { title: "Subscription Plans", url: "/admin/plans", icon: CreditCard },
            ],
        },
        {
            title: "User Management",
            icon: Users,
            items: [
                { title: "School Users", url: "/admin/users", icon: Users },
                { title: "Role Templates", url: "/admin/roles", icon: Shield },
            ],
        },
        {
            title: "Billing & Subscriptions",
            icon: DollarSign,
            items: [
                { title: "Active Subscriptions", url: "/admin/subscriptions", icon: FileText },
                { title: "Payment History", url: "/admin/payments", icon: DollarSign },
                { title: "Invoices", url: "/admin/invoices", icon: FileText },
            ],
        },
        {
            title: "System Control",
            icon: Settings,
            items: [
                { title: "Global Settings", url: "/admin/settings", icon: Settings },
                { title: "Module Management", url: "/admin/modules", icon: Activity },
                { title: "Backups & Security", url: "/admin/security", icon: Database },
            ],
        },
        {
            title: "Communication",
            icon: MessageSquare,
            items: [
                { title: "Announcements", url: "/admin/announcements", icon: Bell },
                { title: "Support Tickets", url: "/admin/support", icon: MessageSquare },
            ],
        },
        {
            title: "Data Management",
            icon: Database,
            items: [
                { title: "Bulk Import", url: "/admin/import", icon: Upload },
                { title: "Data Export", url: "/admin/export", icon: Download },
                { title: "Activity Logs", url: "/admin/logs", icon: FileText },
            ],
        },
    ];

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-border/50 p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm">Super Admin</h2>
                        <p className="text-xs text-muted-foreground">Platform Management</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <Collapsible className="group/collapsible">
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton>
                                                    <item.icon className="w-4 h-4" />
                                                    <span>{item.title}</span>
                                                    <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild>
                                                                <NavLink 
                                                                    to={subItem.url}
                                                                    className={({ isActive }) => cn(
                                                                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                                    )}
                                                                >
                                                                    <subItem.icon className="w-4 h-4" />
                                                                    <span>{subItem.title}</span>
                                                                </NavLink>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuButton asChild>
                                            <NavLink 
                                                to={item.url}
                                                className={({ isActive }) => cn(
                                                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                                )}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.title}</span>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                            <p className="text-xs text-muted-foreground">System Admin</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
