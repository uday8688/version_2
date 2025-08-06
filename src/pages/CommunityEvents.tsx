import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Filter,
  Search,
  ArrowLeft
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

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants?: number;
  current_participants: number;
  registration_required: boolean;
  is_active: boolean;
  created_by: string;
  property_id: string;
  created_at: string;
}

const CommunityEvents = () => {
  useSEO('community');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form state for creating events
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'all' as const,
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: '',
    registration_required: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load community events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create events.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's property (simplified - in real app would be more complex)
      const { data: lease } = await supabase
        .from('leases')
        .select('unit:units(property_id)')
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .single();

      const propertyId = lease?.unit?.property_id;
      if (!propertyId) {
        toast({
          title: "Error",
          description: "Unable to determine your property.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('community_events')
        .insert({
          ...newEvent,
          max_participants: newEvent.max_participants ? parseInt(newEvent.max_participants) : null,
          created_by: user.id,
          property_id: propertyId
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Community event created successfully!",
      });

      setShowCreateDialog(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'all',
        event_date: '',
        start_time: '',
        end_time: '',
        location: '',
        max_participants: '',
        registration_required: false
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
    }
  };

  const handleRegisterForEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully registered for the event!",
      });

      // Update current participants count
      const event = events.find(e => e.id === eventId);
      if (event) {
        await supabase
          .from('community_events')
          .update({ current_participants: event.current_participants + 1 })
          .eq('id', eventId);
        
        fetchEvents();
      }
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Already Registered",
          description: "You're already registered for this event.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to register for event.",
          variant: "destructive",
        });
      }
    }
  };

  const getEventTypeBadge = (type: string) => {
    const variants = {
      kids: 'bg-blue-100 text-blue-800',
      adults: 'bg-green-100 text-green-800', 
      elderly: 'bg-purple-100 text-purple-800',
      all: 'bg-orange-100 text-orange-800'
    };
    return variants[type as keyof typeof variants] || variants.all;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
    return matchesSearch && matchesType;
  });

  const upcomingEvents = filteredEvents.filter(event => new Date(event.event_date) >= new Date());
  const pastEvents = filteredEvents.filter(event => new Date(event.event_date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={ROUTES.TENANT} className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Community Events</h1>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Community Event</DialogTitle>
                  <DialogDescription>
                    Organize events for your apartment community
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Title</label>
                    <Input
                      required
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({...prev, title: e.target.value}))}
                      placeholder="Kids Movie Night, Senior Yoga, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      required
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({...prev, description: e.target.value}))}
                      placeholder="Describe the event details..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Type</label>
                      <Select value={newEvent.event_type} onValueChange={(value: any) => setNewEvent(prev => ({...prev, event_type: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="kids">Kids</SelectItem>
                          <SelectItem value="adults">Adults</SelectItem>
                          <SelectItem value="elderly">Elderly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Participants</label>
                      <Input
                        type="number"
                        min="1"
                        value={newEvent.max_participants}
                        onChange={(e) => setNewEvent(prev => ({...prev, max_participants: e.target.value}))}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Date</label>
                    <Input
                      type="date"
                      required
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent(prev => ({...prev, event_date: e.target.value}))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <Input
                        type="time"
                        required
                        value={newEvent.start_time}
                        onChange={(e) => setNewEvent(prev => ({...prev, start_time: e.target.value}))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">End Time</label>
                      <Input
                        type="time"
                        required
                        value={newEvent.end_time}
                        onChange={(e) => setNewEvent(prev => ({...prev, end_time: e.target.value}))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      required
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({...prev, location: e.target.value}))}
                      placeholder="Community Hall, Garden, Terrace, etc."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="registration"
                      checked={newEvent.registration_required}
                      onChange={(e) => setNewEvent(prev => ({...prev, registration_required: e.target.checked}))}
                      className="rounded"
                    />
                    <label htmlFor="registration" className="text-sm">Require registration</label>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Event</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="adults">Adults</SelectItem>
                    <SelectItem value="elderly">Elderly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Be the first to organize a community event!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={getEventTypeBadge(event.event_type)}>
                              {event.event_type === 'all' ? 'All Ages' : event.event_type}
                            </Badge>
                            {event.registration_required && (
                              <Badge variant="outline">Registration Required</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{event.start_time} - {event.end_time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                        {event.max_participants && (
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{event.current_participants}/{event.max_participants}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.registration_required && (
                        <Button 
                          className="w-full" 
                          onClick={() => handleRegisterForEvent(event.id)}
                          disabled={event.max_participants ? event.current_participants >= event.max_participants : false}
                        >
                          {event.max_participants && event.current_participants >= event.max_participants 
                            ? 'Event Full' 
                            : 'Register Now'
                          }
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Past Events</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastEvents.slice(0, 4).map((event) => (
                  <Card key={event.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        <span>{event.location}</span>
                        {event.max_participants && (
                          <span>{event.current_participants} attended</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityEvents;