import React, { memo, Suspense } from 'react';
import { useUserLocation } from '@/contexts/LocationContext';
import { useRealtimeDateTime } from '@/hooks/useRealtimeDateTime';
import { useDisasterAlerts } from '@/hooks/useDisasterAlerts';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Lazy load heavy components for faster initial render
const TemperatureAlerts = React.lazy(() => import('@/components/alerts/TemperatureAlerts'));
const DailyWeather = React.lazy(() => import('@/components/DailyWeather'));
const AlertStatusBanner = React.lazy(() => import('../AlertStatusBanner'));
const PersonalizedAlertsSection = React.lazy(() => import('../PersonalizedAlertsSection'));
const AlertDetectedRisks = React.lazy(() => import('./AlertDetectedRisks'));

// Lightweight loading placeholder
const SectionLoader = memo(() => (
  <Card className="p-4 animate-pulse">
    <div className="h-20 bg-muted rounded" />
  </Card>
));

const GeneralAlertsTabContent: React.FC = memo(() => {
  const { 
    latitude, 
    longitude, 
    isLoading: locationLoading, 
    error: locationError,
    accuracy,
    lastUpdated
  } = useUserLocation();
  const { formattedTime } = useRealtimeDateTime();
  const { 
    filteredAlerts, 
    animateAlerts,
    isLoading: alertsLoading
  } = useDisasterAlerts();

  return (
    <div className="space-y-4">
      {/* Temperature Alerts Section */}
      <Suspense fallback={<SectionLoader />}>
        <TemperatureAlerts />
      </Suspense>

      {/* Weather Forecast Section */}
      <Suspense fallback={<SectionLoader />}>
        <DailyWeather />
      </Suspense>

      {/* Main Alert Status Banner */}
      <Suspense fallback={<SectionLoader />}>
        <AlertStatusBanner />
      </Suspense>

      {/* Location-specific alert section */}
      <Suspense fallback={<SectionLoader />}>
        <PersonalizedAlertsSection
          latitude={latitude}
          longitude={longitude}
          locationLoading={locationLoading}
          locationError={locationError}
          accuracy={accuracy}
          lastUpdated={lastUpdated}
          formattedTime={formattedTime}
          animateAlerts={animateAlerts}
        />
      </Suspense>
      
      {/* Detected risks section with realtime updates */}
      <div>
        <h2 className="text-base font-semibold mb-2 flex items-center">
          <AlertTriangle size={16} className="text-amber-500 mr-2" />
          Risk Assessment
        </h2>
        <Card className="p-3">
          <Suspense fallback={<SectionLoader />}>
            <AlertDetectedRisks 
              alerts={filteredAlerts} 
              isLoading={alertsLoading} 
            />
          </Suspense>
        </Card>
      </div>
    </div>
  );
});

GeneralAlertsTabContent.displayName = 'GeneralAlertsTabContent';

export default GeneralAlertsTabContent;
