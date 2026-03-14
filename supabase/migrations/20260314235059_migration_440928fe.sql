-- Create company_fleet table for tracking vans
CREATE TABLE company_fleet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration VARCHAR(20) NOT NULL UNIQUE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  mot_expiry DATE NOT NULL,
  insurance_expiry DATE NOT NULL,
  assigned_driver TEXT,
  mileage INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_fleet ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view fleet" ON company_fleet FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage fleet" ON company_fleet FOR ALL USING (auth.uid() IS NOT NULL);