import React, { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Route, History, MapPin, Users, Clock, 
  Phone, Building2, Flame, CloudRain, Mountain, Wind,
  ChevronRight, Navigation, AlertTriangle, Bell,
  BellRing, Check, X, Compass, Timer, TrendingUp,
  Eye, EyeOff, ArrowUpRight, Zap, Target, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useUserLocation } from '@/contexts/LocationContext';
import { useProximityNotifications } from '@/hooks/useProximityNotifications';
import { calculateHaversineDistance, formatDistance, estimateWalkingTime, calculateRouteDistance } from '@/utils/geoUtils';
import { 
  safeZones, 
  evacuationRoutes, 
  historicalDisasters,
  SafeZone,
  EvacuationRoute,
  HistoricalDisaster
} from '@/components/maps/data/evacuationRoutes';
import { cn } from '@/lib/utils';

// Enhanced types with calculated distance
interface SafeZoneWithDistance extends SafeZone {
  userDistance: number;
  walkingTime: string;
}

interface RouteWithDistance extends EvacuationRoute {
  actualDistance: number;
  userDistanceToStart: number;
  walkingTime: string;
}

// Icon mappings
const getZoneIcon = (type: SafeZone['type']) => {
  const icons: Record<SafeZone['type'], string> = {
    hospital: '🏥',
    shelter: '🏟️',
    school: '🏫',
    government: '🏛️',
    community: '🏘️',
    religious: '⛪'
  };
  return icons[type] || '📍';
};

const getDisasterIcon = (type: HistoricalDisaster['type']) => {
  switch (type) {
    case 'flood': return <CloudRain className="h-4 w-4" />;
    case 'landslide': return <Mountain className="h-4 w-4" />;
    case 'fire': return <Flame className="h-4 w-4" />;
    case 'storm': return <Wind className="h-4 w-4" />;
    default: return <MapPin className="h-4 w-4" />;
  }
};

const getSeverityStyles = (severity: HistoricalDisaster['severity']) => {
  const styles = {
    catastrophic: 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-500/50 text-red-600',
    high: 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/40 text-orange-600',
    medium: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/40 text-yellow-600',
    low: 'bg-gradient-to-r from-green-500/20 to-green-600/10 border-green-500/40 text-green-600'
  };
  return styles[severity] || 'bg-muted text-muted-foreground';
};

const getSafetyStyles = (level: EvacuationRoute['safetyLevel']) => {
  const styles = {
    high: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/40',
    low: 'bg-rose-500/10 text-rose-600 border-rose-500/40'
  };
  return styles[level] || 'bg-muted text-muted-foreground';
};

const getZoneTypeStyles = (type: SafeZone['type']) => {
  const styles: Record<SafeZone['type'], string> = {
    hospital: 'bg-red-500/10 text-red-600 border-red-500/30',
    shelter: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
    school: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
    government: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    community: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    religious: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'
  };
  return styles[type] || 'bg-muted text-muted-foreground';
};

