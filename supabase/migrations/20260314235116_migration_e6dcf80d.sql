-- Create company_bills table
CREATE TABLE company_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  provider VARCHAR(200) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  due_date DATE,
  last_paid DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view bills" ON company_bills FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage bills" ON company_bills FOR ALL USING (auth.uid() IS NOT NULL);