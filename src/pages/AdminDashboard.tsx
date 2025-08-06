import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Building, 
  Activity, 
  Settings,
  Database,
  Bell,
  LogOut,
  DollarSign,
  Wrench,
  UserCog,
  Camera,
  Megaphone,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  activeAnnouncements: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
}

const AdminDashboard = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalUnits: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    pendingMaintenance: 0,
    activeAnnouncements: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch various statistics
      const [
        { count: userCount },
        { count: propertyCount },
        { count: unitCount },
        { count: maintenanceCount },
        { count: announcementCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('units').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      // Calculate occupancy rate
      const { count: occupiedUnits } = await supabase
        .from('units')
        .select('*', { count: 'exact', head: true })
        .eq('is_occupied', true);

      const occupancyRate = unitCount ? (occupiedUnits || 0) / unitCount * 100 : 0;

      // Get monthly revenue (mock data for now)
      const monthlyRevenue = 150000; // This would be calculated from payments table

      setStats({
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        totalUnits: unitCount || 0,
        occupancyRate,
        monthlyRevenue,
        pendingMaintenance: maintenanceCount || 0,
        activeAnnouncements: announcementCount || 0,
        recentActivities: [
          {
            id: '1',
            type: 'user_registered',
            description: 'New tenant registered - john.doe@email.com',
            timestamp: '2 hours ago',
            status: 'new'
          },
          {
            id: '2',
            type: 'property_verified',
            description: 'Property verified - Sunset Apartments',
            timestamp: '4 hours ago',
            status: 'verified'
          },
          {
            id: '3',
            type: 'maintenance_completed',
            description: 'Maintenance request completed - Unit 205',
            timestamp: '1 day ago',
            status: 'completed'
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { 
      title: 'Manage Users', 
      description: 'Add, edit, or deactivate user accounts',
      icon: Users, 
      href: '/admin/users',
      color: 'blue'
    },
    { 
      title: 'View Analytics', 
      description: 'System performance and usage metrics',
      icon: BarChart3, 
      href: '/admin/analytics',
      color: 'green'
    },
    { 
      title: 'Vendor Coordination', 
      description: 'Manage service providers and contracts',
      icon: UserCog, 
      href: '/admin/vendors',
      color: 'purple'
    },
    { 
      title: 'Send Announcement', 
      description: 'Broadcast messages to communities',
      icon: Megaphone, 
      href: '/admin/announcements',
      color: 'orange'
    },
    { 
      title: 'Monitor Visitors', 
      description: 'Camera feeds and access control',
      icon: Camera, 
      href: '/admin/monitoring',
      color: 'red'
    },
    { 
      title: 'System Settings', 
      description: 'Configure platform permissions',
      icon: Settings, 
      href: '/admin/settings',
      color: 'gray'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="border-b bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">System Overview & Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="capitalize">
                  {user?.user_metadata?.role || 'Admin'}
                </Badge>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Total Users</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {loading ? '...' : stats.totalUsers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Properties</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {loading ? '...' : stats.totalProperties}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Occupancy Rate</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {loading ? '...' : `${stats.occupancyRate.toFixed(1)}%`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Monthly Revenue</h3>
                      <p className="text-2xl font-bold text-orange-600">
                        {loading ? '...' : `₹${stats.monthlyRevenue.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getColorClasses(action.color)}`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Database Health</span>
                      </div>
                      <Badge variant="secondary">Excellent</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Pending Maintenance</span>
                      </div>
                      <Badge variant="outline">{stats.pendingMaintenance} requests</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Active Announcements</span>
                      </div>
                      <Badge variant="outline">{stats.activeAnnouncements} active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest system events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        <Badge 
                          variant={activity.status === 'new' ? 'default' : 
                                  activity.status === 'verified' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;