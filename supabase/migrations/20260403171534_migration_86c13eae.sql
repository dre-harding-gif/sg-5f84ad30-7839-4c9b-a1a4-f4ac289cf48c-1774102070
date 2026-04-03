-- ============================================================================
-- CRITICAL DATABASE FIXES - Phase 3: Remove Overly Permissive Policies
-- Removes policies with USING(true) or WITH CHECK(true) for non-SELECT operations
-- ============================================================================

-- Remove overly permissive INSERT policies and replace with proper auth checks

-- Daily tasks - Replace true INSERT with proper auth
DROP POLICY IF EXISTS "anon_insert" ON daily_tasks;
CREATE POLICY "authenticated_insert_daily_tasks" ON daily_tasks
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Enquiries - This should allow anonymous form submissions
-- Keep the anon_insert policy for enquiries as it's intentional for contact forms
-- No changes needed for enquiries table

DO $$ 
BEGIN
  RAISE NOTICE '✅ Phase 3 Complete: Removed overly permissive RLS policies';
END $$;