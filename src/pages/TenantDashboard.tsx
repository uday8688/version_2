import { useEffect, useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TenantSidebar } from '@/components/navigation/TenantSidebar';
import { 
  Home, 
  DollarSign, 
  Wrench, 
  FileText, 
  Calendar,
  Bell,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Zap,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

const TenantDashboard = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const [recentPayments, setRecentPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentLease, setCurrentLease] = useState(null);
  const [utilityBills, setUtilityBills] = useState([]);
  const [utilityStats, setUtilityStats] = useState({
    total: 0,
    overdue: 0,
    nextDue: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      // Fetch recent payments
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          lease:leases(
            unit:units(
              unit_number,
              property:properties(name)
            )
          )
        `)
        .eq('lease.tenant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch maintenance requests
      const { data: maintenance } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          unit:units(
            unit_number,
            property:properties(name)
          )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch current lease
      const { data: lease } = await supabase
        .from('leases')
        .select(`
          *,
          unit:units(
            id,
            unit_number,
            bedrooms,
            bathrooms,
            property:properties(name, address)
          )
        `)
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .single();

      // Fetch recent announcements
      const { data: announcementData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch utility bills
      if (lease) {
        const { data: bills } = await supabase
          .from('utility_bills')
          .select('*')
          .eq('unit_id', lease.unit.id)
          .eq('status', 'pending')
          .order('due_date', { ascending: true });

        setUtilityBills(bills || []);

        // Calculate utility stats
        if (bills && bills.length > 0) {
          const total = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
          const overdue = bills.filter(bill => new Date(bill.due_date) < new Date()).length;
          const nextDue = bills.find(bill => new Date(bill.due_date) >= new Date());
          
          setUtilityStats({
            total,
            overdue,
            nextDue
          });
        }
      }

      setRecentPayments(payments || []);
      setMaintenanceRequests(maintenance || []);
      setCurrentLease(lease);
      setAnnouncements(announcementData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TenantSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
          </header>

          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-muted-foreground">Manage your apartment living experience</p>
              
              {currentLease && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium">Current Lease</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentLease.unit?.property?.name} - Unit {currentLease.unit?.unit_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentLease.unit?.bedrooms}BR/{currentLease.unit?.bathrooms}BA - ${currentLease.monthly_rent}/month
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link to={ROUTES.PAYMENT}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Pay Rent</h3>
                        <p className="text-sm text-muted-foreground">Make payments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to={ROUTES.MAINTENANCE}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Wrench className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Maintenance</h3>
                        <p className="text-sm text-muted-foreground">Submit requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/announcements">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Bell className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Announcements</h3>
                        <p className="text-sm text-muted-foreground">View updates</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to={ROUTES.TENANT_UTILITY_PAYMENTS}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Utility Payments</h3>
                        <p className="text-sm text-muted-foreground">
                          {utilityBills.length} pending bill{utilityBills.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Utility Bills Summary */}
            {utilityBills.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Total Pending</h3>
                        <p className="text-2xl font-bold">₹{utilityStats.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Overdue Bills</h3>
                        <p className="text-2xl font-bold text-red-600">{utilityStats.overdue}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Next Due</h3>
                        <p className="text-lg font-semibold">
                          {utilityStats.nextDue 
                            ? new Date(utilityStats.nextDue.due_date).toLocaleDateString()
                            : 'No bills'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Community Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to={ROUTES.COMMUNITY_EVENTS}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Community Events</h3>
                        <p className="text-sm text-muted-foreground">Join events</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to={ROUTES.COMMUNITY_HUB}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Community Hub</h3>
                        <p className="text-sm text-muted-foreground">Connect</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to={ROUTES.VISITOR_APPROVAL}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Visitor Approval</h3>
                        <p className="text-sm text-muted-foreground">Manage visitors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Your payment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPayments.length > 0 ? (
                      recentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)} Payment</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            ${payment.amount}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>Track your service requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceRequests.length > 0 ? (
                      maintenanceRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityBadgeVariant(request.priority)}>
                              {request.priority}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(request.status)}>
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No maintenance requests</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                  <CardDescription>Important updates from your property management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <Badge variant={getPriorityBadgeVariant(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TenantDashboard;