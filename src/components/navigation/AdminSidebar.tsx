import { NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  BarChart3, 
  UserCog, 
  Camera, 
  Megaphone, 
  Settings, 
  Home,
  Building,
  Wrench,
  CreditCard,
  ClipboardList,
  Eye,
  BellRing,
  LogOut
} from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const adminMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Properties',
    url: '/admin/properties',
    icon: Building,
  },
  {
    title: 'Vendor Coordination',
    url: '/admin/vendors',
    icon: UserCog,
  },
  {
    title: 'Visitor Monitoring',
    url: '/admin/monitoring',
    icon: Camera,
  },
  {
    title: 'Announcements',
    url: '/admin/announcements',
    icon: Megaphone,
  },
  {
    title: 'Maintenance',
    url: '/admin/maintenance',
    icon: Wrench,
  },
  {
    title: 'Payments',
    url: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Reports',
    url: '/admin/reports',
    icon: ClipboardList,
  },
  {
    title: 'Notifications',
    url: '/admin/notifications',
    icon: BellRing,
  },
  {
    title: 'Background Verification',
    url: '/admin/background-verification',
    icon: Shield,
  },
  {
    title: 'Service Providers',
    url: '/admin/service-providers',
    icon: UserCog,
  },
  {
    title: 'System Settings',
    url: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(path);
  };

  const collapsed = state === "collapsed";
  const getNavClassName = (path: string) => {
    const isItemActive = isActive(path);
    return isItemActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 px-4 py-3">
          <Shield className="h-6 w-6 text-primary" />
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-sm">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">System Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    onClick={logout}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Logout</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}