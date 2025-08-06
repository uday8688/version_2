import { useSEO } from '@/hooks/useSEO';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calculator, Receipt, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TaxData {
  totalIncome: number;
  deductibleExpenses: number;
  maintenanceCosts: number;
  depreciation: number;
  taxableIncome: number;
  estimatedTaxes: number;
}

const TaxReports = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [taxData, setTaxData] = useState<TaxData>({
    totalIncome: 0,
    deductibleExpenses: 0,
    maintenanceCosts: 0,
    depreciation: 0,
    taxableIncome: 0,
    estimatedTaxes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTaxData();
    }
  }, [user, selectedYear]);

  const fetchTaxData = async () => {
    try {
      const year = parseInt(selectedYear);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      // Fetch rental income
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
        .eq('leases.units.properties.owner_id', user?.id)
        .gte('payment_date', startDate.toISOString().split('T')[0])
        .lte('payment_date', endDate.toISOString().split('T')[0]);

      if (paymentsError) throw paymentsError;

      // Fetch maintenance expenses
      const { data: maintenance, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select(`
          actual_cost,
          created_at,
          units (
            properties (
              owner_id
            )
          )
        `)
        .eq('status', 'completed')
        .eq('units.properties.owner_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('actual_cost', 'is', null);

      if (maintenanceError) throw maintenanceError;

      // Calculate totals
      const totalIncome = payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
      const maintenanceCosts = maintenance?.reduce((sum: number, req: any) => sum + (req.actual_cost || 0), 0) || 0;
      
      // Mock other tax-related calculations
      const depreciation = totalIncome * 0.027; // Rough estimate for residential rental depreciation
      const deductibleExpenses = maintenanceCosts + (totalIncome * 0.15); // 15% for other expenses
      const taxableIncome = totalIncome - deductibleExpenses - depreciation;
      const estimatedTaxes = Math.max(0, taxableIncome * 0.22); // 22% tax rate estimate

      setTaxData({
        totalIncome,
        deductibleExpenses,
        maintenanceCosts,
        depreciation,
        taxableIncome,
        estimatedTaxes
      });
    } catch (error) {
      console.error('Error fetching tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTaxReport = (type: string) => {
    console.log(`Downloading ${type} tax report for ${selectedYear}`);
  };

  const taxDocuments = [
    { name: 'Schedule E - Rental Income', description: 'IRS Form for rental income and expenses', ready: true },
    { name: '1099-MISC Forms', description: 'For contractors and service providers', ready: true },
    { name: 'Depreciation Schedule', description: 'Property depreciation calculations', ready: true },
    { name: 'Expense Summary', description: 'Detailed breakdown of deductible expenses', ready: false },
    { name: 'Receipt Archive', description: 'Digital copies of all receipts', ready: true }
  ];

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
                  <h1 className="text-3xl font-bold">Tax Reports</h1>
                  <p className="text-muted-foreground">Generate tax-ready reports and documentation</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handleDownloadTaxReport('complete')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Complete Package
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Tax Advisory Notice</h3>
                  <p className="text-sm text-yellow-700">
                    These reports are for informational purposes. Please consult with a qualified tax professional 
                    for tax advice and to ensure compliance with current tax laws.
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading tax data...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Rental Income</p>
                          <p className="text-2xl font-bold">${taxData.totalIncome.toLocaleString()}</p>
                        </div>
                        <Receipt className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Deductible Expenses</p>
                          <p className="text-2xl font-bold">${taxData.deductibleExpenses.toLocaleString()}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Taxable Income</p>
                          <p className="text-2xl font-bold">${taxData.taxableIncome.toLocaleString()}</p>
                        </div>
                        <Calculator className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Estimated Taxes</p>
                          <p className="text-2xl font-bold">${taxData.estimatedTaxes.toLocaleString()}</p>
                        </div>
                        <Badge variant="secondary">Estimate</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Calculation Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Gross Rental Income</span>
                        <span className="font-bold">${taxData.totalIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Maintenance & Repairs</span>
                        <span className="font-bold text-red-600">-${taxData.maintenanceCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Other Deductions</span>
                        <span className="font-bold text-red-600">-${(taxData.deductibleExpenses - taxData.maintenanceCosts).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Depreciation</span>
                        <span className="font-bold text-red-600">-${taxData.depreciation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-sm font-bold">Taxable Income</span>
                        <span className="font-bold">${taxData.taxableIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Est. Tax Liability (22%)</span>
                        <span className="font-bold text-orange-600">${taxData.estimatedTaxes.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Documents & Forms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {taxDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={doc.ready ? "default" : "secondary"}>
                                {doc.ready ? "Ready" : "Processing"}
                              </Badge>
                              {doc.ready && (
                                <Button size="sm" variant="outline" onClick={() => handleDownloadTaxReport(doc.name)}>
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <Button variant="outline" onClick={() => handleDownloadTaxReport('schedule-e')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Download Schedule E
                      </Button>
                      <Button variant="outline" onClick={() => handleDownloadTaxReport('1099-misc')}>
                        <Receipt className="h-4 w-4 mr-2" />
                        Generate 1099-MISC
                      </Button>
                      <Button variant="outline" onClick={() => handleDownloadTaxReport('depreciation')}>
                        <Calculator className="h-4 w-4 mr-2" />
                        Depreciation Report
                      </Button>
                      <Button variant="outline" onClick={() => handleDownloadTaxReport('expense-summary')}>
                        <Download className="h-4 w-4 mr-2" />
                        Expense Summary
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TaxReports;