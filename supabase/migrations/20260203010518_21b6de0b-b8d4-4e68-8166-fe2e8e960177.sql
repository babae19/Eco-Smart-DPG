-- Create campaign chat messages table for realtime community chat
CREATE TABLE public.campaign_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_campaign_chat_messages_campaign_id ON public.campaign_chat_messages(campaign_id);
CREATE INDEX idx_campaign_chat_messages_created_at ON public.campaign_chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.campaign_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Campaign members can view messages
CREATE POLICY "Campaign members can view messages"
ON public.campaign_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_members
    WHERE campaign_members.campaign_id = campaign_chat_messages.campaign_id
    AND campaign_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_chat_messages.campaign_id
    AND campaigns.created_by = auth.uid()
  )
);

-- Policy: Campaign members can send messages
CREATE POLICY "Campaign members can send messages"
ON public.campaign_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    EXISTS (
      SELECT 1 FROM public.campaign_members
      WHERE campaign_members.campaign_id = campaign_chat_messages.campaign_id
      AND campaign_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_chat_messages.campaign_id
      AND campaigns.created_by = auth.uid()
    )
  )
);

-- Policy: Users can delete their own messages, creators can delete any
CREATE POLICY "Users can delete own messages or creators can delete any"
ON public.campaign_chat_messages
FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_chat_messages.campaign_id
    AND campaigns.created_by = auth.uid()
  )
);

-- Enable realtime for campaign chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_chat_messages;