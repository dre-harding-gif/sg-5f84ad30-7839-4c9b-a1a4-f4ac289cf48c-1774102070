-- Create insurance_policies table
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_type VARCHAR(100) NOT NULL,
  provider VARCHAR(200) NOT NULL,
  policy_number VARCHAR(100) NOT NULL UNIQUE,
  coverage_amount DECIMAL(12, 2),
  annual_premium DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view insurance" ON insurance_policies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage insurance" ON insurance_policies FOR ALL USING (auth.uid() IS NOT NULL);