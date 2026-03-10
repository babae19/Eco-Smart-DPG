-- Add images array column to campaigns table and migrate existing data
ALTER TABLE campaigns ADD COLUMN images text[] DEFAULT '{}';

-- Migrate existing image_url data to images array
UPDATE campaigns 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Keep image_url for backward compatibility but it's deprecated
COMMENT ON COLUMN campaigns.image_url IS 'DEPRECATED: Use images array instead. Kept for backward compatibility.';