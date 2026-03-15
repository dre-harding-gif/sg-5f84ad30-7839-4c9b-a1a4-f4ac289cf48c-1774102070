-- Create customer_portal_access table
CREATE TABLE customer_portal_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE
);

ALTER TABLE customer_portal_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own portal access" ON customer_portal_access 
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Authenticated users can manage portal access" ON customer_portal_access 
  FOR ALL USING (auth.uid() IS NOT NULL);