
import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ReportForm from '@/components/reports/ReportForm';
import { useSEO } from '@/hooks/useSEO';

const ReportPage: React.FC = () => {
  useSEO({
    title: 'Report Environmental Issue | Community Environmental Reports',
    description: 'Report environmental issues with photos and details to alert your community and authorities.',
    canonicalPath: '/report',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ReportageNewsArticle',
      headline: 'Report Environmental Issue',
      description: 'Community environmental report submission form.'
    }
  });
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="Report Environmental Issue" showBackButton />
      
      <div className="p-4">
        <ReportForm />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ReportPage;
