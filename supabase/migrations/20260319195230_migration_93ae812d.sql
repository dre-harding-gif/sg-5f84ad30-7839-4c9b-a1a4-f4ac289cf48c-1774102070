-- Create job_documents table for plans, specs, warranties, certificates
CREATE TABLE IF NOT EXISTS job_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('plan', 'specification', 'warranty', 'certificate', 'other')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create customer_communications table for tracking customer concerns and messages
CREATE TABLE IF NOT EXISTS customer_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff')),
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_concern BOOLEAN DEFAULT false,
  concern_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE job_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_documents
CREATE POLICY "Authenticated users can view job documents" ON job_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can upload job documents" ON job_documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete job documents" ON job_documents FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for customer_communications
CREATE POLICY "Authenticated users can view communications" ON customer_communications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Customers can view their own communications" ON customer_communications FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Authenticated users can create communications" ON customer_communications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update communications" ON customer_communications FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_documents_job ON job_documents(job_id);
CREATE INDEX IF NOT EXISTS idx_job_documents_type ON job_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_customer_communications_job ON customer_communications(job_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_concerns ON customer_communications(is_concern, concern_resolved);