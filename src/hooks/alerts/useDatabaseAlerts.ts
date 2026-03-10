
import { Alert } from '@/types/AlertTypes';
import { supabase } from '@/integrations/supabase/client';

export async function fetchDatabaseAlerts(): Promise<Alert[]> {
  try {
    console.log('[useDatabaseAlerts] Attempting to fetch alerts from database...');
    
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('[useDatabaseAlerts] Supabase error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('[useDatabaseAlerts] No data returned from database');
      return [];
    }
    
    console.log(`[useDatabaseAlerts] Successfully fetched ${data.length} alerts`);
    
    return data.map(alert => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      location: alert.location,
      severity: alert.severity as 'high' | 'medium' | 'low',
      date: alert.date,
      isNew: false,
      type: alert.title.toLowerCase().includes('flood') ? 'flood' : 
            alert.title.toLowerCase().includes('heat') ? 'heat' :
            alert.title.toLowerCase().includes('fire') ? 'fire' :
            alert.title.toLowerCase().includes('air') ? 'air' :
            alert.title.toLowerCase().includes('drought') ? 'drought' : 'general'
    }));
  } catch (error) {
    console.error('[useDatabaseAlerts] Error fetching database alerts:', error);
    
    // Return fallback alerts in case of connection issues
    console.log('[useDatabaseAlerts] Returning fallback alerts');
    return [
      {
        id: 'offline-flood-alert',
        title: 'FLOOD RISK ALERT (OFFLINE)',
        description: 'Offline alert: Potential flooding in low-lying areas of Freetown. Stay informed through local news updates.',
        location: 'Freetown',
        severity: 'medium',
        date: new Date().toLocaleDateString(),
        isNew: false,
        type: 'flood'
      },
      {
        id: 'offline-heat-alert',
        title: 'HEAT ADVISORY (OFFLINE)',
        description: 'Offline alert: High temperatures expected. Stay hydrated and limit outdoor activities during peak hours.',
        location: 'Freetown',
        severity: 'medium',
        date: new Date().toLocaleDateString(),
        isNew: false,
        type: 'heat'
      }
    ];
  }
}
