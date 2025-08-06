import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building,
  Calendar,
  PieChart,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, subDays, subMonths, subYears } from 'date-fns';

interface ReportData {
  totalRevenue: number;
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  occupancyRate: number;
  maintenanceRequests: number;
  completedPayments: number;
  pendingPayments: number;
}

export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7':
          startDate = subDays(endDate, 7);
          break;
        case '30':
          startDate = subDays(endDate, 30);
          break;
        case '90':
          startDate = subDays(endDate, 90);
          break;
        case '365':
          startDate = subYears(endDate, 1);
          break;
        default:
          startDate = subDays(endDate, 30);
      }

      // Fetch multiple data sources
      const [
        paymentsResult,
        propertiesResult,
        unitsResult,
        tenantsResult,
        maintenanceResult
      ] = await Promise.all([
        supabase
          .from('payments')
          .select('amount, status, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('properties')
          .select('id, total_units'),
        supabase
          .from('units')
          .select('id, is_occupied'),
        supabase
          .from('profiles')
          .select('id')
          .eq('role', 'tenant'),
        supabase
          .from('maintenance_requests')
          .select('id')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      ]);

      if (paymentsResult.error) throw paymentsResult.error;
      if (propertiesResult.error) throw propertiesResult.error;
      if (unitsResult.error) throw unitsResult.error;
      if (tenantsResult.error) throw tenantsResult.error;
      if (maintenanceResult.error) throw maintenanceResult.error;

      const payments = paymentsResult.data || [];
      const properties = propertiesResult.data || [];
      const units = unitsResult.data || [];
      const tenants = tenantsResult.data || [];
      const maintenanceRequests = maintenanceResult.data || [];

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => u.is_occupied).length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      const completedPayments = payments.filter(p => p.status === 'completed').length;
      const pendingPayments = payments.filter(p => p.status === 'pending').length;

      setReportData({
        totalRevenue,
        totalProperties: properties.length,
        totalUnits,
        totalTenants: tenants.length,
        occupancyRate,
        maintenanceRequests: maintenanceRequests.length,
        completedPayments,
        pendingPayments,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (type: string) => {
    toast({
      title: 'Report Generated',
      description: `${type} report is being prepared for download`,
    });
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7':
        return 'Last 7 days';
      case '30':
        return 'Last 30 days';
      case '90':
        return 'Last 90 days';
      case '365':
        return 'Last year';
      default:
        return 'Last 30 days';
    }
  };

  if (loading || !reportData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate and view comprehensive reports</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{getDateRangeLabel()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Total properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{reportData.totalUnits} total units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalTenants}</div>
            <p className="text-xs text-muted-foreground">Registered tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-medium">Financial Reports</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => generateReport('Revenue')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Revenue Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => generateReport('Payment')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Payment Analysis
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Property Reports</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => generateReport('Occupancy')}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Occupancy Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => generateReport('Maintenance')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Maintenance Report
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">User Reports</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => generateReport('Tenant')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Tenant Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => generateReport('Activity')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Activity Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completed Payments</span>
              <Badge variant="default">{reportData.completedPayments}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pending Payments</span>
              <Badge variant="secondary">{reportData.pendingPayments}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-sm">
                {reportData.completedPayments + reportData.pendingPayments > 0
                  ? ((reportData.completedPayments / (reportData.completedPayments + reportData.pendingPayments)) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Maintenance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Requests</span>
              <Badge variant="outline">{reportData.maintenanceRequests}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average per Property</span>
              <span className="text-sm">
                {reportData.totalProperties > 0
                  ? (reportData.maintenanceRequests / reportData.totalProperties).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Period</span>
              <span className="text-sm text-muted-foreground">{getDateRangeLabel()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}