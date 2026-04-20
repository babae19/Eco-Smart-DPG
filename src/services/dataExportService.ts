
import { supabase } from '@/integrations/supabase/client';

export const exportUserData = async (userId: string) => {
  try {
    // Gather all user-related data
    const [
      { data: profile },
      { data: campaigns },
      { data: listings },
      { data: reports },
      { data: favoriteCampaigns },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('campaigns').select('*').eq('creator_id', userId),
      supabase.from('listings').select('*').eq('seller_id', userId),
      supabase.from('reports').select('*').eq('user_id', userId),
      supabase.from('campaign_favorites').select('campaign_id').eq('user_id', userId),
    ]);

    const userData = {
      profile: profile || {},
      campaigns: campaigns || [],
      listings: listings || [],
      reports: reports || [],
      favorites: favoriteCampaigns || [],
      exportedAt: new Date().toISOString(),
      source: 'Eco-Smart Platform'
    };

    // Trigger download
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eco-smart-data-${userId}-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Data export failed:', error);
    throw error;
  }
};
