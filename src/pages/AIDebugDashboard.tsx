
import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { AIDebuggingDashboard } from '@/components/debug/AIDebuggingDashboard';

const AIDebugDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="AI Debug Dashboard" showBackButton />
      <AIDebuggingDashboard />
      <BottomNavigation />
    </div>
  );
};

export default AIDebugDashboard;
