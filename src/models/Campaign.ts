
export type CampaignGoal = 
  | 'Raise Awareness'
  | 'Fundraising'
  | 'Community Engagement'
  | 'Educational Campaign'
  | 'Environmental Action';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Campaign {
  id: string;
  title: string;
  goal: CampaignGoal;
  endDate: Date;
  imageUrl?: string; // Deprecated: use images array instead
  images?: string[];
  createdAt: Date;
  createdBy: string;
  supporters: number;
  status: ApprovalStatus;
  description?: string;
}
