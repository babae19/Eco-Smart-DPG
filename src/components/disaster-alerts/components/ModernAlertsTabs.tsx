/**
 * Modern Alerts Tabs Component
 * Redesigned for better UX, faster loading, and modern aesthetics
 */

import React, { useState, memo } from 'react';
import { AlertTriangle, Cloud, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import GeneralAlertsTabContent from './GeneralAlertsTabContent';
import WeatherAlertsTab from './WeatherAlertsTab';

const ModernAlertsTabs: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<'general' | 'weather'>('general');

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Shield },
    { id: 'weather' as const, label: 'Weather', icon: Cloud },
  ];

  return (
    <div className="space-y-4">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
              <AlertTriangle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Alert Center</h2>
            <p className="text-xs text-muted-foreground">Real-time monitoring active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-success/10 border border-success/20">
          <Zap className="h-3.5 w-3.5 text-success" />
          <span className="text-xs font-semibold text-success">Live</span>
        </div>
      </div>

      {/* Modern Tab Switcher */}
      <div className="relative bg-muted/50 rounded-xl p-1 border border-border/50">
        <div className="flex relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div className="animate-in fade-in-50 duration-200">
        {activeTab === 'general' ? (
          <GeneralAlertsTabContent />
        ) : (
          <WeatherAlertsTab />
        )}
      </div>
    </div>
  );
});

ModernAlertsTabs.displayName = 'ModernAlertsTabs';

export default ModernAlertsTabs;
