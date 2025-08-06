import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building,
  DollarSign,
  Calendar,
  Activity,
  PieChart
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number }>;
  occupancyRate: number;
  revenueData: Array<{ month: string; revenue: number }>;
  maintenanceStats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  userDistribution: {
    tenants: number;
    owners: number;
    vendors: number;
    admins: number;
  };
}

const Analytics = () => {
  useSEO('dashboard');
  
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [
      { month: 'Jan', users: 45 },
      { month: 'Feb', users: 52 },
      { month: 'Mar', users: 61 },
      { month: 'Apr', users: 73 },
      { month: 'May', users: 89 },
      { month: 'Jun', users: 105 }
    ],
    occupancyRate: 87.5,
    revenueData: [
      { month: 'Jan', revenue: 125000 },
      { month: 'Feb', revenue: 132000 },
      { month: 'Mar', revenue: 148000 },
      { month: 'Apr', revenue: 155000 },
      { month: 'May', revenue: 167000 },
      { month: 'Jun', revenue: 178000 }
    ],
    maintenanceStats: {
      pending: 12,
      inProgress: 8,
      completed: 145
    },
    userDistribution: {
      tenants: 340,
      owners: 45,
      vendors: 23,
      admins: 5
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch real user distribution
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role');

      if (!profilesError && profiles) {
        const userDistribution = profiles.reduce((acc, profile) => {
          const role = profile.role;
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setAnalytics(prev => ({
          ...prev,
          userDistribution: {
            tenants: userDistribution.tenant || 0,
            owners: userDistribution.owner || 0,
            vendors: userDistribution.vendor || 0,
            admins: userDistribution.admin || 0,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = Object.values(analytics.userDistribution).reduce((sum, count) => sum + count, 0);
  const currentMonthRevenue = analytics.revenueData[analytics.revenueData.length - 1]?.revenue || 0;
  const previousMonthRevenue = analytics.revenueData[analytics.revenueData.length - 2]?.revenue || 0;
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
    : '0';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          <header className="border-b bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
                  <p className="text-sm text-muted-foreground">System performance and usage metrics</p>
                </div>
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
                      <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                      <p className="text-xs text-green-600">+12% from last month</p>
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
                      <h3 className="font-medium text-sm">Occupancy Rate</h3>
                      <p className="text-2xl font-bold text-green-600">{analytics.occupancyRate}%</p>
                      <p className="text-xs text-green-600">+2.5% from last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Monthly Revenue</h3>
                      <p className="text-2xl font-bold text-purple-600">₹{currentMonthRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+{revenueGrowth}% growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Active Requests</h3>
                      <p className="text-2xl font-bold text-orange-600">{analytics.maintenanceStats.pending + analytics.maintenanceStats.inProgress}</p>
                      <p className="text-xs text-muted-foreground">Maintenance & Support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>User Growth</span>
                  </CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-2">
                    {analytics.userGrowth.map((data, index) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${(data.users / 120) * 100}%` }}
                        />
                        <span className="text-xs mt-2">{data.month}</span>
                        <span className="text-xs text-muted-foreground">{data.users}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Revenue Trends</span>
                  </CardTitle>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end space-x-2">
                    {analytics.revenueData.map((data, index) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-green-500 rounded-t"
                          style={{ height: `${(data.revenue / 200000) * 100}%` }}
                        />
                        <span className="text-xs mt-2">{data.month}</span>
                        <span className="text-xs text-muted-foreground">₹{(data.revenue / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>User Distribution</span>
                  </CardTitle>
                  <CardDescription>Breakdown by user role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm">Tenants</span>
                      </div>
                      <span className="font-medium">{analytics.userDistribution.tenants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm">Owners</span>
                      </div>
                      <span className="font-medium">{analytics.userDistribution.owners}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span className="text-sm">Vendors</span>
                      </div>
                      <span className="font-medium">{analytics.userDistribution.vendors}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm">Admins</span>
                      </div>
                      <span className="font-medium">{analytics.userDistribution.admins}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Maintenance Overview</span>
                  </CardTitle>
                  <CardDescription>Current maintenance request status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="font-medium">{analytics.maintenanceStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="text-sm">In Progress</span>
                      </div>
                      <span className="font-medium">{analytics.maintenanceStats.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="font-medium">{analytics.maintenanceStats.completed}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between font-medium">
                        <span>Total Requests</span>
                        <span>{Object.values(analytics.maintenanceStats).reduce((sum, count) => sum + count, 0)}</span>
                      </div>
                    </div>
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

export default Analytics;