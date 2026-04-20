
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Shield, Eye, Globe, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  initializePushNotifications,
  requestPushPermission,
  sendTestNotification,
  isPushNotificationSupported,
  getCurrentPermissionStatus,
  getPermissionStatusMessage,
  isPermissionBlocked,
  isMobileDevice,
  getMobileInstructions,
  type NotificationPreferences 
} from '@/services/pushNotificationService';
import { exportUserData } from '@/services/dataExportService';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Download, Trash2, Key } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const { deleteAccount } = useAuthActions();
  const { toast } = useToast();
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isMobile, setIsMobile] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);
  
  // Load initial data sharing preference
  useEffect(() => {
    const sharingPref = localStorage.getItem('ecosmart_data_sharing') === 'true';
    setDataSharing(sharingPref);
    
    // Listen for global consent updates
    const handleConsentUpdate = () => {
      const updatedPref = localStorage.getItem('ecosmart_data_sharing') === 'true';
      setDataSharing(updatedPref);
    };
    
    window.addEventListener('consent_updated', handleConsentUpdate);
    return () => window.removeEventListener('consent_updated', handleConsentUpdate);
  }, []);
  
  // Load notification preferences on component mount and monitor permission status
  useEffect(() => {
    if (user?.id) {
      loadNotificationPreferences();
    }
    // Check if device is mobile
    setIsMobile(isMobileDevice());
    
    // Check permission status on mount and set up interval to check periodically
    updatePermissionStatus();
    const interval = setInterval(updatePermissionStatus, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const updatePermissionStatus = () => {
    const currentStatus = getCurrentPermissionStatus();
    setPermissionStatus(currentStatus);
  };

  const loadNotificationPreferences = async () => {
    if (!user?.id) return;
    
    try {
      console.info('[Settings] Loading notification preferences for user:', user.id);
      console.info('[Settings] Push notification support:', isPushNotificationSupported());
      console.info('[Settings] Current notification permission:', Notification.permission);
      
      const preferences = await getNotificationPreferences(user.id);
      if (preferences) {
        console.info('[Settings] Loaded existing preferences:', preferences);
        setNotificationPreferences(preferences);
      } else {
        // Create default preferences if none exist
        const defaultPreferences: NotificationPreferences = {
          user_id: user.id,
          push_notifications: false,
          sms_alerts: false,
          email_notifications: true,
          weather_alerts: true,
          disaster_alerts: true
        };
        console.info('[Settings] Created default preferences:', defaultPreferences);
        
        // Save default preferences to database
        const saveSuccess = await updateNotificationPreferences(defaultPreferences);
        if (saveSuccess) {
          console.info('[Settings] Default preferences saved to database');
        } else {
          console.error('[Settings] Failed to save default preferences');
        }
        
        setNotificationPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('[Settings] Failed to load notification preferences:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id || !notificationPreferences) return;
    
    setLoading(true);
    try {
      const success = await updateNotificationPreferences(notificationPreferences);
      
      if (success) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (!user?.id || !notificationPreferences) return;

    setLoading(true);
    try {
      if (enabled) {
        console.info('[Settings] Attempting to enable push notifications');
        
        // Check if permission is blocked
        if (isPermissionBlocked()) {
          toast({
            title: "Push Notifications Blocked",
            description: "Please enable push notifications in your browser settings and refresh the page.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Request permission and initialize push notifications
        const permission = await requestPushPermission();
        console.info('[Settings] Permission result:', permission);
        
        if (permission !== 'granted') {
          const message = permission === 'denied' 
            ? "Push notifications were blocked. Please enable them in your browser settings."
            : "Permission was not granted. Please try again.";
          
          toast({
            title: "Permission Required",
            description: message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Initialize push notifications
        const initSuccess = await initializePushNotifications(user.id);
        console.info('[Settings] Push notification initialization result:', initSuccess);
        
        if (!initSuccess) {
          toast({
            title: "Setup Failed",
            description: "Failed to initialize push notifications. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      // Update the state
      const updatedPreferences = {
        ...notificationPreferences,
        push_notifications: enabled
      };
      
      setNotificationPreferences(updatedPreferences);
      
      // Save to database immediately
      const saveSuccess = await updateNotificationPreferences(updatedPreferences);
      
      if (saveSuccess) {
        toast({
          title: enabled ? "Push Notifications Enabled" : "Push Notifications Disabled",
          description: enabled 
            ? "You will now receive push notifications for weather alerts." 
            : "Push notifications have been disabled.",
        });
      } else {
        // Revert the state change if save failed
        setNotificationPreferences(notificationPreferences);
        toast({
          title: "Error",
          description: "Failed to save notification preferences. Please try again.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('[Settings] Error in handlePushNotificationToggle:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Quickly prompt the browser permission dialog and re-initialize if granted
  const handleRequestPermission = async () => {
    const permission = await requestPushPermission();
    setPermissionStatus(permission);
    if (permission === 'granted' && user?.id) {
      await initializePushNotifications(user.id);
      toast({ title: 'Notifications enabled', description: 'Push notifications are now active.' });
    } else if (permission === 'denied') {
      toast({ title: 'Permission blocked', description: 'Enable notifications in your browser settings.', variant: 'destructive' });
    }
  };

  const handleNotificationPreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!notificationPreferences || !user?.id) return;

    const prev = notificationPreferences;
    const updated = { ...notificationPreferences, [key]: value };
    setNotificationPreferences(updated);

    const success = await updateNotificationPreferences(updated);
    if (!success) {
      setNotificationPreferences(prev);
      toast({ title: 'Error', description: 'Failed to update preference. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Preference updated', description: `${String(key).replace(/_/g, ' ')} ${value ? 'enabled' : 'disabled'}.` });
    }
  };

  const handleTestNotification = () => {
    if (isMobile) {
      sendTestNotification(
        "🌍 EcoSmart Mobile Test", 
        "Push notifications are working perfectly on your mobile device!"
      );
    } else {
      sendTestNotification(
        "🌍 EcoSmart Test", 
        "Push notifications are working perfectly!"
      );
    }
    toast({
      title: "Test Notification Sent",
      description: "Check if you received the notification"
    });
  };

  const handleTestWeatherAlert = () => {
    if (isMobile) {
      sendTestNotification(
        "⚠️ Weather Alert Test", 
        "This is a test weather alert to ensure mobile notifications work properly."
      );
    } else {
      sendTestNotification(
        "⚠️ Weather Alert Test", 
        "This is a test weather alert notification."
      );
    }
    toast({
      title: "Weather Alert Test Sent",
      description: "Check if you received the weather alert"
    });
  };

  const handleTestDisasterAlert = () => {
    if (isMobile) {
      sendTestNotification(
        "🚨 Disaster Alert Test", 
        "This is a test disaster alert to ensure critical mobile notifications work properly."
      );
    } else {
      sendTestNotification(
        "🚨 Disaster Alert Test", 
        "This is a test disaster alert notification."
      );
    }
    toast({
      title: "Disaster Alert Test Sent",
      description: "Check if you received the disaster alert"
    });
  };

  const handleDataSharingToggle = (checked: boolean) => {
    setDataSharing(checked);
    localStorage.setItem('ecosmart_data_sharing', String(checked));
    toast({
      title: checked ? "Data Sharing Enabled" : "Data Sharing Disabled",
      description: checked 
        ? "We will process your data for improved climate insights." 
        : "Your data will no longer be shared for analytical purposes."
    });
  };

  const handleExportData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await exportUserData(user.id);
      toast({
        title: "Export Successful",
        description: "Your data has been packaged and downloaded."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export your data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.")) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteAccount();
      toast({
        title: "Account Deleted",
        description: "Your account and data have been removed. Redirecting..."
      });
      // The deleteAccount action in authService handles logout and cleanup
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "An error occurred while deleting your account. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <Header title="Settings" showBackButton />
      
      <div className="p-4">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={profile?.full_name || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <Label htmlFor="language">Language</Label>
                  </div>
                  <select className="border border-border rounded px-3 py-1 text-sm bg-background">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how you receive alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <div className="space-y-1">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                         <p className="text-xs text-muted-foreground">
                           {isMobile ? "Receive weather alerts on your mobile device" : "Receive weather alerts on your device"}
                         </p>
                         <p className={`text-xs ${permissionStatus === 'denied' ? 'text-destructive' : permissionStatus === 'granted' ? 'text-primary' : 'text-muted-foreground'}`}>
                           Status: {getPermissionStatusMessage()}
                         </p>
                        {permissionStatus !== 'granted' && (
                          <Button
                            variant="outline"
                            className="mt-2 h-7 px-3 w-fit"
                            onClick={handleRequestPermission}
                            disabled={loading}
                          >
                            Enable now
                          </Button>
                        )}
                        {isPermissionBlocked() && (
                           <div className="text-xs text-destructive mt-1 space-y-1">
                             <p>⚠️ To enable notifications:</p>
                             {isMobile ? (
                               <div className="pl-2">
                                 {getMobileInstructions().instructions.map((instruction, index) => (
                                   <p key={index} className="text-xs">• {instruction}</p>
                                 ))}
                               </div>
                             ) : (
                               <p className="pl-2 text-xs">• Go to browser settings → Privacy → Notifications → Allow for this site</p>
                             )}
                           </div>
                        )}
                      </div>
                    </div>
                    <Switch 
                      id="push-notifications" 
                      checked={notificationPreferences?.push_notifications || false}
                      onCheckedChange={handlePushNotificationToggle}
                      disabled={loading || (isPermissionBlocked() && notificationPreferences?.push_notifications)}
                    />
                  </div>
                  
                  {/* Enhanced mobile-optimized test notification buttons */}
                  {notificationPreferences?.push_notifications && permissionStatus === 'granted' && (
                    <div className="pt-4 border-t space-y-3">
                      <Button 
                        onClick={handleTestNotification} 
                        variant="outline" 
                        className="w-full"
                        disabled={loading}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        {isMobile ? "Test Basic Mobile Notification" : "Test Basic Notification"}
                      </Button>
                      
                      {notificationPreferences?.weather_alerts && (
                        <Button 
                          onClick={handleTestWeatherAlert} 
                          variant="outline" 
                          className="w-full"
                          disabled={loading}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {isMobile ? "Test Mobile Weather Alert" : "Test Weather Alert"}
                        </Button>
                      )}
                      
                      {notificationPreferences?.disaster_alerts && (
                        <Button 
                          onClick={handleTestDisasterAlert} 
                          variant="destructive" 
                          className="w-full"
                          disabled={loading}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {isMobile ? "Test Mobile Disaster Alert" : "Test Disaster Alert"}
                        </Button>
                      )}
                      
                       <p className="text-xs text-muted-foreground mt-2 text-center">
                         {isMobile 
                           ? "Test all notification types to ensure they work perfectly on your mobile device" 
                           : "Test all notification types to verify they're working correctly"
                         }
                       </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <div className="space-y-1">
                      <Label htmlFor="weather-alerts">Weather Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified about weather advisories</p>
                    </div>
                  </div>
                  <Switch 
                    id="weather-alerts" 
                    checked={notificationPreferences?.weather_alerts || false}
                    onCheckedChange={(checked) => handleNotificationPreferenceChange('weather_alerts', checked)}
                    disabled={!notificationPreferences?.push_notifications || loading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <div className="space-y-1">
                      <Label htmlFor="disaster-alerts">Disaster Alerts</Label>
                      <p className="text-xs text-muted-foreground">Critical emergency notifications</p>
                    </div>
                  </div>
                  <Switch 
                    id="disaster-alerts" 
                    checked={notificationPreferences?.disaster_alerts || false}
                    onCheckedChange={(checked) => handleNotificationPreferenceChange('disaster_alerts', checked)}
                    disabled={!notificationPreferences?.push_notifications || loading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <Label htmlFor="sms-alerts">SMS Alerts</Label>
                  </div>
                  <Switch 
                    id="sms-alerts" 
                    checked={notificationPreferences?.sms_alerts || false}
                    onCheckedChange={(checked) => handleNotificationPreferenceChange('sms_alerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={notificationPreferences?.email_notifications || false}
                    onCheckedChange={(checked) => handleNotificationPreferenceChange('email_notifications', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <Label htmlFor="data-sharing">Data Sharing</Label>
                  </div>
                  <Switch 
                    id="data-sharing" 
                    checked={dataSharing}
                    onCheckedChange={handleDataSharingToggle}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <Label htmlFor="profile-visibility">Public Profile</Label>
                  </div>
                  <Switch id="profile-visibility" defaultChecked />
                </div>
                <div className="pt-4 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => toast({ title: "Coming Soon", description: "Password reset flow is being automated." })}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center border-primary/20 hover:bg-primary/5"
                    onClick={handleExportData}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Exporting...' : 'Export My Data (JSON)'}
                  </Button>
                  
                  <div className="pt-4 border-t border-destructive/10">
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center justify-center"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete My Account
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      Deleting your account will remove all your campaigns, reports, and listings.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={loading}>
                  {loading ? 'Processing...' : 'Save Privacy Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <CustomBottomNavigation />
    </div>
  );
};

export default Settings;
