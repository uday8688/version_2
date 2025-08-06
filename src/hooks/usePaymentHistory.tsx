import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
  status: string;
  stripe_payment_id?: string;
  due_date: string;
}

export const usePaymentHistory = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: paymentError } = await supabase
          .from('payments')
          .select(`
            id,
            amount,
            payment_date,
            payment_type,
            status,
            stripe_payment_id,
            due_date,
            leases!inner (
              tenant_id
            )
          `)
          .eq('leases.tenant_id', user.id)
          .order('payment_date', { ascending: false })
          .limit(10);

        if (paymentError) throw paymentError;

        setPayments(data || []);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  return { payments, loading, error };
};