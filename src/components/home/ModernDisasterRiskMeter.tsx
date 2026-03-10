/**
 * Modern Disaster Risk Meter Component
 * Redesigned with better performance and aesthetics
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Activity, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, MapPin, Cloud, Gauge } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useImprovedAIAnalysis } from '@/hooks/useImprovedAIAnalysis';
import { useLocationAccuracy } from '@/hooks/useLocationAccuracy';
import { checkProximityToDisasterProneAreas } from '@/services/disaster/geoProximityService';
import { cn } from '@/lib/utils';

const ModernDisasterRiskMeter: React.FC = memo(() => {
  const [riskScore, setRiskScore] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [locationBasedRisk, setLocationBasedRisk] = useState<any>(null);
  const { toast } = useToast();
  
  const { locationDetails, locationAccuracy, locationLoading } = useLocationAccuracy();
  const { latitude, longitude, hasLocation } = locationDetails || {};
  const { weatherData, isLoading: weatherLoading, refreshWeatherData } = useWeatherData();
  
  const { 
    alerts, 
    riskScore: aiRiskScore, 
    recommendations, 
    isAnalyzing, 
    refreshAnalysis 
  } = useImprovedAIAnalysis({ 
    latitude, 
    longitude, 
    accuracy: locationAccuracy,
    enabled: hasLocation 
  });

  useEffect(() => {
    if (!hasLocation || locationLoading || !latitude || !longitude) return;
    
    try {
      let calculatedRiskScore = 0;
      
      const geoProximityStatus = checkProximityToDisasterProneAreas(latitude, longitude, locationAccuracy || 100);
      setLocationBasedRisk(geoProximityStatus);
      
      let locationRisk = 0;
      if (geoProximityStatus.insideProneArea) {
        locationRisk = geoProximityStatus.currentRiskLevel === 'critical' ? 90 :
                     geoProximityStatus.currentRiskLevel === 'high' ? 70 :
                     geoProximityStatus.currentRiskLevel === 'medium' ? 50 : 30;
      } else if (geoProximityStatus.proximityAlerts.length > 0) {
        const nearestAlert = geoProximityStatus.proximityAlerts[0];
        locationRisk = nearestAlert.urgency === 'high' ? 40 : nearestAlert.urgency === 'medium' ? 25 : 15;
      }
      
      let weatherRisk = 0;
      const currentWeather = weatherData?.current;
      if (currentWeather) {
        if (currentWeather.temperature > 35 || currentWeather.temperature < 15) weatherRisk += 20;
        if (currentWeather.humidity > 85) weatherRisk += 15;
        if (currentWeather.precipitation > 20) weatherRisk += 25;
        if (currentWeather.windSpeed > 25) weatherRisk += 20;
      }
      
      const aiRisk = aiRiskScore || 0;
      calculatedRiskScore = Math.round((locationRisk * 0.40) + (Math.min(weatherRisk, 100) * 0.30) + (aiRisk * 0.30));
      
      setRiskScore(Math.min(Math.max(calculatedRiskScore, 0), 100));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error calculating risk score:", error);
      setRiskScore(25);
    }
  }, [hasLocation, latitude, longitude, weatherData?.current?.temperature, aiRiskScore, locationLoading, locationAccuracy]);
  
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    try {
      await Promise.all([refreshAnalysis?.(), refreshWeatherData?.()].filter(Boolean));
      toast({ title: "Updated", description: "Risk assessment refreshed" });
    } catch {
      toast({ title: "Error", description: "Could not refresh", variant: "destructive" });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, toast, refreshAnalysis, refreshWeatherData]);

  const getRiskConfig = () => {
    if (riskScore < 25) return { 
      level: 'Low', 
      color: 'success',
      bgGradient: 'from-success/20 to-success/5',
      icon: CheckCircle
    };
    if (riskScore < 50) return { 
      level: 'Moderate', 
      color: 'primary',
      bgGradient: 'from-primary/20 to-primary/5',
      icon: AlertCircle
    };
    if (riskScore < 70) return { 
      level: 'High', 
      color: 'warning',
      bgGradient: 'from-warning/20 to-warning/5',
      icon: AlertTriangle
    };
    return { 
      level: 'Critical', 
      color: 'destructive',
      bgGradient: 'from-destructive/20 to-destructive/5',
      icon: AlertTriangle
    };
  };

  const config = getRiskConfig();
  const Icon = config.icon;
  const isLoading = weatherLoading || locationLoading || isAnalyzing;

  if (!hasLocation && !locationLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground mb-1">Location Required</p>
          <p className="text-sm text-muted-foreground">Enable location for risk assessment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-0 shadow-xl bg-gradient-to-br", config.bgGradient, "to-card")}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Gauge className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Risk Assessment</h3>
            <p className="text-xs text-muted-foreground">AI-powered analysis</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Score Display */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-background/80 backdrop-blur border border-border/50">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center",
                  `bg-${config.color}/10`
                )}>
                  <Icon className={cn("h-8 w-8", `text-${config.color}`)} />
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground">{riskScore}</div>
                  <div className={cn("text-sm font-semibold", `text-${config.color}`)}>
                    {config.level} Risk
                  </div>
                </div>
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke={`hsl(var(--${config.color}))`}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(riskScore / 100) * 201} 201`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  /100
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-background/60 border border-border/50 text-center">
                <Cloud className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold text-foreground">
                  {weatherData?.current?.temperature || '--'}°
                </div>
                <div className="text-xs text-muted-foreground">Temp</div>
              </div>
              <div className="p-3 rounded-xl bg-background/60 border border-border/50 text-center">
                <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold text-foreground">{alerts?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Alerts</div>
              </div>
              <div className="p-3 rounded-xl bg-background/60 border border-border/50 text-center">
                <MapPin className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold text-foreground">
                  {locationAccuracy ? `±${Math.round(locationAccuracy)}` : '--'}
                </div>
                <div className="text-xs text-muted-foreground">Meters</div>
              </div>
            </div>

            {/* Status Message */}
            <div className={cn(
              "p-4 rounded-xl border-l-4",
              riskScore >= 70 ? "bg-destructive/10 border-destructive" :
              riskScore >= 50 ? "bg-warning/10 border-warning" :
              riskScore >= 25 ? "bg-primary/10 border-primary" :
              "bg-success/10 border-success"
            )}>
              <p className="text-sm text-foreground">
                {riskScore >= 70 ? 'Critical conditions detected. Take immediate protective action.' :
                 riskScore >= 50 ? 'Elevated risk. Stay alert and prepare emergency supplies.' :
                 riskScore >= 25 ? 'Moderate risk. Monitor local conditions.' :
                 'Low risk. Maintain normal activities.'}
              </p>
            </div>

            {/* Location Alert */}
            {locationBasedRisk?.insideProneArea && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">In Disaster-Prone Area</p>
                  <p className="text-xs text-destructive/80">{locationBasedRisk.nearestProneArea?.name}</p>
                </div>
              </div>
            )}

            {/* Recommendation */}
            {recommendations?.[0] && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <p className="text-sm text-muted-foreground">{recommendations[0]}</p>
              </div>
            )}

            {/* Footer */}
            <p className="text-xs text-center text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ModernDisasterRiskMeter.displayName = 'ModernDisasterRiskMeter';

export default ModernDisasterRiskMeter;
