import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UtilityBill {
  id: string;
  bill_type: string;
  amount: number;
  due_date: string;
  status: string;
  billing_period_start: string;
  billing_period_end: string;
  paid_at?: string;
}

export const useUtilityBills = () => {
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUtilityBills = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: billError } = await supabase
          .from('utility_bills')
          .select(`
            id,
            bill_type,
            amount,
            due_date,
            status,
            billing_period_start,
            billing_period_end,
            paid_at
          `)
          .eq('status', 'pending')
          .order('due_date', { ascending: true });

        if (billError) throw billError;

        setBills(data || []);
      } catch (err) {
        console.error('Error fetching utility bills:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch utility bills');
      } finally {
        setLoading(false);
      }
    };

    fetchUtilityBills();
  }, [user]);

  return { bills, loading, error };
};