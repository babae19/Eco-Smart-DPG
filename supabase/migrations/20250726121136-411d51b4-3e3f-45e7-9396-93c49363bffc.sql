-- Create disaster alerts table for realtime alerts
CREATE TABLE IF NOT EXISTS public.disaster_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  probability INTEGER NOT NULL DEFAULT 0,
  timeframe TEXT NOT NULL,
  precautions TEXT[] NOT NULL DEFAULT '{}',
  weather_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for reading active alerts (public access for disaster alerts)
CREATE POLICY "Anyone can view active disaster alerts" 
ON public.disaster_alerts 
FOR SELECT 
USING (is_active = true AND expires_at > now());

-- Create policy for admin management
CREATE POLICY "Admins can manage disaster alerts" 
ON public.disaster_alerts 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create index for performance
CREATE INDEX idx_disaster_alerts_active ON public.disaster_alerts (is_active, expires_at);
CREATE INDEX idx_disaster_alerts_location ON public.disaster_alerts USING GIN (coordinates);
CREATE INDEX idx_disaster_alerts_severity ON public.disaster_alerts (severity, created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_disaster_alerts_updated_at
BEFORE UPDATE ON public.disaster_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for disaster alerts
ALTER TABLE public.disaster_alerts REPLICA IDENTITY FULL;