
import React from 'react';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { useDisasterAlerts } from '@/hooks/useDisasterAlerts';
import AlertsFilter from '../AlertsFilter';

const AllActiveAlertsSection: React.FC = () => {
  const { 
    filter, 
    setFilter, 
    filteredAlerts,
    refreshAlerts,
    isLoading: alertsLoading
  } = useDisasterAlerts();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold text-foreground">Active Alerts</h2>
          {alertsLoading && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
        </div>
        <button 
          onClick={() => {
            console.log('[DisasterAlerts] Manually refreshing alerts');
            refreshAlerts();
          }}
          disabled={alertsLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={alertsLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
      
      {/* Stats */}
      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Alerts</span>
          <span className="font-semibold text-foreground text-lg">{filteredAlerts.length}</span>
        </div>
        {alertsLoading && (
          <p className="text-xs text-muted-foreground mt-1">Updating...</p>
        )}
      </div>
      
      {/* Alerts List */}
      <AlertsFilter 
        filter={filter} 
        setFilter={setFilter} 
        filteredAlerts={filteredAlerts} 
      />
    </div>
  );
};

export default AllActiveAlertsSection;
