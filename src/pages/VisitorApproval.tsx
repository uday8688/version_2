import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus,
  Search,
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VisitorRequest {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  purpose: string;
  visit_date: string;
  visit_time: string;
  status: string;
  notes?: string;
  created_at: string;
  tenant_id: string;
  approved_by?: string;
  approval_time?: string;
  check_in_time?: string;
  check_out_time?: string;
}

const VisitorApproval = () => {
  useSEO('visitors');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form state for creating visitor requests
  const [newRequest, setNewRequest] = useState({
    visitor_name: '',
    visitor_phone: '',
    visitor_email: '',
    purpose: '',
    visit_date: '',
    visit_time: '',
    notes: ''
  });

  useEffect(() => {
    fetchVisitorRequests();
  }, []);

  const fetchVisitorRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitor_requests')
        .select('*')
        .eq('tenant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitorRequests(data || []);
    } catch (error) {
      console.error('Error fetching visitor requests:', error);
      toast({
        title: "Error",
        description: "Failed to load visitor requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create visitor requests.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('visitor_requests')
        .insert({
          ...newRequest,
          tenant_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Visitor request created successfully!",
      });

      setShowCreateDialog(false);
      setNewRequest({
        visitor_name: '',
        visitor_phone: '',
        visitor_email: '',
        purpose: '',
        visit_date: '',
        visit_time: '',
        notes: ''
      });
      fetchVisitorRequests();

      // Create notification for property management
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Visitor Request Submitted',
          message: `Visitor request for ${newRequest.visitor_name} has been submitted for approval.`,
          type: 'info'
        });

    } catch (error) {
      console.error('Error creating visitor request:', error);
      toast({
        title: "Error",
        description: "Failed to create visitor request.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'checked_in':
        return 'secondary';
      case 'checked_out':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'checked_in':
        return <Eye className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = visitorRequests.filter(request =>
    request.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestStats = {
    total: visitorRequests.length,
    pending: visitorRequests.filter(r => r.status === 'pending').length,
    approved: visitorRequests.filter(r => r.status === 'approved').length,
    rejected: visitorRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={ROUTES.TENANT} className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Visitor Management</h1>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Visitor Access
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Request Visitor Access</DialogTitle>
                  <DialogDescription>
                    Submit a request for visitor approval
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Visitor Name</label>
                      <Input
                        required
                        value={newRequest.visitor_name}
                        onChange={(e) => setNewRequest(prev => ({...prev, visitor_name: e.target.value}))}
                        placeholder="Full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <Input
                        required
                        type="tel"
                        value={newRequest.visitor_phone}
                        onChange={(e) => setNewRequest(prev => ({...prev, visitor_phone: e.target.value}))}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                    <Input
                      type="email"
                      value={newRequest.visitor_email}
                      onChange={(e) => setNewRequest(prev => ({...prev, visitor_email: e.target.value}))}
                      placeholder="visitor@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Purpose of Visit</label>
                    <Input
                      required
                      value={newRequest.purpose}
                      onChange={(e) => setNewRequest(prev => ({...prev, purpose: e.target.value}))}
                      placeholder="Personal visit, delivery, maintenance, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Visit Date</label>
                      <Input
                        type="date"
                        required
                        value={newRequest.visit_date}
                        onChange={(e) => setNewRequest(prev => ({...prev, visit_date: e.target.value}))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Expected Time</label>
                      <Input
                        type="time"
                        required
                        value={newRequest.visit_time}
                        onChange={(e) => setNewRequest(prev => ({...prev, visit_time: e.target.value}))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Additional Notes</label>
                    <Textarea
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest(prev => ({...prev, notes: e.target.value}))}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Request</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Requests</p>
                    <p className="text-2xl font-bold text-blue-600">{requestStats.total}</p>
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
                    <p className="text-2xl font-bold text-orange-600">{requestStats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{requestStats.approved}</p>
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
                    <p className="text-2xl font-bold text-red-600">{requestStats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search visitor requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visitor Requests */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No visitor requests found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first visitor request to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-lg">{request.visitor_name}</h3>
                            <p className="text-sm text-muted-foreground">{request.purpose}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{request.visitor_phone}</span>
                          </div>
                          {request.visitor_email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{request.visitor_email}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(request.visit_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{request.visit_time}</span>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">{request.notes}</p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Requested on {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                          {request.approval_time && (
                            <span className="ml-2">
                              • Processed on {new Date(request.approval_time).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorApproval;