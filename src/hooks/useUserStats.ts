
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserStats {
  reports: number;
  tips: number;
  campaigns: number;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    reports: 0,
    tips: 0,
    campaigns: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setStats({ reports: 0, tips: 0, campaigns: 0 });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user's reports count
        const { count: reportsCount, error: reportsError } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id);

        if (reportsError) {
          console.error('Error fetching reports count:', reportsError);
        }

        // Fetch user's campaigns count
        const { count: campaignsCount, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id);

        if (campaignsError) {
          console.error('Error fetching campaigns count:', campaignsError);
        }

        // For now, set tips to 0 since we don't have a tips table
        const tipsCount = 0;

        setStats({
          reports: reportsCount || 0,
          tips: tipsCount,
          campaigns: campaignsCount || 0
        });

      } catch (error) {
        console.error('Error fetching user stats:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user stats';
        setError(errorMessage);
        setStats({ reports: 0, tips: 0, campaigns: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return { stats, loading, error };
};
