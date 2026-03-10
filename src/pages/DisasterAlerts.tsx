
import React from 'react';
import Header from '@/components/Header';
import CustomBottomNavigation from '@/components/CustomBottomNavigation';
import EnhancedAlertsTab from '@/components/disaster-alerts/components/EnhancedAlertsTab';
import { useSEO } from '@/hooks/useSEO';

const DisasterAlerts: React.FC = () => {
  useSEO({
    title: 'Climate Information Hub | Real-time Weather & Safety',
    description: 'Comprehensive climate data, weather forecasts, risk assessments, and personalized safety recommendations.',
    canonicalPath: '/alerts',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Climate Information Hub',
      description: 'Live weather data, forecasts, and climate risk assessments.'
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Climate Hub" showBackButton />
      
      <div className="px-4 py-4 max-w-7xl mx-auto">
        <EnhancedAlertsTab />
      </div>
      
      <CustomBottomNavigation />
    </div>
  );
};

export default DisasterAlerts;
