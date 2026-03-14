-- Create pricing_guide table
CREATE TABLE pricing_guide (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(200) NOT NULL,
  service_name VARCHAR(300) NOT NULL,
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  unit VARCHAR(50),
  estimated_duration VARCHAR(100),
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pricing_guide ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view pricing" ON pricing_guide FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage pricing" ON pricing_guide FOR ALL USING (auth.uid() IS NOT NULL);