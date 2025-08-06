import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ArrowLeft, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const UtilityPayments = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const { toast } = useToast();
  const [utilityBills, setUtilityBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUtilityBills = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('utility_bills')
          .select('*')
          .order('due_date', { ascending: true });
        
        if (error) throw error;
        setUtilityBills(data || []);
      } catch (error) {
        console.error('Error fetching utility bills:', error);
        toast({
          title: "Error",
          description: "Failed to load utility bills.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUtilityBills();
  }, [user, toast]);

  const handlePayBill = async (bill: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          amount: bill.amount,
          paymentType: 'utility',
          description: `${bill.bill_type} bill payment`
        }
      });

      if (error) throw error;
      window.open(data.url, '_blank');
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error creating the payment session.",
        variant: "destructive",
      });
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
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Utility Payments</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Utility Bills</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading bills...</p>
              ) : utilityBills.length === 0 ? (
                <p className="text-muted-foreground">No outstanding utility bills.</p>
              ) : (
                <div className="space-y-4">
                  {utilityBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium capitalize">{bill.bill_type}</h3>
                          <Badge variant={bill.status === 'pending' ? 'destructive' : 'default'}>
                            {bill.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>₹{bill.amount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Due: {new Date(bill.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {bill.status === 'pending' && (
                        <Button onClick={() => handlePayBill(bill)}>
                          Pay ₹{bill.amount}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UtilityPayments;