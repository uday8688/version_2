import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Home, 
  Users,
  Calendar,
  ArrowLeft,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSEO } from '@/hooks/useSEO';
import { Link } from 'react-router-dom';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  occupancyRate: number;
  averageRent: number;
  totalProperties: number;
  totalUnits: number;
  maintenanceRequests: number;
}

export default function Analytics() {
  useSEO('dashboard');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    occupancyRate: 0,
    averageRent: 0,
    totalProperties: 0,
    totalUnits: 0,
    maintenanceRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);

      if (propertiesError) throw propertiesError;

      const propertyIds = properties?.map(p => p.id) || [];

      // Fetch units
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .in('property_id', propertyIds);

      if (unitsError) throw unitsError;

      const unitIds = units?.map(u => u.id) || [];

      // Fetch payments for revenue calculation
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*, lease:leases!inner(*)')
        .in('lease.unit_id', unitIds)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      // Calculate analytics
      const now = new Date();
      const currentMonth = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const lastMonth = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      
      const thisMonthRevenue = payments?.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate >= currentMonth && paymentDate <= currentMonthEnd;
      }).reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      const lastMonthRevenue = payments?.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate >= lastMonth && paymentDate <= lastMonthEnd;
      }).reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const occupiedUnits = units?.filter(u => u.is_occupied).length || 0;
      const occupancyRate = units?.length > 0 ? (occupiedUnits / units.length) * 100 : 0;
      
      const averageRent = units?.length > 0 
        ? units.reduce((sum, unit) => sum + Number(unit.rent_amount), 0) / units.length 
        : 0;

      // Fetch maintenance requests
      const { data: maintenanceRequests, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .in('unit_id', unitIds)
        .eq('status', 'pending');

      if (maintenanceError) throw maintenanceError;

      setAnalytics({
        totalRevenue,
        monthlyRevenue: thisMonthRevenue,
        revenueGrowth,
        occupancyRate,
        averageRent,
        totalProperties: properties?.length || 0,
        totalUnits: units?.length || 0,
        maintenanceRequests: maintenanceRequests?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Performance insights and trends</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/owner">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
          <div className="container mx-auto p-6 space-y-6">

            {/* Key Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All time earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.monthlyRevenue.toLocaleString()}</div>
                  <p className={`text-xs ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.occupancyRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((analytics.occupancyRate / 100) * analytics.totalUnits)}/{analytics.totalUnits} units occupied
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rent</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.averageRent.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">Per unit per month</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Portfolio Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Properties</span>
                        <span className="text-lg font-bold">{analytics.totalProperties}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Units</span>
                        <span className="text-lg font-bold">{analytics.totalUnits}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Occupied Units</span>
                        <span className="text-lg font-bold text-green-600">
                          {Math.round((analytics.occupancyRate / 100) * analytics.totalUnits)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pending Maintenance</span>
                        <span className="text-lg font-bold text-orange-600">{analytics.maintenanceRequests}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Revenue Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">This Month</span>
                        <span className="text-lg font-bold">${analytics.monthlyRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average per Unit</span>
                        <span className="text-lg font-bold">
                          ${analytics.totalUnits > 0 ? (analytics.monthlyRevenue / analytics.totalUnits).toFixed(0) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Growth Rate</span>
                        <span className={`text-lg font-bold ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Revenue Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p>Revenue trend charts will be available soon</p>
                      <p className="text-sm">Historical data visualization coming in the next update</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Occupancy Performance</h4>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${analytics.occupancyRate}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{analytics.occupancyRate.toFixed(1)}% occupied</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Maintenance Response</h4>
                        <div className="text-2xl font-bold text-orange-600">{analytics.maintenanceRequests}</div>
                        <p className="text-sm text-muted-foreground">Pending requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}