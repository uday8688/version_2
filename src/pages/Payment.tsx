import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ArrowLeft, DollarSign, Calendar, History, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLeaseData } from '@/hooks/useLeaseData';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { useUtilityBills } from '@/hooks/useUtilityBills';
import { NotificationSystem } from '@/components/NotificationSystem';
import { format } from 'date-fns';

const Payment = () => {
  useSEO('dashboard');
  
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Fetch user data
  const { lease, loading: leaseLoading } = useLeaseData();
  const { payments, loading: paymentsLoading } = usePaymentHistory();
  const { bills, loading: billsLoading } = useUtilityBills();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const sessionId = searchParams.get('session_id');
      const success = searchParams.get('success');
      
      if (success === 'true' && sessionId && user) {
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId }
          });
          
          if (error) throw error;
          
          toast({
            title: "Payment Successful",
            description: `Your payment of ₹${data.amount} has been processed successfully.`,
          });
        } catch (error) {
          console.error('Payment verification error:', error);
          toast({
            title: "Payment Verification Failed",
            description: "Please contact support if this payment was processed.",
            variant: "destructive",
          });
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams, user, toast]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    if (!lease) {
      toast({
        title: "Lease Information Required",
        description: "Unable to process payment without lease information.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          amount: parseFloat(amount),
          paymentType,
          description: `${paymentType} payment for ₹${amount}`,
          leaseId: lease.id,
        }
      });

      if (error) {
        console.error('Payment session error:', error);
        throw new Error(error.message || 'Failed to create payment session');
      }

      if (!data?.url) {
        throw new Error('No payment URL received');
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Payment Session Created",
        description: "Redirecting to payment page...",
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = "There was an error creating the payment session. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('configuration')) {
          errorMessage = "Payment service is temporarily unavailable. Please contact support.";
        } else if (error.message.includes('amount')) {
          errorMessage = "Invalid payment amount. Please check and try again.";
        } else if (error.message.includes('authentication')) {
          errorMessage = "Authentication failed. Please log in again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to={ROUTES.HOME} className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Payments</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Make a Payment</h2>
            <p className="text-muted-foreground">Pay your rent, utilities, and other fees securely through Stripe</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-type">Payment Type *</Label>
                    <Select value={paymentType} onValueChange={setPaymentType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Monthly Rent</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="parking">Parking Fee</SelectItem>
                        <SelectItem value="late">Late Fee</SelectItem>
                        <SelectItem value="deposit">Security Deposit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full" 
                    disabled={isLoading || !paymentType || !amount}
                  >
                    {isLoading ? 'Creating Payment Session...' : `Pay ₹${amount || '0.00'} via Stripe`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Payment Summary & History */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {leaseLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </div>
                  ) : lease ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Monthly Rent</span>
                        <span className="font-medium">₹{lease.monthly_rent.toFixed(2)}</span>
                      </div>
                      {bills.length > 0 && (
                        <>
                          {bills.map((bill) => (
                            <div key={bill.id} className="flex items-center justify-between">
                              <span>{bill.bill_type} (Due {format(new Date(bill.due_date), 'MMM d')})</span>
                              <span className="font-medium">₹{bill.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Due</span>
                        <span>₹{(lease.monthly_rent + bills.reduce((sum, bill) => sum + Number(bill.amount), 0)).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>No active lease found</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Recent Payments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="space-y-4">
                      <div className="h-16 bg-muted rounded animate-pulse" />
                      <div className="h-16 bg-muted rounded animate-pulse" />
                    </div>
                  ) : payments.length > 0 ? (
                    <div className="space-y-4">
                      {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className={`h-4 w-4 ${payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`} />
                            <div>
                              <p className="font-medium capitalize">{payment.payment_type}</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.payment_date ? format(new Date(payment.payment_date), 'MMM d, yyyy') : 'Pending'}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">₹{Number(payment.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <History className="h-4 w-4" />
                      <span>No payment history found</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Payment Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {billsLoading ? (
                    <div className="space-y-3">
                      <div className="h-12 bg-muted rounded animate-pulse" />
                      <div className="h-12 bg-muted rounded animate-pulse" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lease && (
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">Rent Due</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), 'MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      )}
                      {bills.map((bill) => (
                        <div key={bill.id} className="flex items-center space-x-3">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="font-medium">{bill.bill_type} Due</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(bill.due_date), 'MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {!lease && bills.length === 0 && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>No upcoming payments</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Notification System */}
        <NotificationSystem />
      </div>
    </div>
  );
};

export default Payment;