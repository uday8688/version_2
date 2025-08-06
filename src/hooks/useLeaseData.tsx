import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LeaseData {
  id: string;
  unit_number: string;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  status: string;
  property_name?: string;
  property_address?: string;
}

export const useLeaseData = () => {
  const [lease, setLease] = useState<LeaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaseData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: leaseError } = await supabase
          .from('leases')
          .select(`
            id,
            monthly_rent,
            start_date,
            end_date,
            status,
            units (
              unit_number,
              properties (
                name,
                address,
                city,
                state
              )
            )
          `)
          .eq('tenant_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (leaseError) throw leaseError;

        if (data) {
          setLease({
            id: data.id,
            unit_number: data.units.unit_number,
            monthly_rent: data.monthly_rent,
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status,
            property_name: data.units.properties.name,
            property_address: `${data.units.properties.address}, ${data.units.properties.city}, ${data.units.properties.state}`
          });
        }
      } catch (err) {
        console.error('Error fetching lease data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch lease data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseData();
  }, [user]);

  return { lease, loading, error };
};