// Safe Zone Card Component
const SafeZoneCard = memo(({ zone, index, userLat, userLng }: { 
  zone: SafeZoneWithDistance; 
  index: number;
  userLat?: number;
  userLng?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
    className="group"
  >
    <Card className="border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-4">
          <motion.div 
            className="text-3xl p-3 rounded-2xl bg-gradient-to-br from-background to-muted shadow-inner"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {getZoneIcon(zone.type)}
          </motion.div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-base truncate">{zone.name}</h4>
              <Badge variant="outline" className={cn('text-[10px] shrink-0 font-medium', getZoneTypeStyles(zone.type))}>
                {zone.type}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {zone.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
                <Users className="h-3 w-3 text-primary" />
                <span className="font-medium">{zone.capacity.toLocaleString()}</span>
              </div>
              
              {userLat && userLng && (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10">
                    <Navigation className="h-3 w-3 text-emerald-600" />
                    <span className="font-medium text-emerald-600">{formatDistance(zone.userDistance)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-sky-500/10">
                    <Timer className="h-3 w-3 text-sky-600" />
                    <span className="font-medium text-sky-600">{zone.walkingTime}</span>
                  </div>
                </>
              )}
              
              {zone.contactNumber && (
                <a href={`tel:${zone.contactNumber}`} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
                  <Phone className="h-3 w-3 text-violet-600" />
                  <span className="font-medium text-violet-600">{zone.contactNumber}</span>
                </a>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              {zone.facilities.slice(0, 4).map((facility, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 bg-muted/50">
                  {facility}
                </Badge>
              ))}
              {zone.facilities.length > 4 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-muted/50">
                  +{zone.facilities.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

// Evacuation Route Card Component
const EvacuationRouteCard = memo(({ route, index }: { 
  route: RouteWithDistance; 
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
    className="group"
  >
    <Card className="border-0 bg-gradient-to-br from-background to-muted/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center pt-1">
            <motion.div 
              className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <div className="w-0.5 h-12 bg-gradient-to-b from-emerald-500 via-sky-500 to-violet-500 rounded-full my-1" />
            <motion.div 
              className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg shadow-violet-500/30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            />
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-base truncate">{route.name}</h4>
              <Badge variant="outline" className={cn('text-[10px] shrink-0 font-medium uppercase', getSafetyStyles(route.safetyLevel))}>
                {route.safetyLevel} safety
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{route.from}</span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-violet-600 bg-violet-500/10 px-2 py-0.5 rounded-full">{route.to}</span>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {route.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-sky-500/10">
                <Route className="h-3 w-3 text-sky-600" />
                <span className="font-medium text-sky-600">{formatDistance(route.actualDistance)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10">
                <Timer className="h-3 w-3 text-amber-600" />
                <span className="font-medium text-amber-600">{route.walkingTime}</span>
              </div>
              {route.userDistanceToStart > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
                  <Target className="h-3 w-3 text-primary" />
                  <span className="font-medium text-primary">{formatDistance(route.userDistanceToStart)} to start</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

// Historical Disaster Card Component
const HistoricalDisasterCard = memo(({ disaster, index }: { 
  disaster: HistoricalDisaster; 
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
    className="group"
  >
    <Card className={cn(
      'border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden',
      getSeverityStyles(disaster.severity)
    )}>
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-4">
          <motion.div 
            className="p-3 rounded-2xl bg-background/80 backdrop-blur shadow-inner"
            whileHover={{ scale: 1.1 }}
          >
            {getDisasterIcon(disaster.type)}
          </motion.div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-base">{disaster.location}</h4>
              <Badge variant="outline" className="text-[10px] shrink-0 font-bold uppercase bg-background/50">
                {disaster.severity}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Badge className="text-xs capitalize bg-background/50 text-foreground">
                {disaster.type}
              </Badge>
              <span className="text-muted-foreground font-medium">
                {disaster.month ? `${disaster.month}/` : ''}{disaster.year}
              </span>
            </div>
            
            <p className="text-xs line-clamp-2">
              {disaster.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              {disaster.casualties !== undefined && disaster.casualties > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <span className="font-bold text-red-600">{disaster.casualties.toLocaleString()} casualties</span>
                </div>
              )}
              {disaster.displaced !== undefined && disaster.displaced > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/20">
                  <Users className="h-3 w-3 text-orange-600" />
                  <span className="font-bold text-orange-600">{disaster.displaced.toLocaleString()} displaced</span>
                </div>
              )}
              {disaster.affectedArea && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/50">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium">{disaster.affectedArea} km²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

type DisasterFilter = 'all' | 'flood' | 'landslide' | 'fire' | 'storm';

const DisasterInfoHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('safezones');
  const [disasterFilter, setDisasterFilter] = useState<DisasterFilter>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const { latitude, longitude } = useUserLocation();
  const { 
    recentNotifications, 
    notificationPermission, 
    requestNotificationPermission 
  } = useProximityNotifications({ enabled: notificationsEnabled });

  // Calculate distances for safe zones
  const safeZonesWithDistance = useMemo(() => {
    return safeZones.map(zone => {
      const userDistance = latitude && longitude 
        ? calculateHaversineDistance(latitude, longitude, zone.coordinates.lat, zone.coordinates.lng)
        : 0;
      return {
        ...zone,
        userDistance,
        walkingTime: estimateWalkingTime(userDistance)
      };
    }).sort((a, b) => a.userDistance - b.userDistance);
  }, [latitude, longitude]);

  // Calculate distances for routes
  const routesWithDistance = useMemo(() => {
    return evacuationRoutes.map(route => {
      const actualDistance = calculateRouteDistance(route.path);
      const userDistanceToStart = latitude && longitude && route.path[0]
        ? calculateHaversineDistance(latitude, longitude, route.path[0].lat, route.path[0].lng)
        : 0;
      return {
        ...route,
        actualDistance,
        userDistanceToStart,
        walkingTime: estimateWalkingTime(actualDistance)
      };
    }).sort((a, b) => a.userDistanceToStart - b.userDistanceToStart);
  }, [latitude, longitude]);

  // Filter historical disasters
  const filteredDisasters = useMemo(() => {
    return disasterFilter === 'all' 
      ? historicalDisasters 
      : historicalDisasters.filter(d => d.type === disasterFilter);
  }, [disasterFilter]);

  const disasterTypes: { value: DisasterFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { value: 'all', label: 'All Events', icon: <Activity className="h-3.5 w-3.5" />, count: historicalDisasters.length },
    { value: 'flood', label: 'Floods', icon: <CloudRain className="h-3.5 w-3.5" />, count: historicalDisasters.filter(d => d.type === 'flood').length },
    { value: 'landslide', label: 'Landslides', icon: <Mountain className="h-3.5 w-3.5" />, count: historicalDisasters.filter(d => d.type === 'landslide').length },
    { value: 'fire', label: 'Fires', icon: <Flame className="h-3.5 w-3.5" />, count: historicalDisasters.filter(d => d.type === 'fire').length },
    { value: 'storm', label: 'Storms', icon: <Wind className="h-3.5 w-3.5" />, count: historicalDisasters.filter(d => d.type === 'storm').length }
  ];

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Hero Header */}
      <CardHeader className="pb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-violet-500/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <Shield className="h-7 w-7 text-primary-foreground" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Disaster Safety Hub
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Real-time safety zones, routes & alerts
                </p>
              </div>
            </div>
            
            {/* Notification Toggle */}
            <div className="flex items-center gap-3">
              {notificationPermission !== 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={handleEnableNotifications}
                >
                  <BellRing className="h-3.5 w-3.5" />
                  Enable Alerts
                </Button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <Bell className={cn('h-4 w-4', notificationsEnabled ? 'text-primary' : 'text-muted-foreground')} />
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: safeZones.length, label: 'Safe Zones', icon: Building2, color: 'emerald', gradient: 'from-emerald-500/20 to-emerald-600/5' },
              { value: evacuationRoutes.length, label: 'Routes', icon: Route, color: 'sky', gradient: 'from-sky-500/20 to-sky-600/5' },
              { value: historicalDisasters.length, label: 'Past Events', icon: History, color: 'amber', gradient: 'from-amber-500/20 to-amber-600/5' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'relative rounded-2xl p-4 bg-gradient-to-br border border-border/50',
                  stat.gradient
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn('text-3xl font-bold', `text-${stat.color}-600`)}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                  <stat.icon className={cn('h-8 w-8 opacity-50', `text-${stat.color}-600`)} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted/50 p-1 rounded-xl">
            {[
              { value: 'safezones', label: 'Safe Zones', icon: Shield },
              { value: 'routes', label: 'Routes', icon: Route },
              { value: 'history', label: 'History', icon: History }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="gap-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="safezones" className="mt-0">
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-3">
                <AnimatePresence>
                  {safeZonesWithDistance.map((zone, index) => (
                    <SafeZoneCard 
                      key={zone.id} 
                      zone={zone} 
                      index={index}
                      userLat={latitude}
                      userLng={longitude}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="routes" className="mt-0">
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-3">
                <AnimatePresence>
                  {routesWithDistance.map((route, index) => (
                    <EvacuationRouteCard key={route.id} route={route} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {/* Disaster Type Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {disasterTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={disasterFilter === type.value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 text-xs gap-1.5 transition-all",
                    disasterFilter === type.value && "shadow-md"
                  )}
                  onClick={() => setDisasterFilter(type.value)}
                >
                  {type.icon}
                  {type.label}
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-1 h-5 px-1.5 text-[10px]",
                      disasterFilter === type.value && "bg-primary-foreground/20 text-primary-foreground"
                    )}
                  >
                    {type.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[360px] pr-3">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredDisasters.map((disaster, index) => (
                    <HistoricalDisasterCard key={disaster.id} disaster={disaster} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default memo(DisasterInfoHub);
