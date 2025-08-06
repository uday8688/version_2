import { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

const Maintenance = () => {
  useSEO('maintenance');
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: '',
    description: '',
    unit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Maintenance request submitted successfully!');
    setFormData({ title: '', category: '', priority: '', description: '', unit: '' });
    setShowForm(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={ROUTES.HOME} className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Wrench className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Maintenance</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{user?.role}</Badge>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {!showForm ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Maintenance Requests</h2>
                <p className="text-muted-foreground">Track and manage your maintenance requests</p>
              </div>

              {/* Request List */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Kitchen Faucet Leak</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Water is dripping from the kitchen faucet continuously. It's been going on for 2 days now.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Unit 4B</span>
                            <span>•</span>
                            <span>Submitted 2 days ago</span>
                            <span>•</span>
                            <span>Plumbing</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="destructive">High Priority</Badge>
                        <Badge>In Progress</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">AC Filter Replacement</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            AC filter needs to be replaced as it's been 6 months since the last change.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Unit 4B</span>
                            <span>•</span>
                            <span>Completed 1 week ago</span>
                            <span>•</span>
                            <span>HVAC</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary">Medium Priority</Badge>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Bedroom Light Switch</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            The light switch in the master bedroom is not working properly.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Unit 4B</span>
                            <span>•</span>
                            <span>Submitted 3 days ago</span>
                            <span>•</span>
                            <span>Electrical</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary">Low Priority</Badge>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Submit Maintenance Request</CardTitle>
                <CardDescription>
                  Describe the issue you're experiencing and we'll get it resolved quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Request Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="hvac">HVAC</SelectItem>
                          <SelectItem value="appliances">Appliances</SelectItem>
                          <SelectItem value="flooring">Flooring</SelectItem>
                          <SelectItem value="windows">Windows/Doors</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit Number *</Label>
                    <Input
                      id="unit"
                      placeholder="e.g. 4B, 301, etc."
                      value={formData.unit}
                      onChange={(e) => handleChange('unit', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about the issue, including when it started and any steps you've already taken."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" className="flex-1">
                      Submit Request
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;