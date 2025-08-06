import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, User, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';

interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  payment_reminders: boolean;
  maintenance_updates: boolean;
  community_announcements: boolean;
  visitor_requests: boolean;
}

const Settings = () => {
  useSEO('settings');
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_id: '',
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    payment_reminders: true,
    maintenance_updates: true,
    community_announcements: true,
    visitor_requests: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Set user_id for new preferences
        setPreferences(prev => ({ ...prev, user_id: user?.id || '' }));
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      setSaving(true);
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(newPreferences, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      // Revert the change on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link to={ROUTES.TENANT} className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <SettingsIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to={ROUTES.TENANT} className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
            <p className="text-muted-foreground">
              Manage your preferences and notification settings
            </p>
          </div>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('system')}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Notification Channels</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.email_enabled}
                    onCheckedChange={(checked) => updatePreferences({ email_enabled: checked })}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive urgent notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={preferences.sms_enabled}
                    onCheckedChange={(checked) => updatePreferences({ sms_enabled: checked })}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={preferences.push_enabled}
                    onCheckedChange={(checked) => updatePreferences({ push_enabled: checked })}
                    disabled={saving}
                  />
                </div>
              </div>

              <Separator />

              {/* Notification Types */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Notification Types</Label>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="payment-reminders">Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders for upcoming rent and utility payments</p>
                  </div>
                  <Switch
                    id="payment-reminders"
                    checked={preferences.payment_reminders}
                    onCheckedChange={(checked) => updatePreferences({ payment_reminders: checked })}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="maintenance-updates">Maintenance Updates</Label>
                    <p className="text-sm text-muted-foreground">Updates on maintenance request status</p>
                  </div>
                  <Switch
                    id="maintenance-updates"
                    checked={preferences.maintenance_updates}
                    onCheckedChange={(checked) => updatePreferences({ maintenance_updates: checked })}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="community-announcements">Community Announcements</Label>
                    <p className="text-sm text-muted-foreground">Important announcements from property management</p>
                  </div>
                  <Switch
                    id="community-announcements"
                    checked={preferences.community_announcements}
                    onCheckedChange={(checked) => updatePreferences({ community_announcements: checked })}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="visitor-requests">Visitor Requests</Label>
                    <p className="text-sm text-muted-foreground">Notifications about visitor access requests</p>
                  </div>
                  <Switch
                    id="visitor-requests"
                    checked={preferences.visitor_requests}
                    onCheckedChange={(checked) => updatePreferences({ visitor_requests: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Password</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Change your account password to keep your account secure
                  </p>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Type</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user?.user_metadata?.role || 'Tenant'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;