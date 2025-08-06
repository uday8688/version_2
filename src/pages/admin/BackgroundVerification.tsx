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
import { Shield, Search, Plus, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface BackgroundVerification {
  id: string;
  user_id: string;
  verification_type: string;
  document_number: string;
  document_url?: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  verified_by?: string;
  verified_at?: string;
  expiry_date?: string;
  api_response?: any;
  created_at: string;
  profiles?: {
    full_name?: string;
  } | null;
}

const AdminBackgroundVerification = () => {
  useSEO('dashboard');
  const { user } = useAuth();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<BackgroundVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewVerificationOpen, setIsNewVerificationOpen] = useState(false);
  const [newVerification, setNewVerification] = useState({
    user_id: '',
    verification_type: '',
    document_number: '',
    document_url: ''
  });

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('background_verifications')
        .select(`
          *,
          profiles!user_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications((data || []) as BackgroundVerification[]);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch background verifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (verificationId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('background_verifications')
        .update({
          verification_status: status,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Verification ${status} successfully`,
      });
      
      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive',
      });
    }
  };

  const initiateKYCVerification = async (verification: BackgroundVerification) => {
    try {
      // This would integrate with actual KYC APIs like Karza, DigiLocker, or Signzy
      // For now, we'll simulate the API call
      const mockAPIResponse = {
        status: 'verified',
        confidence_score: 0.95,
        document_valid: true,
        name_match: true,
        address_verified: true,
        api_provider: 'Karza',
        verification_timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('background_verifications')
        .update({
          verification_status: 'verified',
          api_response: mockAPIResponse,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (error) throw error;

      toast({
        title: 'KYC Verification Completed',
        description: 'Document verified successfully via external API',
      });
      
      fetchVerifications();
    } catch (error) {
      console.error('Error during KYC verification:', error);
      toast({
        title: 'Error',
        description: 'KYC verification failed',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, color: 'text-yellow-600', icon: Clock },
      verified: { variant: 'secondary' as const, color: 'text-green-600', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, color: 'text-red-600', icon: XCircle },
      expired: { variant: 'outline' as const, color: 'text-gray-600', icon: AlertTriangle }
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

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = 
      verification.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.verification_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || verification.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const verificationTypes = [
    'Aadhaar Card',
    'PAN Card',
    'Driving License',
    'Passport',
    'Voter ID',
    'Employment Verification',
    'Income Verification',
    'Police Verification'
  ];

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
                    <Shield className="h-5 w-5" />
                    <span>Background Verification</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">Manage KYC and document verification</p>
                </div>
              </div>
              <Dialog open={isNewVerificationOpen} onOpenChange={setIsNewVerificationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Verification
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Initiate Background Verification</DialogTitle>
                    <DialogDescription>
                      Start a new background verification process for a user
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="verification_type">Verification Type</Label>
                      <Select value={newVerification.verification_type} onValueChange={(value) => setNewVerification(prev => ({ ...prev, verification_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification type" />
                        </SelectTrigger>
                        <SelectContent>
                          {verificationTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="document_number">Document Number</Label>
                      <Input
                        id="document_number"
                        value={newVerification.document_number}
                        onChange={(e) => setNewVerification(prev => ({ ...prev, document_number: e.target.value }))}
                        placeholder="Enter document number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="document_url">Document URL (Optional)</Label>
                      <Input
                        id="document_url"
                        value={newVerification.document_url}
                        onChange={(e) => setNewVerification(prev => ({ ...prev, document_url: e.target.value }))}
                        placeholder="Upload or enter document URL"
                      />
                    </div>
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Initiate Verification
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, document number, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {verifications.filter(v => v.verification_status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Verified</p>
                      <p className="text-2xl font-bold text-green-600">
                        {verifications.filter(v => v.verification_status === 'verified').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {verifications.filter(v => v.verification_status === 'rejected').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{verifications.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verifications Table */}
            <Card>
              <CardHeader>
                <CardTitle>Background Verifications</CardTitle>
                <CardDescription>
                  Manage and review all background verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading verifications...
                        </TableCell>
                      </TableRow>
                    ) : filteredVerifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No verifications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVerifications.map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{verification.profiles?.full_name || 'Unknown User'}</p>
                            </div>
                          </TableCell>
                          <TableCell>{verification.verification_type}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm">{verification.document_number}</span>
                              {verification.document_url && (
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(verification.verification_status)}</TableCell>
                          <TableCell>
                            {new Date(verification.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {verification.verification_status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => initiateKYCVerification(verification)}
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    KYC Verify
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(verification.id, 'verified')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(verification.id, 'rejected')}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {verification.api_response && (
                                <Button variant="ghost" size="sm">
                                  <Download className="h-3 w-3" />
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

export default AdminBackgroundVerification;