import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, BellOff, Thermometer, Droplets, Wind, CloudRain,
  Settings, Save, RefreshCw, CheckCircle, AlertTriangle,
  Loader2, Info, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  requestPushPermission, 
  getCurrentPermissionStatus,
  isPushNotificationSupported,
  sendTestNotification
} from '@/services/pushNotificationService';

interface NotificationThresholds {
  push_notifications: boolean;
  weather_alerts: boolean;
  disaster_alerts: boolean;
  temp_high_threshold: number;
  temp_low_threshold: number;
  rain_threshold: number;
  wind_threshold: number;
  humidity_threshold: number;
}

const defaultThresholds: NotificationThresholds = {
  push_notifications: true,
  weather_alerts: true,
  disaster_alerts: true,
  temp_high_threshold: 35,
  temp_low_threshold: 15,
  rain_threshold: 70,
  wind_threshold: 40,
  humidity_threshold: 90
};

const WeatherNotificationSettings: React.FC = memo(() => {
  const [thresholds, setThresholds] = useState<NotificationThresholds>(defaultThresholds);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // Check notification permission status
  useEffect(() => {
    if (isPushNotificationSupported()) {
      setPermissionStatus(getCurrentPermissionStatus());
    }
  }, []);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading preferences:', error);
        }

        if (data) {
          setThresholds({
            push_notifications: data.push_notifications ?? true,
            weather_alerts: data.weather_alerts ?? true,
            disaster_alerts: data.disaster_alerts ?? true,
            temp_high_threshold: data.temp_high_threshold ?? 35,
            temp_low_threshold: data.temp_low_threshold ?? 15,
            rain_threshold: data.rain_threshold ?? 70,
            wind_threshold: data.wind_threshold ?? 40,
            humidity_threshold: data.humidity_threshold ?? 90
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleThresholdChange = useCallback((key: keyof NotificationThresholds, value: number | boolean) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const permission = await requestPushPermission();
    setPermissionStatus(permission);
    
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      handleThresholdChange('push_notifications', true);
    } else if (permission === 'denied') {
      toast.error('Notification permission denied. Please enable in browser settings.');
    }
  }, [handleThresholdChange]);

  const handleSave = useCallback(async () => {
    if (!userId) {
      toast.error('Please log in to save preferences');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          push_notifications: thresholds.push_notifications,
          weather_alerts: thresholds.weather_alerts,
          disaster_alerts: thresholds.disaster_alerts,
          temp_high_threshold: thresholds.temp_high_threshold,
          temp_low_threshold: thresholds.temp_low_threshold,
          rain_threshold: thresholds.rain_threshold,
          wind_threshold: thresholds.wind_threshold,
          humidity_threshold: thresholds.humidity_threshold,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Notification preferences saved!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  }, [userId, thresholds]);

  const handleTestNotification = useCallback(() => {
    if (permissionStatus !== 'granted') {
      toast.error('Please enable notifications first');
      return;
    }
    
    sendTestNotification(
      '🌤️ Test Weather Alert',
      'This is a test notification. Your alerts are working correctly!'
    );
    toast.success('Test notification sent!');
  }, [permissionStatus]);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Sign in Required</p>
              <p className="text-sm text-muted-foreground">
                Please sign in to customize your notification preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header Card */}
      <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Alert Preferences</h3>
                <p className="text-xs text-muted-foreground">Customize your weather notifications</p>
              </div>
            </div>
            
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  size="sm"
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Status */}
      <Card className={cn(
        "border-border/50 overflow-hidden",
        permissionStatus === 'granted' 
          ? "border-success/30" 
          : permissionStatus === 'denied' 
          ? "border-destructive/30" 
          : ""
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {permissionStatus === 'granted' ? (
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-success" />
                </div>
              ) : permissionStatus === 'denied' ? (
                <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <BellOff className="h-5 w-5 text-destructive" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="font-medium flex items-center gap-2">
                  Push Notifications
                  {permissionStatus === 'granted' && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
                      Enabled
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {permissionStatus === 'granted' 
                    ? "You'll receive alerts on your device"
                    : permissionStatus === 'denied'
                    ? "Blocked - Enable in browser settings"
                    : "Enable to receive weather alerts"
                  }
                </p>
              </div>
            </div>
            
            {permissionStatus !== 'granted' ? (
              <Button 
                onClick={handleRequestPermission}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                Enable
              </Button>
            ) : (
              <Button 
                onClick={handleTestNotification}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Alert Types
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Weather Alerts</Label>
                <p className="text-xs text-muted-foreground">Temperature, rain, and wind warnings</p>
              </div>
              <Switch
                checked={thresholds.weather_alerts}
                onCheckedChange={(checked) => handleThresholdChange('weather_alerts', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Disaster Alerts</Label>
                <p className="text-xs text-muted-foreground">Floods, landslides, and severe storms</p>
              </div>
              <Switch
                checked={thresholds.disaster_alerts}
                onCheckedChange={(checked) => handleThresholdChange('disaster_alerts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threshold Settings */}
      <AnimatePresence>
        {thresholds.weather_alerts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-primary" />
                    Alert Thresholds
                  </h4>
                  <Badge variant="secondary" className="text-[10px]">
                    <Info className="h-3 w-3 mr-1" />
                    Customizable
                  </Badge>
                </div>

                {/* High Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Thermometer className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <Label className="text-sm">High Temperature</Label>
                        <p className="text-[10px] text-muted-foreground">Alert when temp exceeds</p>
                      </div>
                    </div>
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                      {thresholds.temp_high_threshold}°C
                    </Badge>
                  </div>
                  <Slider
                    value={[thresholds.temp_high_threshold]}
                    onValueChange={([v]) => handleThresholdChange('temp_high_threshold', v)}
                    min={25}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>25°C</span>
                    <span>50°C</span>
                  </div>
                </div>

                <Separator />

                {/* Low Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Thermometer className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <Label className="text-sm">Low Temperature</Label>
                        <p className="text-[10px] text-muted-foreground">Alert when temp drops below</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {thresholds.temp_low_threshold}°C
                    </Badge>
                  </div>
                  <Slider
                    value={[thresholds.temp_low_threshold]}
                    onValueChange={([v]) => handleThresholdChange('temp_low_threshold', v)}
                    min={0}
                    max={25}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0°C</span>
                    <span>25°C</span>
                  </div>
                </div>

                <Separator />

                {/* Rain Probability */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <CloudRain className="h-4 w-4 text-cyan-500" />
                      </div>
                      <div>
                        <Label className="text-sm">Rain Probability</Label>
                        <p className="text-[10px] text-muted-foreground">Alert when rain chance exceeds</p>
                      </div>
                    </div>
                    <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                      {thresholds.rain_threshold}%
                    </Badge>
                  </div>
                  <Slider
                    value={[thresholds.rain_threshold]}
                    onValueChange={([v]) => handleThresholdChange('rain_threshold', v)}
                    min={20}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>20%</span>
                    <span>100%</span>
                  </div>
                </div>

                <Separator />

                {/* Wind Speed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Wind className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <Label className="text-sm">Wind Speed</Label>
                        <p className="text-[10px] text-muted-foreground">Alert when wind exceeds</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                      {thresholds.wind_threshold} km/h
                    </Badge>
                  </div>
                  <Slider
                    value={[thresholds.wind_threshold]}
                    onValueChange={([v]) => handleThresholdChange('wind_threshold', v)}
                    min={15}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>15 km/h</span>
                    <span>80 km/h</span>
                  </div>
                </div>

                <Separator />

                {/* Humidity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Droplets className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <Label className="text-sm">Humidity Level</Label>
                        <p className="text-[10px] text-muted-foreground">Alert when humidity exceeds</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {thresholds.humidity_threshold}%
                    </Badge>
                  </div>
                  <Slider
                    value={[thresholds.humidity_threshold]}
                    onValueChange={([v]) => handleThresholdChange('humidity_threshold', v)}
                    min={50}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button - Floating */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-auto"
          >
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto gap-2 shadow-lg"
              size="lg"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

WeatherNotificationSettings.displayName = 'WeatherNotificationSettings';

export default WeatherNotificationSettings;
