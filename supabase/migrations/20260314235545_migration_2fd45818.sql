-- Update profiles table to add role and permissions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'builder';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"view_jobs": true, "view_inventory": true}'::jsonb;

-- Add constraint for valid roles
ALTER TABLE profiles ADD CONSTRAINT valid_role 
  CHECK (role IN ('owner', 'office_manager', 'site_manager', 'builder', 'customer'));

COMMENT ON COLUMN profiles.role IS 'User role: owner, office_manager, site_manager, builder, customer';
COMMENT ON COLUMN profiles.permissions IS 'JSON object storing granular permissions';