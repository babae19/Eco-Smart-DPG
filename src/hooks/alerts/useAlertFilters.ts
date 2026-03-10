
import { useState } from 'react';
import { Alert } from '@/types/AlertTypes';

export function useAlertFilters() {
  const [filter, setFilter] = useState('all');
  
  // Filter alerts based on the selected filter
  const filterAlerts = (alerts: Alert[]) => {
    return alerts.filter(alert => {
      if (filter === 'all') return true;
      if (filter === 'high' || filter === 'medium' || filter === 'low') 
        return alert.severity === filter;
      
      // Filter by disaster type
      if (filter === 'flood') 
        return alert.title.toLowerCase().includes('flood') || 
               alert.description.toLowerCase().includes('flood') ||
               alert.type === 'flood' ||
               alert.type === 'flooding';
               
      if (filter === 'heat') 
        return alert.title.toLowerCase().includes('heat') || 
               alert.description.toLowerCase().includes('heat') ||
               alert.type === 'heat';
               
      if (filter === 'air') 
        return alert.title.toLowerCase().includes('air') || 
               alert.description.toLowerCase().includes('air quality') ||
               alert.type === 'air';
               
      if (filter === 'fire') 
        return alert.title.toLowerCase().includes('fire') || 
               alert.description.toLowerCase().includes('fire') ||
               alert.type === 'fire';
               
      if (filter === 'drought') 
        return alert.title.toLowerCase().includes('drought') || 
               alert.description.toLowerCase().includes('drought') ||
               alert.type === 'drought';
      
      return true;
    });
  };
  
  return {
    filter,
    setFilter,
    filterAlerts
  };
}
