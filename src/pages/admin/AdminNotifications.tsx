import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Send, 
  Users, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Plus,
  Search,
  User,
  Building,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  user_id: string;
  read_at: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface NotificationForm {
  title: string;
  message: string;
  type: string;
  recipient_type: string;
  specific_user_id?: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'info',
    recipient_type: 'all',
    specific_user_id: undefined,
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(n => n.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      // Combine the data
      const notificationsWithProfiles = data?.map(notification => ({
        ...notification,
        profiles: profiles?.find(p => p.user_id === notification.user_id)
      })) || [];

      setNotifications(notificationsWithProfiles);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, role')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendNotification = async () => {
    try {
      setSending(true);

      let recipientIds: string[] = [];

      if (notificationForm.recipient_type === 'all') {
        recipientIds = users.map(user => user.user_id);
      } else if (notificationForm.recipient_type === 'specific' && notificationForm.specific_user_id) {
        recipientIds = [notificationForm.specific_user_id];
      } else {
        // Filter by role
        recipientIds = users
          .filter(user => user.role === notificationForm.recipient_type)
          .map(user => user.user_id);
      }

      // Create notifications for all recipients
      const notificationsToInsert = recipientIds.map(userId => ({
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        user_id: userId,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Notification sent to ${recipientIds.length} users`,
      });

      setIsDialogOpen(false);
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        recipient_type: 'all',
        specific_user_id: undefined,
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const stats = {
    total: notifications.length,
    read: notifications.filter(n => n.read_at).length,
    unread: notifications.filter(n => !n.read_at).length,
    today: notifications.filter(n => {
      const today = new Date();
      const notificationDate = new Date(n.created_at);
      return notificationDate.toDateString() === today.toDateString();
    }).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Notification Management</h1>
            <p className="text-muted-foreground">Send and manage system notifications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Send New Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    placeholder="Notification message"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={notificationForm.type} onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipient">Recipients</Label>
                  <Select value={notificationForm.recipient_type} onValueChange={(value) => setNotificationForm({ ...notificationForm, recipient_type: value, specific_user_id: undefined })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="tenant">All Tenants</SelectItem>
                      <SelectItem value="owner">All Owners</SelectItem>
                      <SelectItem value="vendor">All Vendors</SelectItem>
                      <SelectItem value="specific">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {notificationForm.recipient_type === 'specific' && (
                  <div>
                    <Label htmlFor="specific_user">Select User</Label>
                    <Select value={notificationForm.specific_user_id} onValueChange={(value) => setNotificationForm({ ...notificationForm, specific_user_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.full_name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button 
                  onClick={sendNotification} 
                  disabled={sending || !notificationForm.title || !notificationForm.message}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.read}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.read / stats.total) * 100).toFixed(1) : 0}% read rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="grid gap-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(notification.type)}
                    {notification.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {notification.profiles?.full_name || 'Unknown User'}
                    </div>
                    <span>{format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getTypeVariant(notification.type)}>
                    {notification.type}
                  </Badge>
                  {notification.read_at ? (
                    <Badge variant="outline">Read</Badge>
                  ) : (
                    <Badge variant="secondary">Unread</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              {notification.read_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Read on {format(new Date(notification.read_at), 'MMM dd, yyyy HH:mm')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by sending your first notification'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}