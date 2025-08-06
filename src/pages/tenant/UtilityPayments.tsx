import { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TenantSidebar } from '@/components/navigation/TenantSidebar';
import { 
  Zap, 
  Droplets, 
  Flame, 
  Wifi, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UtilityBill {
  id: string;
  property_id?: string;
  unit_id?: string;
  bill_type: string;
  amount: number;
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  status: 'pending' | 'paid' | 'overdue' | 'processing';
  paid_at?: string;
  stripe_payment_id?: string;
  created_at: string;
  updated_at: string;
}

const TenantUtilityPayments = () => {
  useSEO('payment');
  const { user } = useAuth();
  const { toast } = useToast();
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [billTypeFilter, setBillTypeFilter] = useState<string>('all');
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUtilityBills();
  }, []);

  const fetchUtilityBills = async () => {
    try {
      setLoading(true);
      
      // First get user's unit
      const { data: leaseData } = await supabase
        .from('leases')
        .select('unit_id')
        .eq('tenant_id', user?.id)
        .eq('status', 'active')
        .single();

      if (!leaseData) {
        setBills([]);
        return;
      }

      const { data, error } = await supabase
        .from('utility_bills')
        .select('*')
        .eq('unit_id', leaseData.unit_id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      
      // Add some mock data if no bills exist
      const mockBills: UtilityBill[] = [
        {
          id: '1',
          unit_id: leaseData.unit_id,
          bill_type: 'electricity',
          amount: 2500,
          due_date: '2024-02-15',
          billing_period_start: '2024-01-01',
          billing_period_end: '2024-01-31',
          status: 'pending',
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        },
        {
          id: '2',
          unit_id: leaseData.unit_id,
          bill_type: 'water',
          amount: 800,
          due_date: '2024-02-15',
          billing_period_start: '2024-01-01',
          billing_period_end: '2024-01-31',
          status: 'pending',
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        },
        {
          id: '3',
          unit_id: leaseData.unit_id,
          bill_type: 'gas',
          amount: 1200,
          due_date: '2024-02-15',
          billing_period_start: '2024-01-01',
          billing_period_end: '2024-01-31',
          status: 'pending',
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        },
        {
          id: '4',
          unit_id: leaseData.unit_id,
          bill_type: 'internet',
          amount: 999,
          due_date: '2024-02-15',
          billing_period_start: '2024-01-01',
          billing_period_end: '2024-01-31',
          status: 'paid',
          paid_at: '2024-01-10T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z'
        }
      ];

      setBills(data.length > 0 ? (data as UtilityBill[]) : mockBills);
    } catch (error) {
      console.error('Error fetching utility bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch utility bills',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (billId: string, amount: number) => {
    try {
      setPaymentLoading(billId);
      
      // Call Stripe payment session creation edge function
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          amount: amount * 100, // Convert to paise
          currency: 'inr',
          payment_type: 'utility',
          bill_id: billId,
          success_url: `${window.location.origin}/utility-payments?payment=success`,
          cancel_url: `${window.location.origin}/utility-payments?payment=cancelled`,
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoading(null);
    }
  };

  const getBillIcon = (billType: string) => {
    const icons = {
      electricity: Zap,
      water: Droplets,
      gas: Flame,
      internet: Wifi,
      maintenance: CreditCard
    };
    return icons[billType as keyof typeof icons] || CreditCard;
  };

  const getBillColor = (billType: string) => {
    const colors = {
      electricity: 'text-yellow-600',
      water: 'text-blue-600',
      gas: 'text-orange-600',
      internet: 'text-purple-600',
      maintenance: 'text-green-600'
    };
    return colors[billType as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'pending';
    const actualStatus = isOverdue ? 'overdue' : status;
    
    const variants = {
      pending: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
      paid: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
      overdue: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
      processing: { variant: 'outline' as const, icon: Clock, color: 'text-blue-600' }
    };
    
    const config = variants[actualStatus as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {actualStatus}
      </Badge>
    );
  };

  const filteredBills = bills.filter(bill => {
    const isOverdue = new Date(bill.due_date) < new Date() && bill.status === 'pending';
    const actualStatus = isOverdue ? 'overdue' : bill.status;
    
    const matchesSearch = bill.bill_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || actualStatus === statusFilter;
    const matchesBillType = billTypeFilter === 'all' || bill.bill_type === billTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBillType;
  });

  const totalPending = bills
    .filter(bill => bill.status === 'pending')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const overdueCount = bills.filter(bill => 
    new Date(bill.due_date) < new Date() && bill.status === 'pending'
  ).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <TenantSidebar />
        
        <SidebarInset className="flex-1">
          <header className="border-b bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Utility Payments</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">Pay your electricity, water, gas and internet bills</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total Pending</p>
                      <p className="text-2xl font-bold text-blue-600">₹{totalPending.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Overdue Bills</p>
                      <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Paid This Month</p>
                      <p className="text-2xl font-bold text-green-600">
                        {bills.filter(bill => bill.status === 'paid' && 
                          new Date(bill.paid_at || '').getMonth() === new Date().getMonth()).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Next Due</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {bills.filter(b => b.status === 'pending').length > 0 
                          ? new Date(Math.min(...bills.filter(b => b.status === 'pending').map(b => new Date(b.due_date).getTime()))).getDate()
                          : 'None'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
              <Select value={billTypeFilter} onValueChange={setBillTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bills Table */}
            <Card>
              <CardHeader>
                <CardTitle>Utility Bills</CardTitle>
                <CardDescription>
                  View and pay your monthly utility bills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill Type</TableHead>
                      <TableHead>Billing Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading bills...
                        </TableCell>
                      </TableRow>
                    ) : filteredBills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No bills found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBills.map((bill) => {
                        const Icon = getBillIcon(bill.bill_type);
                        const iconColor = getBillColor(bill.bill_type);
                        
                        return (
                          <TableRow key={bill.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Icon className={`h-4 w-4 ${iconColor}`} />
                                <span className="font-medium capitalize">{bill.bill_type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{new Date(bill.billing_period_start).toLocaleDateString()} - </p>
                                <p>{new Date(bill.billing_period_end).toLocaleDateString()}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">₹{bill.amount.toLocaleString()}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(bill.due_date).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(bill.status, bill.due_date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {bill.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handlePayment(bill.id, bill.amount)}
                                    disabled={paymentLoading === bill.id}
                                  >
                                    {paymentLoading === bill.id ? (
                                      <Clock className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                      <CreditCard className="h-3 w-3 mr-1" />
                                    )}
                                    Pay Now
                                  </Button>
                                )}
                                {bill.status === 'paid' && (
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-3 w-3 mr-1" />
                                    Receipt
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default TenantUtilityPayments;