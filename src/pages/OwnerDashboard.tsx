import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Home, 
  Users, 
  Wrench, 
  FileText, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  UserCheck,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';

interface OwnerStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  pendingMaintenance: number;
  activeLeases: number;
  expiringLeases: number;
}

interface RecentActivity {
  id: string;
  type: 'payment' | 'maintenance' | 'lease' | 'tenant';
  title: string;
  description: string;
  date: string;
  status: string;
  amount?: number;
}

export default function OwnerDashboard() {
  useSEO('dashboard');
  const [stats, setStats] = useState<OwnerStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    pendingMaintenance: 0,
    activeLeases: 0,
    expiringLeases: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOwnerData();
  }, [user]);

  const fetchOwnerData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch properties owned by this user
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);

      if (propertiesError) throw propertiesError;

      const propertyIds = properties?.map(p => p.id) || [];

      // Fetch units for these properties
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .in('property_id', propertyIds);

      if (unitsError) throw unitsError;

      const unitIds = units?.map(u => u.id) || [];

      // Fetch active leases
      const { data: leases, error: leasesError } = await supabase
        .from('leases')
        .select('*, payments(*)')
        .in('unit_id', unitIds)
        .eq('status', 'active');

      if (leasesError) throw leasesError;

      // Fetch maintenance requests
      const { data: maintenanceRequests, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('unit_id', unitIds)
        .eq('status', 'pending');

      if (maintenanceError) throw maintenanceError;

      // Calculate revenue
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*, lease:leases!inner(*)')
        .in('lease.unit_id', unitIds)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const monthlyRevenue = payments?.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate >= currentMonthStart && paymentDate <= currentMonthEnd;
      }).reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Calculate expiring leases (within next 90 days)
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
      
      const expiringLeases = leases?.filter(lease => {
        const endDate = new Date(lease.end_date);
        return endDate <= ninetyDaysFromNow;
      }).length || 0;

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalProperties: properties?.length || 0,
        totalUnits: units?.length || 0,
        occupiedUnits: units?.filter(u => u.is_occupied).length || 0,
        pendingMaintenance: maintenanceRequests?.length || 0,
        activeLeases: leases?.length || 0,
        expiringLeases,
      });

      // Create recent activity from various sources
      const activities: RecentActivity[] = [];
      
      // Add recent payments
      payments?.slice(-5).forEach(payment => {
        activities.push({
          id: payment.id,
          type: 'payment',
          title: 'Payment Received',
          description: `${payment.payment_type} payment of $${payment.amount}`,
          date: payment.payment_date || payment.created_at,
          status: payment.status,
          amount: Number(payment.amount),
        });
      });

      // Add recent maintenance requests
      maintenanceRequests?.slice(-3).forEach(request => {
        activities.push({
          id: request.id,
          type: 'maintenance',
          title: 'Maintenance Request',
          description: request.title,
          date: request.created_at,
          status: request.status,
        });
      });

      // Sort by date
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 8));

    } catch (error) {
      console.error('Error fetching owner data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'lease':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'tenant':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <OwnerSidebar />
          <SidebarInset>
            <div className="container mx-auto p-6 space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <OwnerSidebar />
        <SidebarInset>
          <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-sidebar-border" />
            </div>
            <div className="flex items-center justify-between flex-1 pr-4">
              <div>
                <h1 className="text-3xl font-bold">Owner Dashboard</h1>
                <p className="text-muted-foreground">Manage your properties and track performance</p>
              </div>
              <Button 
                variant="outline" 
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          <div className="container mx-auto p-6 space-y-6">

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month's income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUnits} total units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUnits > 0 ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.occupiedUnits}/{stats.totalUnits} units occupied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Pending Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{stats.pendingMaintenance}</div>
            <p className="text-xs text-orange-600">Requests awaiting attention</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active Leases</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.activeLeases}</div>
            <p className="text-xs text-blue-600">Currently active contracts</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Expiring Leases</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.expiringLeases}</div>
            <p className="text-xs text-yellow-600">Expiring within 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.date), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.amount && (
                          <span className="text-sm font-medium text-green-600">
                            ${activity.amount.toLocaleString()}
                          </span>
                        )}
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-lg font-bold">${stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Revenue</span>
                  <span className="text-lg font-bold text-green-600">${stats.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average per Unit</span>
                  <span className="text-lg font-bold">
                    ${stats.totalUnits > 0 ? Math.round(stats.monthlyRevenue / stats.totalUnits).toLocaleString() : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Occupancy Rate</span>
                  <span className="text-lg font-bold">
                    {stats.totalUnits > 0 ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Generation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Monthly Revenue Report
                </Button>
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Annual Summary
                </Button>
                <Button className="w-full" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Tax-Ready Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Building className="h-4 w-4 mr-2" />
                  Property Performance
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}