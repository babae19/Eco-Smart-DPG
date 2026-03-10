-- Add missing expires_at column to broadcast_notifications table
ALTER TABLE broadcast_notifications 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of active notifications
CREATE INDEX IF NOT EXISTS idx_broadcast_notifications_expires_at 
ON broadcast_notifications(expires_at) 
WHERE expires_at IS NOT NULL;