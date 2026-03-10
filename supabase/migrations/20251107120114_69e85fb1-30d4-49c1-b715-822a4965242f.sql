-- Add missing is_active column to broadcast_notifications table
ALTER TABLE broadcast_notifications 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for efficient querying of active notifications
CREATE INDEX IF NOT EXISTS idx_broadcast_notifications_is_active 
ON broadcast_notifications(is_active) 
WHERE is_active = true;