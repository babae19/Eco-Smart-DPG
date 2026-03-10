
import React from 'react';
import { useSimplifiedHyperLocalAlerts } from '@/hooks/useSimplifiedHyperLocalAlerts';
import LocationStatusCard from './LocationStatusCard';
import LocationInfoGrid from './LocationInfoGrid';
import LocationActionButtons from './LocationActionButtons';
import MobileOptimizationStatus from './MobileOptimizationStatus';
import LocationCoordinatesDisplay from './LocationCoordinatesDisplay';
import LocationErrorDisplay from './LocationErrorDisplay';
import ProximityStatusCard from './ProximityStatusCard';
import HyperLocalFeedCard from './HyperLocalFeedCard';

const SimplifiedMobileLocationTracker: React.FC = () => {
  const {
    latitude,
    longitude,
    accuracy,
    hasLocation,
    locationLoading,
    locationError,
    refreshLocation,
    lastUpdateTime,
    isMobile,
    hyperLocalAlerts,
    geoFenceStatus,
    isAnalyzing,
    refreshAlerts,
    isLoading
  } = useSimplifiedHyperLocalAlerts();

  return (
    <div className="space-y-4">
      {/* Main Location Status Card */}
      <LocationStatusCard
        hasLocation={hasLocation}
        locationError={locationError}
        accuracy={accuracy}
        isMobile={isMobile}
        hyperLocalAlerts={hyperLocalAlerts}
        isAnalyzing={isAnalyzing}
      >
        {/* Location Information Grid */}
        <LocationInfoGrid
          accuracy={accuracy}
          lastUpdateTime={lastUpdateTime}
          isMobile={isMobile}
          hyperLocalAlerts={hyperLocalAlerts}
          isAnalyzing={isAnalyzing}
        />

        {/* Error Display */}
        <LocationErrorDisplay locationError={locationError} />

        {/* Mobile Optimization Status */}
        <MobileOptimizationStatus isMobile={isMobile} hasLocation={hasLocation} />

        {/* Action Buttons */}
        <LocationActionButtons
          refreshLocation={refreshLocation}
          refreshAlerts={refreshAlerts}
          hasLocation={hasLocation}
          locationLoading={locationLoading}
          isAnalyzing={isAnalyzing}
          isLoading={isLoading}
        />

        {/* Coordinates Display */}
        <LocationCoordinatesDisplay
          latitude={latitude}
          longitude={longitude}
          isMobile={isMobile}
        />
      </LocationStatusCard>

      {/* Proximity Status Card */}
      {hasLocation && geoFenceStatus && (
        <ProximityStatusCard geoFenceStatus={geoFenceStatus} />
      )}

      {/* Hyper-Local Alerts Display */}
      {hyperLocalAlerts.length > 0 && (
        <HyperLocalFeedCard 
          hyperLocalAlerts={hyperLocalAlerts}
          isAnalyzing={isAnalyzing}
          locationAccuracy={accuracy}
        />
      )}
    </div>
  );
};

export default SimplifiedMobileLocationTracker;
