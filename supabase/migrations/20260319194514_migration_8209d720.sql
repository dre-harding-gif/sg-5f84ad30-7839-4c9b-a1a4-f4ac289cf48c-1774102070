-- Create fleet_issues table
CREATE TABLE IF NOT EXISTS fleet_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES company_fleet(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_date TIMESTAMP WITH TIME ZONE
);

-- Create fleet_service_bookings table
CREATE TABLE IF NOT EXISTS fleet_service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES company_fleet(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  booked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add status column to company_fleet
ALTER TABLE company_fleet ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- Enable RLS
ALTER TABLE fleet_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_service_bookings ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Authenticated users can view fleet issues" ON fleet_issues FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert fleet issues" ON fleet_issues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update fleet issues" ON fleet_issues FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view fleet bookings" ON fleet_service_bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert fleet bookings" ON fleet_service_bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update fleet bookings" ON fleet_service_bookings FOR UPDATE USING (auth.uid() IS NOT NULL);