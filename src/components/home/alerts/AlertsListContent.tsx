
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/types/AlertTypes';
import AlertCard from '@/components/AlertCard';
import AlertsLoadingState from './AlertsLoadingState';
import NoAlertsState from './NoAlertsState';

interface AlertsListContentProps {
  displayAlerts: Alert[];
  loading: boolean;
  isAnalyzing: boolean;
}

const AlertsListContent: React.FC<AlertsListContentProps> = ({
  displayAlerts,
  loading,
  isAnalyzing
}) => {
  const navigate = useNavigate();

  if (loading || isAnalyzing) {
    return <AlertsLoadingState />;
  }

  if (displayAlerts.length === 0) {
    return <NoAlertsState />;
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => (
        <AlertCard 
          key={alert.id} 
          id={alert.id} 
          title={alert.title}
          description={alert.description}
          severity={alert.severity}
          date={alert.date}
          location={alert.location}
          isPersonalized={alert.isPersonalized}
        />
      ))}
      <div className="flex justify-end">
        <button 
          className="text-sm text-green-600 flex items-center hover:text-green-700 transition-colors"
          onClick={() => navigate('/alerts')}
        >
          View all alerts <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AlertsListContent;
