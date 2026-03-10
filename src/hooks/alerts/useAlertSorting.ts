
import { Alert } from '@/types/AlertTypes';

export function sortAlertsByPriority(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    
    if (severityDiff === 0) {
      // If same severity, sort by newness (isNew first) then by ID (assuming newer alerts have higher IDs)
      if (a.isNew !== b.isNew) {
        return a.isNew ? -1 : 1;
      }
      return b.id.localeCompare(a.id);
    }
    
    return severityDiff;
  });
}
