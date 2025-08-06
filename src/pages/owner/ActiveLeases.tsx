import { useSEO } from '@/hooks/useSEO';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Eye, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Lease {
  id: string;
  tenant_name: string;
  unit_number: string;
  property_name: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
}

const ActiveLeases = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeases();
    }
  }, [user]);

  const fetchLeases = async () => {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          start_date,
          end_date,
          monthly_rent,
          security_deposit,
          status,
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
        .eq('units.properties.owner_id', user?.id);

      if (error) throw error;

      const formattedLeases = data?.map((lease: any) => ({
        id: lease.id,
        tenant_name: lease.profiles?.full_name || 'Unknown',
        unit_number: lease.units?.unit_number || 'N/A',
        property_name: lease.units?.properties?.name || 'Unknown Property',
        start_date: lease.start_date,
        end_date: lease.end_date,
        monthly_rent: lease.monthly_rent,
        security_deposit: lease.security_deposit,
        status: lease.status
      })) || [];

      setLeases(formattedLeases);
    } catch (error) {
      console.error('Error fetching leases:', error);
    } finally {
      setLoading(false);
    }
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
                  <h1 className="text-3xl font-bold">Active Leases</h1>
                  <p className="text-muted-foreground">Manage all active lease agreements</p>
                </div>
              </div>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Create New Lease
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Lease Agreements ({leases.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading leases...</div>
                ) : leases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active leases found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leases.map((lease) => (
                        <TableRow key={lease.id}>
                          <TableCell className="font-medium">{lease.tenant_name}</TableCell>
                          <TableCell>{lease.property_name}</TableCell>
                          <TableCell>{lease.unit_number}</TableCell>
                          <TableCell>${lease.monthly_rent.toLocaleString()}</TableCell>
                          <TableCell>{format(new Date(lease.start_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{format(new Date(lease.end_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="default">{lease.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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

export default ActiveLeases;