-- Create sub_contractors table to store sub-contractor information
CREATE TABLE IF NOT EXISTS sub_contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sub_contractors_name ON sub_contractors(name);

-- Add RLS policy (disabled for now since auth is disabled)
ALTER TABLE sub_contractors DISABLE ROW LEVEL SECURITY;