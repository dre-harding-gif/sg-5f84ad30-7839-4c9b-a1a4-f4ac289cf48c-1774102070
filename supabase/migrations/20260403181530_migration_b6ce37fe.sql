-- Create project_updates table for staff to post construction updates
CREATE TABLE IF NOT EXISTS project_updates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  update_type text NOT NULL CHECK (update_type IN ('milestone', 'progress', 'delay', 'completion', 'general')),
  is_visible_to_customer boolean DEFAULT true,
  posted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create maintenance_requests table for customer submissions
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('repair', 'inspection', 'warranty', 'general', 'emergency')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'scheduled', 'in_progress', 'completed', 'closed')),
  preferred_contact_method text DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'portal')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  response_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_updates_job ON project_updates(job_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_visible ON project_updates(is_visible_to_customer, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_job ON maintenance_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_customer ON maintenance_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status, created_at DESC);

-- RLS Policies for project_updates
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their job updates"
  ON project_updates FOR SELECT
  TO public
  USING (
    is_visible_to_customer = true 
    AND EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = project_updates.job_id 
      AND jobs.customer_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all updates"
  ON project_updates FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'office_manager', 'site_manager', 'builder')
    )
  );

CREATE POLICY "Staff can create updates"
  ON project_updates FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'office_manager', 'site_manager', 'builder')
    )
  );

CREATE POLICY "Staff can update updates"
  ON project_updates FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'office_manager', 'site_manager', 'builder')
    )
  );

CREATE POLICY "Staff can delete updates"
  ON project_updates FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'office_manager', 'site_manager', 'builder')
    )
  );

-- RLS Policies for maintenance_requests
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can create their own requests"
  ON maintenance_requests FOR INSERT
  TO public
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can view their own requests"
  ON maintenance_requests FOR SELECT
  TO public
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own requests"
  ON maintenance_requests FOR UPDATE
  TO public
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can view all requests"
  ON maintenance_requests FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'office_manager', 'site_manager', 'builder')
    )
  );

CREATE POLICY "Staff can update all requests"
  ON maintenance_requests FOR UPDATE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'office_manager', 'site_manager', 'builder')
    )
  );