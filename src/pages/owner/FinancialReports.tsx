import { useSEO } from '@/hooks/useSEO';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FinancialData {
  totalRevenue: number;
  monthlyRevenue: number;
  expenses: number;
  netIncome: number;
  occupancyRate: number;
  averageRent: number;
}

const FinancialReports = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    expenses: 0,
    netIncome: 0,
    occupancyRate: 0,
    averageRent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user, selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      // Fetch revenue data
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          amount,
          payment_date,
          leases (
            units (
              properties (
                owner_id
              )
            )
          )
        `)
        .eq('status', 'paid')
        .eq('leases.units.properties.owner_id', user?.id);

      if (paymentsError) throw paymentsError;

      // Fetch property and unit data
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          units (
            id,
            rent_amount,
            is_occupied,
            leases (
              id,
              status,
              monthly_rent
            )
          )
        `)
        .eq('owner_id', user?.id);

      if (propertiesError) throw propertiesError;

      // Calculate financial metrics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      let totalRevenue = 0;
      let monthlyRevenue = 0;

      payments?.forEach((payment: any) => {
        totalRevenue += payment.amount;
        
        if (payment.payment_date) {
          const paymentDate = new Date(payment.payment_date);
          if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
            monthlyRevenue += payment.amount;
          }
        }
      });

      // Calculate unit metrics
      let totalUnits = 0;
      let occupiedUnits = 0;
      let totalRent = 0;

      properties?.forEach((property: any) => {
        property.units?.forEach((unit: any) => {
          totalUnits++;
          if (unit.is_occupied) {
            occupiedUnits++;
          }
          totalRent += unit.rent_amount || 0;
        });
      });

      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      const averageRent = totalUnits > 0 ? totalRent / totalUnits : 0;

      // Mock expenses for demonstration
      const expenses = monthlyRevenue * 0.3; // 30% of revenue as expenses
      const netIncome = monthlyRevenue - expenses;

      setFinancialData({
        totalRevenue,
        monthlyRevenue,
        expenses,
        netIncome,
        occupancyRate,
        averageRent
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (type: string) => {
    // Mock download functionality
    console.log(`Downloading ${type} report for ${selectedPeriod}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <OwnerSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                  ← Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">Financial Reports</h1>
                  <p className="text-muted-foreground">Track revenue, expenses, and generate reports</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading financial data...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                          <p className="text-2xl font-bold">${financialData.totalRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                          <p className="text-2xl font-bold">${financialData.monthlyRevenue.toLocaleString()}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                          <p className="text-2xl font-bold">${financialData.netIncome.toLocaleString()}</p>
                        </div>
                        <Badge variant={financialData.netIncome >= 0 ? "default" : "destructive"}>
                          {financialData.netIncome >= 0 ? "Profit" : "Loss"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                          <p className="text-2xl font-bold">{financialData.occupancyRate.toFixed(1)}%</p>
                        </div>
                        <Badge variant={financialData.occupancyRate >= 90 ? "default" : "secondary"}>
                          {financialData.occupancyRate >= 90 ? "Excellent" : "Good"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Rental Income</span>
                        <span className="font-bold">${financialData.monthlyRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Operating Expenses</span>
                        <span className="font-bold text-red-600">-${financialData.expenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-sm font-medium">Net Income</span>
                        <span className="font-bold text-green-600">${financialData.netIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Rent/Unit</span>
                        <span className="font-bold">${financialData.averageRent.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Report Generation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleDownloadReport('monthly')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Monthly Revenue Report
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleDownloadReport('quarterly')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Quarterly Summary
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleDownloadReport('annual')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Annual Report
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleDownloadReport('cash-flow')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Cash Flow Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FinancialReports;