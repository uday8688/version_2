import { useSEO } from '@/hooks/useSEO';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/navigation/OwnerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { useState } from 'react';

// Mock data for demonstration
const extensionRequests = [
  {
    id: '1',
    tenant_name: 'John Smith',
    property_name: 'Sunset Apartments',
    unit_number: '101',
    current_end_date: '2024-12-31',
    requested_extension: '60 days',
    new_end_date: '2025-03-01',
    monthly_rent: 1200,
    status: 'pending',
    request_date: '2024-11-15',
    reason: 'Job relocation delayed, need additional time to find new housing'
  },
  {
    id: '2',
    tenant_name: 'Sarah Johnson',
    property_name: 'Garden View Complex',
    unit_number: '205',
    current_end_date: '2024-11-30',
    requested_extension: '90 days',
    new_end_date: '2025-02-28',
    monthly_rent: 1400,
    status: 'approved',
    request_date: '2024-10-01',
    reason: 'Family emergency requires extended stay'
  },
  {
    id: '3',
    tenant_name: 'Mike Davis',
    property_name: 'Downtown Lofts',
    unit_number: '302',
    current_end_date: '2025-01-15',
    requested_extension: '60 days',
    new_end_date: '2025-03-15',
    monthly_rent: 1800,
    status: 'rejected',
    request_date: '2024-11-20',
    reason: 'Lease violation history'
  }
];

const LeaseExtensions = () => {
  useSEO('dashboard');
  const [requests, setRequests] = useState(extensionRequests);

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'approved' } : req
    ));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected' }
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

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
                  <h1 className="text-3xl font-bold">Lease Extension Requests</h1>
                  <p className="text-muted-foreground">Review and approve lease extension requests (60-90 days)</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Pending Review</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Rejected</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Extension Requests ({requests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Current End Date</TableHead>
                      <TableHead>Extension Period</TableHead>
                      <TableHead>New End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => {
                      const statusBadge = getStatusBadge(request.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.tenant_name}</TableCell>
                          <TableCell>{request.property_name}</TableCell>
                          <TableCell>{request.unit_number}</TableCell>
                          <TableCell>{new Date(request.current_end_date).toLocaleDateString()}</TableCell>
                          <TableCell>{request.requested_extension}</TableCell>
                          <TableCell>{new Date(request.new_end_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant} className="flex items-center space-x-1">
                              <StatusIcon className="h-3 w-3" />
                              <span>{statusBadge.text}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {request.status === 'pending' ? (
                                <>
                                  <Button size="sm" onClick={() => handleApprove(request.id)}>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View Details
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LeaseExtensions;