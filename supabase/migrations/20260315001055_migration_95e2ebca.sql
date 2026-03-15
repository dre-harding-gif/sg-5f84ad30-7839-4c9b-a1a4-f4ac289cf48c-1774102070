-- Create jobs table with proper structure
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  postcode TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0,
  quoted_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  assigned_team UUID[] DEFAULT '{}',
  materials_needed TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view jobs" ON jobs 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Customers can view their own jobs" ON jobs 
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Authenticated staff can manage jobs" ON jobs 
  FOR ALL USING (auth.uid() IS NOT NULL);