import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
    Bell,
    Database,
    Lock,
    Mail,
    Palette,
    Save,
    Settings,
    Shield,
    User
} from 'lucide-react';

import { useState } from 'react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    lowStock: true,
    expiry: true,
    mlAlerts: false,
  });

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and system preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your account details</p>
              
              <Separator className="my-6" />
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    defaultValue={user?.name || ''} 
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    defaultValue={user?.name || ''} 
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue={user?.email || ''} 
                      placeholder="Enter email"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">Configure how you receive alerts</p>
              
              <Separator className="my-6" />
              
              <div className="space-y-6">
                <NotificationToggle
                  title="Email Notifications"
                  description="Receive alerts via email"
                  icon={Mail}
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
                <NotificationToggle
                  title="Low Stock Alerts"
                  description="Get notified when stock is running low"
                  icon={Bell}
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                />
                <NotificationToggle
                  title="Expiry Alerts"
                  description="Notifications for items nearing expiry"
                  icon={Bell}
                  checked={notifications.expiry}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, expiry: checked })}
                />
                <NotificationToggle
                  title="ML Prediction Alerts"
                  description="AI-generated insights and predictions"
                  icon={Bell}
                  checked={notifications.mlAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, mlAlerts: checked })}
                />
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="currentPassword" 
                        type="password"
                        placeholder="Enter current password"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="newPassword" 
                        type="password"
                        placeholder="Enter new password"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        placeholder="Confirm new password"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-destructive/30 bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Irreversible actions</p>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="mt-6">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage system-wide settings</p>
                
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Database Status</p>
                        <p className="text-sm text-muted-foreground">Connection status</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">Not connected</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Theme</p>
                        <p className="text-sm text-muted-foreground">Current: Dark mode</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Settings className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Low Stock Threshold</p>
                        <p className="text-sm text-muted-foreground">Default threshold value</p>
                      </div>
                    </div>
                    <Input type="number" className="w-20" defaultValue={10} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground">API Configuration</h3>
                <p className="text-sm text-muted-foreground">Backend connection settings</p>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiUrl">API Base URL</Label>
                    <Input 
                      id="apiUrl" 
                      placeholder="https://api.example.com"
                      defaultValue={import.meta.env.VITE_API_URL || ''}
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

interface NotificationToggleProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const NotificationToggle = ({ title, description, icon: Icon, checked, onCheckedChange }: NotificationToggleProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default SettingsPage;
