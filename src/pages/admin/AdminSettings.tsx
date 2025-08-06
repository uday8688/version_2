import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Bell, 
  Mail, 
  Database, 
  Users, 
  Building, 
  CreditCard,
  Eye,
  Lock,
  Globe,
  Smartphone,
  Save,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    ipWhitelist: boolean;
    auditLogging: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    maintenanceAlerts: boolean;
    paymentReminders: boolean;
  };
  features: {
    tenantPortal: boolean;
    ownerPortal: boolean;
    maintenanceModule: boolean;
    paymentModule: boolean;
    visitorManagement: boolean;
  };
  integration: {
    stripeEnabled: boolean;
    twilioEnabled: boolean;
    emailProvider: string;
    backupFrequency: string;
  };
}

export default function AdminSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'AptCircle',
      siteDescription: 'Property Management Platform',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: false,
      auditLogging: true,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      maintenanceAlerts: true,
      paymentReminders: true,
    },
    features: {
      tenantPortal: true,
      ownerPortal: true,
      maintenanceModule: true,
      paymentModule: true,
      visitorManagement: true,
    },
    integration: {
      stripeEnabled: true,
      twilioEnabled: false,
      emailProvider: 'sendgrid',
      backupFrequency: 'daily',
    },
  });

  const saveSettings = async () => {
    try {
      setSaving(true);
      // In a real app, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Settings Saved',
        description: 'System settings have been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateGeneralSetting = (key: keyof SystemSettings['general'], value: string) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [key]: value }
    }));
  };

  const updateSecuritySetting = (key: keyof SystemSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [key]: value }
    }));
  };

  const updateNotificationSetting = (key: keyof SystemSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updateFeatureSetting = (key: keyof SystemSettings['features'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
  };

  const updateIntegrationSetting = (key: keyof SystemSettings['integration'], value: any) => {
    setSettings(prev => ({
      ...prev,
      integration: { ...prev.integration, [key]: value }
    }));
  };

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
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure platform settings and permissions</p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.general.siteName}
                  onChange={(e) => updateGeneralSetting('siteName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.general.timezone} onValueChange={(value) => updateGeneralSetting('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">Eastern Time</SelectItem>
                    <SelectItem value="PST">Pacific Time</SelectItem>
                    <SelectItem value="CST">Central Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={settings.general.dateFormat} onValueChange={(value) => updateGeneralSetting('dateFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.general.currency} onValueChange={(value) => updateGeneralSetting('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.general.siteDescription}
                onChange={(e) => updateGeneralSetting('siteDescription', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="20"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                  />
                  <Badge variant={settings.security.twoFactorAuth ? 'default' : 'secondary'}>
                    {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                </div>
                <Switch
                  id="ipWhitelist"
                  checked={settings.security.ipWhitelist}
                  onCheckedChange={(checked) => updateSecuritySetting('ipWhitelist', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <Label htmlFor="auditLogging">Audit Logging</Label>
                </div>
                <Switch
                  id="auditLogging"
                  checked={settings.security.auditLogging}
                  onCheckedChange={(checked) => updateSecuritySetting('auditLogging', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Feature Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <Label htmlFor="tenantPortal">Tenant Portal</Label>
                </div>
                <Switch
                  id="tenantPortal"
                  checked={settings.features.tenantPortal}
                  onCheckedChange={(checked) => updateFeatureSetting('tenantPortal', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <Label htmlFor="ownerPortal">Owner Portal</Label>
                </div>
                <Switch
                  id="ownerPortal"
                  checked={settings.features.ownerPortal}
                  onCheckedChange={(checked) => updateFeatureSetting('ownerPortal', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <Label htmlFor="maintenanceModule">Maintenance Module</Label>
                </div>
                <Switch
                  id="maintenanceModule"
                  checked={settings.features.maintenanceModule}
                  onCheckedChange={(checked) => updateFeatureSetting('maintenanceModule', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <Label htmlFor="paymentModule">Payment Module</Label>
                </div>
                <Switch
                  id="paymentModule"
                  checked={settings.features.paymentModule}
                  onCheckedChange={(checked) => updateFeatureSetting('paymentModule', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <Label htmlFor="visitorManagement">Visitor Management</Label>
                </div>
                <Switch
                  id="visitorManagement"
                  checked={settings.features.visitorManagement}
                  onCheckedChange={(checked) => updateFeatureSetting('visitorManagement', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) => updateNotificationSetting('smsNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateNotificationSetting('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
                </div>
                <Switch
                  id="maintenanceAlerts"
                  checked={settings.notifications.maintenanceAlerts}
                  onCheckedChange={(checked) => updateNotificationSetting('maintenanceAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <Label htmlFor="paymentReminders">Payment Reminders</Label>
                </div>
                <Switch
                  id="paymentReminders"
                  checked={settings.notifications.paymentReminders}
                  onCheckedChange={(checked) => updateNotificationSetting('paymentReminders', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Integrations & Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <Label htmlFor="stripeEnabled">Stripe Payments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="stripeEnabled"
                    checked={settings.integration.stripeEnabled}
                    onCheckedChange={(checked) => updateIntegrationSetting('stripeEnabled', checked)}
                  />
                  <Badge variant={settings.integration.stripeEnabled ? 'default' : 'secondary'}>
                    {settings.integration.stripeEnabled ? 'Connected' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <Label htmlFor="twilioEnabled">Twilio SMS</Label>
                </div>
                <Switch
                  id="twilioEnabled"
                  checked={settings.integration.twilioEnabled}
                  onCheckedChange={(checked) => updateIntegrationSetting('twilioEnabled', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Select value={settings.integration.emailProvider} onValueChange={(value) => updateIntegrationSetting('emailProvider', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={settings.integration.backupFrequency} onValueChange={(value) => updateIntegrationSetting('backupFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}