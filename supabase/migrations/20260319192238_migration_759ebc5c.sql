-- Add condition column to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'needs_repair'));

-- Add comment to explain the field
COMMENT ON COLUMN inventory_items.condition IS 'Condition status for tools and equipment: excellent (green), good (green), fair (yellow), poor (orange), needs_repair (red)';