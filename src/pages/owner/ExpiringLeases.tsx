import { useSEO } from '@/hooks/useSEO';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Calendar, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, differenceInDays } from 'date-fns';

interface ExpiringLease {
  id: string;
  tenant_name: string;
  unit_number: string;
  property_name: string;
  end_date: string;
  monthly_rent: number;
  days_remaining: number;
  urgency: 'critical' | 'urgent' | 'moderate';
}

const ExpiringLeases = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const [expiringLeases, setExpiringLeases] = useState<ExpiringLease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExpiringLeases();
    }
  }, [user]);

  const fetchExpiringLeases = async () => {
    try {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          end_date,
          monthly_rent,
          units (
            unit_number,
            properties (
              name,
              owner_id
            )
          ),
          profiles (
            full_name
          )
        `)
        .eq('status', 'active')
        .eq('units.properties.owner_id', user?.id)
        .lte('end_date', ninetyDaysFromNow.toISOString().split('T')[0]);

      if (error) throw error;

      const today = new Date();
      const formattedLeases = data?.map((lease: any) => {
        const endDate = new Date(lease.end_date);
        const daysRemaining = differenceInDays(endDate, today);
        
        let urgency: 'critical' | 'urgent' | 'moderate' = 'moderate';
        if (daysRemaining <= 30) urgency = 'critical';
        else if (daysRemaining <= 60) urgency = 'urgent';

        return {
          id: lease.id,
          tenant_name: lease.profiles?.full_name || 'Unknown',
          unit_number: lease.units?.unit_number || 'N/A',
          property_name: lease.units?.properties?.name || 'Unknown Property',
          end_date: lease.end_date,
          monthly_rent: lease.monthly_rent,
          days_remaining: daysRemaining,
          urgency
        };
      }) || [];

      // Sort by urgency and days remaining
      formattedLeases.sort((a, b) => {
        const urgencyOrder = { critical: 0, urgent: 1, moderate: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.days_remaining - b.days_remaining;
      });

      setExpiringLeases(formattedLeases);
    } catch (error) {
      console.error('Error fetching expiring leases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string, daysRemaining: number) => {
    const variants = {
      critical: { variant: 'destructive' as const, text: `${daysRemaining} days left` },
      urgent: { variant: 'secondary' as const, text: `${daysRemaining} days left` },
      moderate: { variant: 'outline' as const, text: `${daysRemaining} days left` }
    };
    return variants[urgency as keyof typeof variants] || variants.moderate;
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
                  <h1 className="text-3xl font-bold flex items-center">
                    <AlertTriangle className="h-8 w-8 mr-3 text-orange-500" />
                    Expiring Leases
                  </h1>
                  <p className="text-muted-foreground">Leases expiring within 90 days</p>
                </div>
              </div>
            </div>

            {expiringLeases.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Critical (≤30 days)</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {expiringLeases.filter(l => l.urgency === 'critical').length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Urgent (31-60 days)</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {expiringLeases.filter(l => l.urgency === 'urgent').length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Moderate (61-90 days)</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {expiringLeases.filter(l => l.urgency === 'moderate').length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Expiring Lease Agreements ({expiringLeases.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading expiring leases...</div>
                ) : expiringLeases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No leases expiring in the next 90 days
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringLeases.map((lease) => {
                        const badgeProps = getUrgencyBadge(lease.urgency, lease.days_remaining);
                        return (
                          <TableRow key={lease.id}>
                            <TableCell className="font-medium">{lease.tenant_name}</TableCell>
                            <TableCell>{lease.property_name}</TableCell>
                            <TableCell>{lease.unit_number}</TableCell>
                            <TableCell>${lease.monthly_rent.toLocaleString()}</TableCell>
                            <TableCell>{format(new Date(lease.end_date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              <Badge variant={badgeProps.variant}>{badgeProps.text}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Renew
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Phone className="h-3 w-3 mr-1" />
                                  Contact
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExpiringLeases;