import React from 'react';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  AlertTriangle, 
  FileText, 
  Bell, 
  Settings, 
  MapPin, 
  Camera, 
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Smartphone,
  Eye,
  HelpCircle
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

const HelpCenter: React.FC = () => {
  useSEO({
    title: "Help Center - EcoSmart",
    description: "Get help with using the EcoSmart app - learn how to navigate, report environmental issues, manage alerts, and more."
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header title="Help Center" showBackButton />
      
      <div className="p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Welcome to EcoSmart Help Center
            </CardTitle>
            <CardDescription>
              Find answers to common questions and learn how to make the most of your EcoSmart app.
            </CardDescription>
          </CardHeader>
        </Card>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <Accordion type="single" collapsible className="space-y-4">
            
            {/* Getting Started */}
            <AccordionItem value="getting-started" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Getting Started</h3>
                    <p className="text-sm text-muted-foreground">Learn the basics of the app</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Home Dashboard</h4>
                    <p className="text-sm text-muted-foreground mb-2">The home screen provides an overview of:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Current weather conditions and alerts</li>
                      <li>• Recent environmental reports from your area</li>
                      <li>• Daily climate facts and tips</li>
                      <li>• Emergency contacts and disaster-prone areas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Navigation</h4>
                    <p className="text-sm text-muted-foreground">Use the bottom navigation bar to switch between main sections: Home, Alerts, Reports, and Profile.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Disaster Alerts */}
            <AccordionItem value="alerts" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Disaster Alerts & Weather</h3>
                    <p className="text-sm text-muted-foreground">Stay informed about weather and disasters</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Understanding Alert Tabs</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">General</Badge>
                        <span className="text-sm text-muted-foreground">Overall disaster alerts and safety information</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Weather</Badge>
                        <span className="text-sm text-muted-foreground">Weather conditions, forecasts, and warnings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Safety</Badge>
                        <span className="text-sm text-muted-foreground">Safety recommendations and emergency procedures</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Location-Based Alerts</h4>
                    <p className="text-sm text-muted-foreground">Enable location access to receive alerts specific to your area. The app uses your GPS location to provide hyper-local weather and disaster information.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Weather Advisory</h4>
                    <p className="text-sm text-muted-foreground">Get personalized advice based on current conditions including rain chances, humidity levels, wind speed, and heat wave warnings.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Reports */}
            <AccordionItem value="reports" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Environmental Reports</h3>
                    <p className="text-sm text-muted-foreground">Report and view environmental issues</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Creating a Report</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>1. Tap the "Report" tab or "+" button</li>
                      <li>2. Select the type of environmental issue</li>
                      <li>3. Add a description and location</li>
                      <li>4. Take photos to document the issue</li>
                      <li>5. Submit your report</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Photo Guidelines</h4>
                    <p className="text-sm text-muted-foreground">Take clear photos that show the environmental issue. Multiple angles can help others understand the problem better.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Report Status</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Pending</Badge>
                        <span className="text-sm text-muted-foreground">Report submitted, awaiting review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Verified</Badge>
                        <span className="text-sm text-muted-foreground">Report confirmed by authorities</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notifications */}
            <AccordionItem value="notifications" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Notifications & Alerts</h3>
                    <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Enable push notifications to receive real-time weather alerts and disaster warnings. You can test notifications in Settings to ensure they're working properly.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Notification Types</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Weather alerts and warnings</li>
                      <li>• Disaster and emergency notifications</li>
                      <li>• New reports in your area</li>
                      <li>• System updates and important announcements</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Managing Notifications</h4>
                    <p className="text-sm text-muted-foreground">Go to Profile → Settings → Notifications to customize which types of alerts you receive and test your notification settings.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Profile & Settings */}
            <AccordionItem value="profile" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Profile & Settings</h3>
                    <p className="text-sm text-muted-foreground">Customize your account and app preferences</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Profile Information</h4>
                    <p className="text-sm text-muted-foreground">Update your profile picture, name, and view your contribution statistics including reports submitted and alerts received.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Settings Categories</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• <strong>Account:</strong> Personal information and language settings</li>
                      <li>• <strong>Notifications:</strong> Control alert preferences and test notifications</li>
                      <li>• <strong>Privacy:</strong> Data sharing and profile visibility options</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Activity History</h4>
                    <p className="text-sm text-muted-foreground">View your past reports, received alerts, and contribution history from your profile page.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Location & Privacy */}
            <AccordionItem value="location" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Location & Privacy</h3>
                    <p className="text-sm text-muted-foreground">Understand how your location is used</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Location Services</h4>
                    <p className="text-sm text-muted-foreground">Your location is used to provide relevant weather alerts, disaster warnings, and local environmental reports. Location data is processed securely and not shared with third parties.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Privacy Controls</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Enable/disable location access at any time</li>
                      <li>• Control profile visibility to other users</li>
                      <li>• Manage data sharing preferences</li>
                      <li>• Delete your account and data if needed</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Permissions</h4>
                    <p className="text-sm text-muted-foreground">The app requests location and notification permissions. Both can be managed through your device settings or the app's Settings page.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tips & Best Practices */}
            <AccordionItem value="tips" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Tips & Best Practices</h3>
                    <p className="text-sm text-muted-foreground">Make the most of your EcoSmart experience</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Effective Reporting</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Be specific in your descriptions</li>
                      <li>• Include exact locations when possible</li>
                      <li>• Take multiple photos from different angles</li>
                      <li>• Report issues as soon as you notice them</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Staying Safe</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Pay attention to weather alerts and warnings</li>
                      <li>• Keep emergency contacts updated</li>
                      <li>• Review safety recommendations regularly</li>
                      <li>• Don't put yourself at risk when reporting issues</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Community Engagement</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Comment on reports to share additional information</li>
                      <li>• Verify reports you encounter in person</li>
                      <li>• Share useful environmental tips with others</li>
                      <li>• Stay updated on community campaigns</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Troubleshooting */}
            <AccordionItem value="troubleshooting" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Troubleshooting</h3>
                    <p className="text-sm text-muted-foreground">Solve common issues</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Notifications Not Working</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Check browser notification permissions</li>
                      <li>• Ensure location access is enabled</li>
                      <li>• Test notifications in Settings</li>
                      <li>• Try refreshing the page</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Location Issues</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Enable GPS/location services on your device</li>
                      <li>• Allow location access in browser settings</li>
                      <li>• Check if you're in an area with GPS coverage</li>
                      <li>• Try refreshing your location manually</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Photo Upload Problems</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Check your internet connection</li>
                      <li>• Ensure photos are not too large (max 10MB)</li>
                      <li>• Try using a different image format</li>
                      <li>• Clear your browser cache if needed</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">App Performance</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Close other browser tabs to free up memory</li>
                      <li>• Clear browser cache and cookies</li>
                      <li>• Try using a different browser</li>
                      <li>• Restart your device if problems persist</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </ScrollArea>
      </div>
      
      <CustomBottomNavigation />
    </div>
  );
};

export default HelpCenter;