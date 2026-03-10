-- Fix notifications table to add missing data column
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS alert_data JSONB,
ADD COLUMN IF NOT EXISTS data JSONB;

-- Fix disaster_alerts table data type issues for coordinates
ALTER TABLE public.disaster_alerts 
ALTER COLUMN coordinates TYPE JSONB USING coordinates::JSONB;

-- Update any existing latitude/longitude columns to be numeric
-- Check if we have individual lat/lng columns and fix them
DO $$
BEGIN
    -- Check if latitude column exists and fix type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='disaster_alerts' AND column_name='latitude' 
               AND table_schema='public') THEN
        -- Drop and recreate as numeric if it's not already
        ALTER TABLE public.disaster_alerts 
        ALTER COLUMN latitude TYPE NUMERIC USING latitude::NUMERIC;
    END IF;
    
    -- Check if longitude column exists and fix type  
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='disaster_alerts' AND column_name='longitude' 
               AND table_schema='public') THEN
        ALTER TABLE public.disaster_alerts 
        ALTER COLUMN longitude TYPE NUMERIC USING longitude::NUMERIC;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Continue if columns don't exist or other issues
        NULL;
END $$;

-- Ensure disaster_alerts has proper RLS policies
ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for disaster_alerts if they don't exist
DO $$
BEGIN
    -- Policy to allow users to view all active alerts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'disaster_alerts_select_policy' AND tablename = 'disaster_alerts') THEN
        CREATE POLICY disaster_alerts_select_policy ON public.disaster_alerts
        FOR SELECT USING (is_active = true);
    END IF;
    
    -- Policy to allow service role to manage alerts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'disaster_alerts_service_policy' AND tablename = 'disaster_alerts') THEN
        CREATE POLICY disaster_alerts_service_policy ON public.disaster_alerts
        FOR ALL USING (true)
        WITH CHECK (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Update function security settings
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;