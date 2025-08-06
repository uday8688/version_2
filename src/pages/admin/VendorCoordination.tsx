import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  UserCog, 
  Plus, 
  Search, 
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Vendor {
  id: string;
  name: string;
  service_type: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  last_service: string;
  total_jobs: number;
}

const VendorCoordination = () => {
  useSEO('dashboard');
  
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: '1',
      name: 'Quick Clean Services',
      service_type: 'Cleaning',
      email: 'contact@quickclean.com',
      phone: '+91 98765 43210',
      location: 'Bangalore',
      rating: 4.8,
      status: 'active',
      last_service: '2025-08-03',
      total_jobs: 156
    },
    {
      id: '2',
      name: 'SecureGuard Security',
      service_type: 'Security',
      email: 'admin@secureguard.com',
      phone: '+91 98765 43211',
      location: 'Bangalore',
      rating: 4.9,
      status: 'active',
      last_service: '2025-08-04',
      total_jobs: 89
    },
    {
      id: '3',
      name: 'Chef Paradise',
      service_type: 'Cooking',
      email: 'orders@chefparadise.com',
      phone: '+91 98765 43212',
      location: 'Bangalore',
      rating: 4.7,
      status: 'active',
      last_service: '2025-08-02',
      total_jobs: 203
    },
    {
      id: '4',
      name: 'Home Helper Maids',
      service_type: 'Housekeeping',
      email: 'services@homehelper.com',
      phone: '+91 98765 43213',
      location: 'Bangalore',
      rating: 4.6,
      status: 'active',
      last_service: '2025-08-01',
      total_jobs: 78
    },
    {
      id: '5',
      name: 'Night Watch Security',
      service_type: 'Watchman',
      email: 'contact@nightwatch.com',
      phone: '+91 98765 43214',
      location: 'Bangalore',
      rating: 4.5,
      status: 'pending',
      last_service: 'N/A',
      total_jobs: 0
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    const colors = {
      'Cleaning': 'bg-blue-100 text-blue-700',
      'Security': 'bg-red-100 text-red-700',
      'Cooking': 'bg-green-100 text-green-700',
      'Housekeeping': 'bg-purple-100 text-purple-700',
      'Watchman': 'bg-orange-100 text-orange-700',
    };
    return colors[serviceType as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const serviceStats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    pending: vendors.filter(v => v.status === 'pending').length,
    inactive: vendors.filter(v => v.status === 'inactive').length,
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

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
                  <h1 className="text-xl font-semibold">Vendor Coordination</h1>
                  <p className="text-sm text-muted-foreground">Manage service providers and contractors</p>
                </div>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          </header>

          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserCog className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total Vendors</p>
                      <p className="text-2xl font-bold text-blue-600">{serviceStats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-2xl font-bold text-green-600">{serviceStats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">{serviceStats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Inactive</p>
                      <p className="text-2xl font-bold text-red-600">{serviceStats.inactive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getServiceTypeColor(vendor.service_type)}`}>
                          {vendor.service_type}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(vendor.status)} className="capitalize">
                        {vendor.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vendor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vendor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vendor.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        {renderStars(vendor.rating)}
                        <span className="text-sm font-medium ml-1">{vendor.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{vendor.total_jobs} jobs</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Service:</span>
                      <span>{vendor.last_service}</span>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Contact
                      </Button>
                      <Button size="sm" className="flex-1">
                        Assign Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVendors.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Vendors Found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? 'No vendors match your search criteria.' : 'Start by adding your first vendor.'}
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VendorCoordination;