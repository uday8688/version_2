import { useState, useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { UserCog, Search, Plus, Star, Phone, MapPin, Clock, CheckCircle, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ServiceProvider {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  specialties: string[];
  experience_years: number;
  hourly_rate: number;
  availability: 'available' | 'busy' | 'unavailable';
  rating: number;
  completed_jobs: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  created_at: string;
}

interface ServiceJob {
  id: string;
  maintenance_request_id: string;
  service_provider_id: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  scheduled_time?: string;
  invoice_amount?: number;
  notes?: string;
  completion_photos?: string[];
  created_at: string;
  maintenance_requests?: {
    title: string;
    tenant_id: string;
  };
}

const AdminServiceProviderManagement = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isAssignJobOpen, setIsAssignJobOpen] = useState(false);

  useEffect(() => {
    fetchProviders();
    fetchJobs();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      // Mock data for service providers since we don't have a dedicated table
      const mockProviders: ServiceProvider[] = [
        {
          id: '1',
          user_id: 'user1',
          full_name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+91 9876543210',
          service_type: 'Electrician',
          specialties: ['Wiring', 'Appliance Repair', 'Installation'],
          experience_years: 8,
          hourly_rate: 500,
          availability: 'available',
          rating: 4.8,
          completed_jobs: 156,
          verification_status: 'verified',
          is_active: true,
          created_at: '2023-01-15T00:00:00Z'
        },
        {
          id: '2',
          user_id: 'user2',
          full_name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 9876543211',
          service_type: 'Plumber',
          specialties: ['Pipe Repair', 'Bathroom Fitting', 'Water Heater'],
          experience_years: 6,
          hourly_rate: 450,
          availability: 'busy',
          rating: 4.6,
          completed_jobs: 98,
          verification_status: 'verified',
          is_active: true,
          created_at: '2023-02-20T00:00:00Z'
        },
        {
          id: '3',
          user_id: 'user3',
          full_name: 'Mohammed Ali',
          email: 'ali@example.com',
          phone: '+91 9876543212',
          service_type: 'Housekeeping',
          specialties: ['Deep Cleaning', 'Regular Cleaning', 'Carpet Cleaning'],
          experience_years: 4,
          hourly_rate: 300,
          availability: 'available',
          rating: 4.9,
          completed_jobs: 234,
          verification_status: 'verified',
          is_active: true,
          created_at: '2023-03-10T00:00:00Z'
        },
        {
          id: '4',
          user_id: 'user4',
          full_name: 'Suresh Patel',
          email: 'suresh@example.com',
          phone: '+91 9876543213',
          service_type: 'Security',
          specialties: ['Night Shift', 'CCTV Monitoring', 'Access Control'],
          experience_years: 12,
          hourly_rate: 400,
          availability: 'available',
          rating: 4.7,
          completed_jobs: 89,
          verification_status: 'verified',
          is_active: true,
          created_at: '2023-01-05T00:00:00Z'
        }
      ];
      
      setProviders(mockProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch service providers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('service_jobs')
        .select(`
          *,
          maintenance_requests(title, tenant_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data || []) as ServiceJob[]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleProviderStatusUpdate = async (providerId: string, status: 'verified' | 'rejected') => {
    try {
      // In a real app, this would update the service provider's verification status
      toast({
        title: 'Success',
        description: `Provider ${status} successfully`,
      });
      
      fetchProviders();
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to update provider status',
        variant: 'destructive',
      });
    }
  };

  const assignJobToProvider = async (maintenanceRequestId: string, providerId: string) => {
    try {
      const { error } = await supabase
        .from('service_jobs')
        .insert({
          maintenance_request_id: maintenanceRequestId,
          service_provider_id: providerId,
          status: 'assigned'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Job assigned to service provider successfully',
      });
      
      fetchJobs();
      setIsAssignJobOpen(false);
    } catch (error) {
      console.error('Error assigning job:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign job',
        variant: 'destructive',
      });
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants = {
      available: { variant: 'secondary' as const, color: 'text-green-600' },
      busy: { variant: 'outline' as const, color: 'text-yellow-600' },
      unavailable: { variant: 'destructive' as const, color: 'text-red-600' }
    };
    
    const config = variants[availability as keyof typeof variants] || variants.available;
    
    return (
      <Badge variant={config.variant} className="capitalize">
        {availability}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, icon: Clock },
      verified: { variant: 'secondary' as const, icon: CheckCircle },
      rejected: { variant: 'destructive' as const, icon: AlertTriangle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesServiceType = serviceTypeFilter === 'all' || provider.service_type.toLowerCase() === serviceTypeFilter;
    const matchesStatus = statusFilter === 'all' || provider.verification_status === statusFilter;
    
    return matchesSearch && matchesServiceType && matchesStatus;
  });

  const serviceTypes = ['Electrician', 'Plumber', 'Housekeeping', 'Security', 'Carpenter', 'Painter', 'Cook'];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <SidebarInset className="flex-1">
          <header className="border-b bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold flex items-center space-x-2">
                    <UserCog className="h-5 w-5" />
                    <span>Service Provider Management</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">Manage and coordinate service providers</p>
                </div>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>
          </header>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search providers by name, type, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserCog className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total Providers</p>
                      <p className="text-2xl font-bold text-blue-600">{providers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Available</p>
                      <p className="text-2xl font-bold text-green-600">
                        {providers.filter(p => p.availability === 'available').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Active Jobs</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {jobs.filter(j => j.status === 'assigned' || j.status === 'in_progress').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Avg Rating</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {providers.length > 0 ? (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1) : '0.0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Providers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Service Providers</CardTitle>
                <CardDescription>
                  Manage all registered service providers and their assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading providers...
                        </TableCell>
                      </TableRow>
                    ) : filteredProviders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No providers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{provider.full_name}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{provider.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{provider.service_type}</p>
                              <p className="text-sm text-muted-foreground">
                                {provider.specialties.slice(0, 2).join(', ')}
                                {provider.specialties.length > 2 && ` +${provider.specialties.length - 2}`}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{provider.experience_years} years</TableCell>
                          <TableCell>₹{provider.hourly_rate}/hr</TableCell>
                          <TableCell>{getAvailabilityBadge(provider.availability)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{provider.rating}</span>
                              <span className="text-sm text-muted-foreground">({provider.completed_jobs})</span>
                            </div>
                          </TableCell>
                          <TableCell>{getVerificationBadge(provider.verification_status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              {provider.verification_status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleProviderStatusUpdate(provider.id, 'verified')}
                                >
                                  Verify
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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

export default AdminServiceProviderManagement;