-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create campaign_members table for users joining campaigns
CREATE TABLE public.campaign_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(campaign_id, user_id)
);

-- Create campaign_updates table for creator posts
CREATE TABLE public.campaign_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_members
CREATE POLICY "Users can view campaign members"
ON public.campaign_members FOR SELECT
USING (true);

CREATE POLICY "Users can join campaigns"
ON public.campaign_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave campaigns"
ON public.campaign_members FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their membership preferences"
ON public.campaign_members FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for campaign_updates
CREATE POLICY "Anyone can view campaign updates"
ON public.campaign_updates FOR SELECT
USING (true);

CREATE POLICY "Campaign creators can post updates"
ON public.campaign_updates FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE id = campaign_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Campaign creators can edit their updates"
ON public.campaign_updates FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Campaign creators can delete their updates"
ON public.campaign_updates FOR DELETE
USING (auth.uid() = created_by);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_updates;

-- Create trigger for updating updated_at on campaign_updates
CREATE TRIGGER update_campaign_updates_updated_at
BEFORE UPDATE ON public.campaign_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();