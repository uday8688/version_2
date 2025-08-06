import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  Users, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Play,
  Monitor
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VisitorRequest {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visiting_unit: string;
  tenant_name: string;
  purpose: string;
  requested_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out';
  approval_time?: string;
  check_in_time?: string;
  check_out_time?: string;
}

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  last_activity: string;
}

const VisitorMonitoring = () => {
  useSEO('dashboard');
  
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([
    {
      id: '1',
      visitor_name: 'John Smith',
      visitor_phone: '+91 98765 43210',
      visiting_unit: 'A-101',
      tenant_name: 'Priya Sharma',
      purpose: 'Delivery',
      requested_time: '2025-08-04T14:30:00',
      status: 'pending'
    },
    {
      id: '2',
      visitor_name: 'Sarah Johnson',
      visitor_phone: '+91 98765 43211',
      visiting_unit: 'B-205',
      tenant_name: 'Rahul Kumar',
      purpose: 'Personal Visit',
      requested_time: '2025-08-04T15:00:00',
      status: 'approved',
      approval_time: '2025-08-04T14:45:00'
    },
    {
      id: '3',
      visitor_name: 'Mike Wilson',
      visitor_phone: '+91 98765 43212',
      visiting_unit: 'C-301',
      tenant_name: 'Anita Patel',
      purpose: 'Maintenance',
      requested_time: '2025-08-04T13:00:00',
      status: 'checked_in',
      approval_time: '2025-08-04T12:45:00',
      check_in_time: '2025-08-04T13:05:00'
    }
  ]);

  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>([
    {
      id: '1',
      name: 'Main Entrance',
      location: 'Building A - Ground Floor',
      status: 'online',
      last_activity: '2025-08-04T15:30:00'
    },
    {
      id: '2',
      name: 'Parking Area',
      location: 'Basement Level 1',
      status: 'online',
      last_activity: '2025-08-04T15:28:00'
    },
    {
      id: '3',
      name: 'Lobby Camera 1',
      location: 'Building B - Lobby',
      status: 'online',
      last_activity: '2025-08-04T15:29:00'
    },
    {
      id: '4',
      name: 'Garden View',
      location: 'Common Area',
      status: 'maintenance',
      last_activity: '2025-08-04T12:00:00'
    },
    {
      id: '5',
      name: 'Emergency Exit',
      location: 'Building C - Rear',
      status: 'offline',
      last_activity: '2025-08-04T10:15:00'
    },
    {
      id: '6',
      name: 'Rooftop Access',
      location: 'Building A - Terrace',
      status: 'online',
      last_activity: '2025-08-04T15:25:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

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

  const getCameraStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-red-600';
      case 'maintenance':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCameraStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
        return <XCircle className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = visitorRequests.filter(request =>
    request.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.visiting_unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestStats = {
    total: visitorRequests.length,
    pending: visitorRequests.filter(r => r.status === 'pending').length,
    approved: visitorRequests.filter(r => r.status === 'approved').length,
    checkedIn: visitorRequests.filter(r => r.status === 'checked_in').length,
  };

  const cameraStats = {
    total: cameraFeeds.length,
    online: cameraFeeds.filter(c => c.status === 'online').length,
    offline: cameraFeeds.filter(c => c.status === 'offline').length,
    maintenance: cameraFeeds.filter(c => c.status === 'maintenance').length,
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
                  <h1 className="text-xl font-semibold">Visitor Monitoring</h1>
                  <p className="text-sm text-muted-foreground">Camera feeds and visitor access control</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            <Tabs defaultValue="visitors" className="space-y-6">
              <TabsList>
                <TabsTrigger value="visitors">Visitor Requests</TabsTrigger>
                <TabsTrigger value="cameras">Camera Monitoring</TabsTrigger>
              </TabsList>

              <TabsContent value="visitors" className="space-y-6">
                {/* Visitor Stats */}
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
                        <Eye className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Checked In</p>
                          <p className="text-2xl font-bold text-purple-600">{requestStats.checkedIn}</p>
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
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold text-lg">{request.visitor_name}</h3>
                                <p className="text-sm text-muted-foreground">{request.visitor_phone}</p>
                              </div>
                              <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                                {request.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Visiting:</span>
                                <p className="font-medium">{request.visiting_unit}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tenant:</span>
                                <p className="font-medium">{request.tenant_name}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Purpose:</span>
                                <p className="font-medium">{request.purpose}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Requested:</span>
                                <p className="font-medium">{new Date(request.requested_time).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button size="sm">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <Button size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Check In
                              </Button>
                            )}
                            {request.status === 'checked_in' && (
                              <Button size="sm" variant="outline">
                                <XCircle className="h-4 w-4 mr-2" />
                                Check Out
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="cameras" className="space-y-6">
                {/* Camera Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Total Cameras</p>
                          <p className="text-2xl font-bold text-blue-600">{cameraStats.total}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Online</p>
                          <p className="text-2xl font-bold text-green-600">{cameraStats.online}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Maintenance</p>
                          <p className="text-2xl font-bold text-orange-600">{cameraStats.maintenance}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Offline</p>
                          <p className="text-2xl font-bold text-red-600">{cameraStats.offline}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Camera Feeds Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cameraFeeds.map((camera) => (
                    <Card key={camera.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{camera.name}</CardTitle>
                          <div className={`flex items-center space-x-1 ${getCameraStatusColor(camera.status)}`}>
                            {getCameraStatusIcon(camera.status)}
                            <span className="text-sm capitalize">{camera.status}</span>
                          </div>
                        </div>
                        <CardDescription>{camera.location}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Camera Feed Placeholder */}
                        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                          {camera.status === 'online' ? (
                            <div className="text-white flex flex-col items-center space-y-2">
                              <Monitor className="h-8 w-8" />
                              <span className="text-sm">Live Feed</span>
                            </div>
                          ) : (
                            <div className="text-gray-400 flex flex-col items-center space-y-2">
                              <XCircle className="h-8 w-8" />
                              <span className="text-sm">No Signal</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span>{new Date(camera.last_activity).toLocaleString()}</span>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1" disabled={camera.status !== 'online'}>
                            <Play className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default VisitorMonitoring;