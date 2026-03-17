-- Create public_enquiries table for the enquiry form
CREATE TABLE IF NOT EXISTS public_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  postcode TEXT,
  service_type TEXT NOT NULL,
  message TEXT,
  preferred_contact TEXT DEFAULT 'email',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for public_enquiries
ALTER TABLE public_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for the enquiry form)
CREATE POLICY "Anyone can submit enquiries" ON public_enquiries 
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can view
CREATE POLICY "Authenticated users can view enquiries" ON public_enquiries 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update enquiries" ON public_enquiries 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_public_enquiries_status ON public_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_public_enquiries_created_at ON public_enquiries(created_at DESC);