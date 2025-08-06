import { useSEO } from '@/hooks/useSEO';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserCheck, Phone, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Tenant {
  id: string;
  full_name: string;
  avatar_url?: string;
  unit_number: string;
  property_name: string;
  lease_start: string;
  lease_end: string;
  monthly_rent: number;
  status: string;
}

const TenantDirectory = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTenants();
    }
  }, [user]);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          tenant_id,
          start_date,
          end_date,
          monthly_rent,
          status,
          units (
            unit_number,
            properties (
              name
            )
          ),
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .in('units.properties.owner_id', [user?.id]);

      if (error) throw error;

      const formattedTenants = data?.map((lease: any) => ({
        id: lease.tenant_id,
        full_name: lease.profiles?.full_name || 'Unknown',
        avatar_url: lease.profiles?.avatar_url,
        unit_number: lease.units?.unit_number || 'N/A',
        property_name: lease.units?.properties?.name || 'Unknown Property',
        lease_start: lease.start_date,
        lease_end: lease.end_date,
        monthly_rent: lease.monthly_rent,
        status: lease.status
      })) || [];

      setTenants(formattedTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.property_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <h1 className="text-3xl font-bold">Tenant Directory</h1>
                  <p className="text-muted-foreground">Manage and view all your tenants</p>
                </div>
              </div>
              <Button>
                <UserCheck className="h-4 w-4 mr-2" />
                Screen New Tenant
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search tenants, units, or properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading tenants...</div>
                ) : filteredTenants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tenants found
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTenants.map((tenant) => (
                      <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {tenant.full_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{tenant.full_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {tenant.property_name} - Unit {tenant.unit_number}
                              </p>
                              <p className="text-sm font-medium text-green-600">
                                ${tenant.monthly_rent}/month
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {tenant.status}
                                </Badge>
                              </div>
                              <div className="flex space-x-2 mt-3">
                                <Button size="sm" variant="outline">
                                  <Phone className="h-3 w-3 mr-1" />
                                  Call
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TenantDirectory;