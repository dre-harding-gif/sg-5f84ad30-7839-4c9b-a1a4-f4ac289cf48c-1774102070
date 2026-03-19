-- ============================================================================
-- PHASE 3: ADD PERFORMANCE INDEXES (Based on actual schema)
-- ============================================================================

-- Notifications indexes (profile_id already has FK index)
CREATE INDEX IF NOT EXISTS idx_notifications_read_created ON notifications(read, created_at);

-- Job photos indexes (job_id already has FK index)
CREATE INDEX IF NOT EXISTS idx_job_photos_type ON job_photos(photo_type);

-- Daily tasks indexes
CREATE INDEX IF NOT EXISTS idx_daily_tasks_due_status ON daily_tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_assigned_to ON daily_tasks(assigned_to) WHERE assigned_to IS NOT NULL;

-- Leads indexes (assigned_to already has FK index)
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_postcode ON leads(postcode) WHERE postcode IS NOT NULL;

-- Spatial indexes for leads with coordinates
CREATE INDEX IF NOT EXISTS idx_leads_coordinates ON leads(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;