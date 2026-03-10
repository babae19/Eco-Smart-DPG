
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, MapPin, TrendingUp, Cloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useImprovedAIAnalysis } from '@/hooks/useImprovedAIAnalysis';
import { useLocationAccuracy } from '@/hooks/useLocationAccuracy';
import { checkProximityToDisasterProneAreas } from '@/services/disaster/geoProximityService';

const DisasterRiskMeter: React.FC = () => {
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
      
      const geoProximityStatus = checkProximityToDisasterProneAreas(
        latitude, 
        longitude, 
        locationAccuracy || 100
      );
      setLocationBasedRisk(geoProximityStatus);
      
      let locationRisk = 0;
      if (geoProximityStatus.insideProneArea) {
        locationRisk = geoProximityStatus.currentRiskLevel === 'critical' ? 90 :
                     geoProximityStatus.currentRiskLevel === 'high' ? 70 :
                     geoProximityStatus.currentRiskLevel === 'medium' ? 50 : 30;
      } else if (geoProximityStatus.proximityAlerts.length > 0) {
        const nearestAlert = geoProximityStatus.proximityAlerts[0];
        locationRisk = nearestAlert.urgency === 'high' ? 40 :
                      nearestAlert.urgency === 'medium' ? 25 : 15;
      }
      
      let weatherRisk = 0;
      const currentWeather = weatherData?.current;
      if (currentWeather) {
        const temp = currentWeather.temperature;
        const humidity = currentWeather.humidity;
        const precipitation = currentWeather.precipitation;
        const windSpeed = currentWeather.windSpeed;
        
        if (temp > 35 || temp < 15) weatherRisk += 20;
        if (humidity > 85) weatherRisk += 15;
        if (precipitation > 20) weatherRisk += 25;
        if (windSpeed > 25) weatherRisk += 20;
      }
      
      const aiRisk = aiRiskScore || 0;
      
      calculatedRiskScore = Math.round(
        (locationRisk * 0.40) + 
        (Math.min(weatherRisk, 100) * 0.30) + 
        (aiRisk * 0.30)
      );
      
      const newScore = Math.min(Math.max(calculatedRiskScore, 0), 100);
      setRiskScore(newScore);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error("Error calculating risk score:", error);
      setRiskScore(25);
    }
  }, [hasLocation, latitude, longitude, weatherData?.current?.temperature, aiRiskScore, locationLoading, locationAccuracy]);
  
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    toast({
      title: "Updating risk assessment",
      description: "Refreshing data...",
    });
    
    try {
      const refreshPromises = [];
      if (refreshAnalysis) refreshPromises.push(refreshAnalysis());
      if (refreshWeatherData) refreshPromises.push(refreshWeatherData());
      
      await Promise.all(refreshPromises);
      
      toast({
        title: "Risk assessment updated",
        description: "Latest data loaded successfully",
      });
    } catch (error) {
      console.error("Error refreshing analysis:", error);
      toast({
        title: "Update failed",
        description: "Could not refresh risk data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, toast, refreshAnalysis, refreshWeatherData]);

  useEffect(() => {
    if (!hasLocation) return;
    
    const interval = setInterval(() => {
      if (!isRefreshing && refreshAnalysis) {
        try {
          refreshAnalysis();
        } catch (error) {
          console.error('Error in auto-refresh:', error);
        }
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [hasLocation, isRefreshing, refreshAnalysis]);
  
  const getRiskLevel = () => {
    if (riskScore < 25) return { 
      text: 'Low Risk', 
      textColor: 'text-success',
      icon: <CheckCircle className="h-6 w-6 text-success" /> 
    };
    if (riskScore < 50) return { 
      text: 'Moderate Risk', 
      textColor: 'text-primary',
      icon: <AlertCircle className="h-6 w-6 text-primary" /> 
    };
    if (riskScore < 70) return { 
      text: 'High Risk', 
      textColor: 'text-warning',
      icon: <AlertTriangle className="h-6 w-6 text-warning" /> 
    };
    return { 
      text: 'Critical Risk', 
      textColor: 'text-destructive',
      icon: <AlertTriangle className="h-6 w-6 text-destructive" /> 
    };
  };
  
  const { text, textColor, icon } = getRiskLevel();
  const isLoading = weatherLoading || locationLoading || isAnalyzing;
  
  const getLocationAccuracyStatus = () => {
    if (!hasLocation) return { text: 'No Location', color: 'text-destructive' };
    if (!locationAccuracy) return { text: 'Location Found', color: 'text-primary' };
    if (locationAccuracy <= 10) return { text: 'High Accuracy', color: 'text-success' };
    if (locationAccuracy <= 50) return { text: 'Good Accuracy', color: 'text-primary' };
    return { text: 'Low Accuracy', color: 'text-warning' };
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/20">
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Activity className="h-5 w-5 text-primary" />
            Disaster Risk Assessment
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="h-8 px-3"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {!hasLocation && !locationLoading ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Location Required</p>
            <p className="text-xs text-muted-foreground">Enable location services for risk assessment</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="w-48 h-48 rounded-full bg-muted/50 animate-pulse mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Circular Risk Gauge */}
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  opacity="0.3"
                />
                
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke={`hsl(var(--${
                    riskScore >= 70 ? 'destructive' :
                    riskScore >= 50 ? 'warning' :
                    riskScore >= 25 ? 'primary' :
                    'success'
                  }))`}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(riskScore / 100) * 534} 534`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px hsl(var(--${
                      riskScore >= 70 ? 'destructive' :
                      riskScore >= 50 ? 'warning' :
                      riskScore >= 25 ? 'primary' :
                      'success'
                    }) / 0.5))`
                  }}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center mb-2">
                  {icon}
                </div>
                <div className="text-4xl font-bold text-foreground mb-1">
                  {riskScore}
                </div>
                <div className={`text-sm font-semibold ${textColor}`}>
                  {text}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  out of 100
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              riskScore >= 70 ? 'bg-destructive/10 border-destructive/30' :
              riskScore >= 50 ? 'bg-warning/10 border-warning/30' :
              riskScore >= 25 ? 'bg-primary/10 border-primary/30' :
              'bg-success/10 border-success/30'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full animate-pulse ${
                  riskScore >= 70 ? 'bg-destructive' :
                  riskScore >= 50 ? 'bg-warning' :
                  riskScore >= 25 ? 'bg-primary' :
                  'bg-success'
                }`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-1 text-foreground">Current Status</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {riskScore >= 70 ? 'Critical risk level detected. Take immediate protective measures and follow evacuation protocols if advised by authorities.' :
                     riskScore >= 50 ? 'Elevated risk in your area. Stay alert, monitor updates, and prepare emergency supplies.' :
                     riskScore >= 25 ? 'Moderate risk present. Stay informed about local conditions and follow standard safety guidelines.' :
                     'Low risk environment. Maintain normal activities with basic safety awareness.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Factors Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Weather</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {weatherData?.current ? `${weatherData.current.temperature}°C` : '—'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {weatherData?.current?.conditions || 'Loading...'}
                </div>
              </div>

              <div className="bg-card border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Location</span>
                </div>
                <div className={`text-sm font-bold ${getLocationAccuracyStatus().color}`}>
                  {getLocationAccuracyStatus().text}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {locationAccuracy ? `±${Math.round(locationAccuracy)}m` : 'Active'}
                </div>
              </div>

              <div className="bg-card border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">AI Analysis</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {alerts?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Active alerts
                </div>
              </div>

              <div className="bg-card border rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Updated</span>
                </div>
                <div className="text-sm font-bold text-foreground">
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {lastUpdated.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Location Alerts */}
            {locationBasedRisk?.insideProneArea && (
              <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive mb-1">Disaster-Prone Area</p>
                    <p className="text-xs text-destructive/80">{locationBasedRisk.nearestProneArea?.name}</p>
                  </div>
                </div>
              </div>
            )}
            
            {locationBasedRisk?.proximityAlerts?.length > 0 && !locationBasedRisk.insideProneArea && (
              <div className="p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-warning-foreground mb-1">Nearby Risk Area</p>
                    <p className="text-xs text-warning-foreground/80">
                      {locationBasedRisk.proximityAlerts[0].areaName} - {locationBasedRisk.proximityAlerts[0].distance.toFixed(1)}km away
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="p-4 bg-info/10 border-l-4 border-info rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-info/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs">💡</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-info-foreground mb-1">Safety Recommendation</p>
                    <p className="text-xs text-muted-foreground">{recommendations[0]}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisasterRiskMeter;
