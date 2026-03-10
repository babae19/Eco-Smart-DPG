
import { Campaign, CampaignGoal } from '../../models/Campaign';

/**
 * Converts a Supabase database campaign object to our Campaign model
 */
interface DbCampaign {
  id: string;
  title: string;
  goal: string;
  end_date: string;
  image_url?: string;
  images?: string[];
  created_at: string;
  created_by: string;
  supporters: number;
  status: string;
  description?: string;
}

export const mapDbCampaign = (dbCampaign: DbCampaign): Campaign => {
  return {
    id: dbCampaign.id,
    title: dbCampaign.title,
    goal: dbCampaign.goal as CampaignGoal,
    endDate: new Date(dbCampaign.end_date),
    imageUrl: dbCampaign.image_url,
    images: dbCampaign.images,
    createdAt: new Date(dbCampaign.created_at),
    createdBy: dbCampaign.created_by,
    supporters: dbCampaign.supporters,
    status: dbCampaign.status as Campaign['status'],
    description: dbCampaign.description
  };
};
