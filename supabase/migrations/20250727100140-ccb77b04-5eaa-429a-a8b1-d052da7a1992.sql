-- Create a table for broadcast notifications that go to all users
CREATE TABLE public.broadcast_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  priority INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for admins to create broadcast notifications
CREATE POLICY "Admins can create broadcast notifications" 
ON public.broadcast_notifications 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Policy for admins to update broadcast notifications
CREATE POLICY "Admins can update broadcast notifications" 
ON public.broadcast_notifications 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Policy for all authenticated users to view active broadcast notifications
CREATE POLICY "All users can view active broadcast notifications" 
ON public.broadcast_notifications 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create trigger for updated_at
CREATE TRIGGER update_broadcast_notifications_updated_at
BEFORE UPDATE ON public.broadcast_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();