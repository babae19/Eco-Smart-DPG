
export interface EnvironmentalTip {
  id: number;
  tip?: string;
  title: string;
  content: string;
  category: string;
  source: string;
  imageUrl?: string;
  season?: 'all' | 'rainy' | 'hot' | 'cold';
}
