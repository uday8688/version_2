import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Send,
  AlertTriangle,
  Info,
  AlertCircle
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/navigation/AdminSidebar';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high';
  is_active: boolean;
  property_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const AdminAnnouncements = () => {
  useSEO('dashboard');
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []).map(item => ({
        ...item,
        priority: item.priority as 'low' | 'normal' | 'high'
      })));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            content: formData.content,
            priority: formData.priority,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Announcement updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: formData.title,
            content: formData.content,
            priority: formData.priority,
            is_active: formData.is_active,
            created_by: user.id,
            property_id: 'default' // You might want to handle property selection
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Announcement created successfully.",
        });
      }

      setIsDialogOpen(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', priority: 'normal', is_active: true });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: "Error",
        description: "Failed to save announcement.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      is_active: announcement.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully.",
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement.",
        variant: "destructive",
      });
    }
  };

  const toggleActiveStatus = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !announcement.is_active })
        .eq('id', announcement.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Announcement ${!announcement.is_active ? 'activated' : 'deactivated'} successfully.`,
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement status:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement status.",
        variant: "destructive",
      });
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'normal':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'normal':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const announcementStats = {
    total: announcements.length,
    active: announcements.filter(a => a.is_active).length,
    inactive: announcements.filter(a => !a.is_active).length,
    high: announcements.filter(a => a.priority === 'high').length,
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
                  <h1 className="text-xl font-semibold">Announcements Management</h1>
                  <p className="text-sm text-muted-foreground">Create and manage community announcements</p>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingAnnouncement(null);
                    setFormData({ title: '', content: '', priority: 'normal', is_active: true });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAnnouncement ? 'Update the announcement details.' : 'Create a new announcement for the community.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Announcement title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Announcement content"
                        rows={6}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value: 'low' | 'normal' | 'high') => setFormData({ ...formData, priority: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.is_active ? 'active' : 'inactive'} onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Send className="h-4 w-4 mr-2" />
                        {editingAnnouncement ? 'Update' : 'Create'} Announcement
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{announcementStats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-2xl font-bold text-green-600">{announcementStats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">Inactive</p>
                      <p className="text-2xl font-bold text-gray-600">{announcementStats.inactive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">High Priority</p>
                      <p className="text-2xl font-bold text-red-600">{announcementStats.high}</p>
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
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                          <div className="h-16 bg-muted rounded animate-pulse" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getPriorityIcon(announcement.priority)}
                            <h3 className="text-lg font-semibold">{announcement.title}</h3>
                            <Badge variant={getPriorityBadgeVariant(announcement.priority)} className="capitalize">
                              {announcement.priority}
                            </Badge>
                            <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                              {announcement.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{announcement.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Created: {format(new Date(announcement.created_at), 'MMM d, yyyy')}</span>
                            <span>Updated: {format(new Date(announcement.updated_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => toggleActiveStatus(announcement)}>
                            {announcement.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(announcement.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Announcements Found</h3>
                    <p className="text-muted-foreground text-center">
                      {searchTerm ? 'No announcements match your search criteria.' : 'Start by creating your first announcement.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminAnnouncements;