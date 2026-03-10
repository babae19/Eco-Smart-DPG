
import React, { lazy, Suspense } from 'react';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import HomeHeader from '@/components/home/HomeHeader';
import LocationNotification from '@/components/LocationNotification';
import OptimizedClimateBreakdown from '@/components/disaster-alerts/OptimizedClimateBreakdown';
import DisasterRiskAnalysis from '@/components/home/disaster-risk/DisasterRiskAnalysis';
import EnhancedRecentReportsSection from '@/components/home/EnhancedRecentReportsSection';
import DailyEnvironmentalTips from '@/components/home/DailyEnvironmentalTips';
import FuturisticClimateFacts from '@/components/home/climate-facts/FuturisticClimateFacts';
import OptimizedWeatherAdvice from '@/components/weather/OptimizedWeatherAdvice';
import RealtimeLocationName from '@/components/home/RealtimeLocationName';
import FastCampaignsSection from '@/components/home/FastCampaignsSection';
import ShopSection from '@/components/shop/ShopSection';
import RealtimeNotificationProvider from '@/components/notifications/RealtimeNotificationProvider';

// Lazy loaded heavy components only
const DisasterProneAreasSection = lazy(() => import('@/components/home/DisasterProneAreasSection'));
const EmergencyContactsSection = lazy(() => import('@/components/home/EmergencyContactsSection'));

// Loading fallback component with better visual hierarchy
const SectionLoader = () => (
  <div className="p-6 bg-muted/30 rounded-xl animate-pulse mb-6 border border-muted/50">
    <div className="space-y-4">
      <div className="h-6 bg-muted rounded-md w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const Home: React.FC = () => {
  return (
    <RealtimeNotificationProvider>
      <div className="min-h-screen bg-background pb-16">
        <Header />
        
        <div className="p-4 space-y-6">
          <HomeHeader />
          
          {/* Real-time Location Display */}
          <RealtimeLocationName />
          
          <OptimizedClimateBreakdown />
          
          {/* AI Disaster Risk Analysis */}
          <DisasterRiskAnalysis />
          
          {/* Weather Advisory Section */}
          <OptimizedWeatherAdvice />
          
          {/* Fast-loading Campaigns (no realtime subscription) */}
          <FastCampaignsSection />
          
          {/* Climate Shop Section */}
          <ShopSection />
          
          {/* Enhanced Recent Reports Section */}
          <EnhancedRecentReportsSection />
          
          {/* Daily Climate Facts */}
          <FuturisticClimateFacts />
          
          <Suspense fallback={<SectionLoader />}>
            <DisasterProneAreasSection />
          </Suspense>
          
          {/* Daily Environmental Tips */}
          <DailyEnvironmentalTips />
          
          <Suspense fallback={<SectionLoader />}>
            <EmergencyContactsSection />
          </Suspense>
        </div>
        
        <LocationNotification />
        <CustomBottomNavigation />
      </div>
    </RealtimeNotificationProvider>
  );
};

export default Home;
