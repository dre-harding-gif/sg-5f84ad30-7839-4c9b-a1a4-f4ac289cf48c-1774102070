-- ============================================================================
-- PHASE 1: FIX SECURITY DEFINER VIEW (CRITICAL ERROR)
-- ============================================================================

-- Drop and recreate user_permissions view without SECURITY DEFINER
DROP VIEW IF EXISTS user_permissions;

CREATE VIEW user_permissions 
WITH (security_invoker = true) -- Use SECURITY INVOKER instead of SECURITY DEFINER
AS
SELECT 
    id,
    email,
    full_name,
    role,
    CASE role
        WHEN 'owner' THEN jsonb_build_object(
            'view_dashboard', true, 'view_jobs', true, 'edit_jobs', true, 
            'view_schedule', true, 'edit_schedule', true, 'view_team', true, 
            'edit_team', true, 'view_customers', true, 'edit_customers', true, 
            'view_leads', true, 'edit_leads', true, 'view_inventory', true, 
            'edit_inventory', true, 'view_pricing', true, 'edit_pricing', true, 
            'view_company', true, 'edit_company', true, 'view_reports', true, 
            'view_settings', true, 'edit_settings', true
        )
        WHEN 'office_manager' THEN jsonb_build_object(
            'view_dashboard', true, 'view_jobs', true, 'edit_jobs', true, 
            'view_schedule', true, 'edit_schedule', true, 'view_team', true, 
            'edit_team', false, 'view_customers', true, 'edit_customers', true, 
            'view_leads', true, 'edit_leads', true, 'view_inventory', true, 
            'edit_inventory', true, 'view_pricing', true, 'edit_pricing', false, 
            'view_company', true, 'edit_company', false, 'view_reports', true, 
            'view_settings', false, 'edit_settings', false
        )
        WHEN 'site_manager' THEN jsonb_build_object(
            'view_dashboard', true, 'view_jobs', true, 'edit_jobs', true, 
            'view_schedule', true, 'edit_schedule', true, 'view_team', true, 
            'edit_team', false, 'view_customers', true, 'edit_customers', false, 
            'view_leads', false, 'edit_leads', false, 'view_inventory', true, 
            'edit_inventory', true, 'view_pricing', false, 'edit_pricing', false, 
            'view_company', false, 'edit_company', false, 'view_reports', true, 
            'view_settings', false, 'edit_settings', false
        )
        WHEN 'builder' THEN jsonb_build_object(
            'view_dashboard', false, 'view_jobs', true, 'edit_jobs', false, 
            'view_schedule', true, 'edit_schedule', false, 'view_team', false, 
            'edit_team', false, 'view_customers', false, 'edit_customers', false, 
            'view_leads', false, 'edit_leads', false, 'view_inventory', true, 
            'edit_inventory', false, 'view_pricing', false, 'edit_pricing', false, 
            'view_company', false, 'edit_company', false, 'view_reports', false, 
            'view_settings', false, 'edit_settings', false
        )
        ELSE permissions
    END AS permissions
FROM profiles;