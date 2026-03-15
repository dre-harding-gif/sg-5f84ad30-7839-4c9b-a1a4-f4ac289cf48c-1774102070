-- Create leads table for Checkatrade integration
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL DEFAULT 'checkatrade',
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  service_requested TEXT NOT NULL,
  message TEXT,
  budget_range TEXT,
  urgency TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  assigned_to UUID REFERENCES profiles(id),
  converted_to_customer_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view leads" ON leads 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage leads" ON leads 
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert sample leads
INSERT INTO leads (source, customer_name, email, phone, address, postcode, service_requested, message, budget_range, urgency, status) VALUES
('checkatrade', 'James Miller', 'james.miller@email.com', '07123 456789', '15 Oak Avenue', 'SE12 8NQ', 'Kitchen Extension', 'Looking to extend kitchen into side return. Approx 3m x 4m. Would like quote.', '£30k-£40k', 'normal', 'new'),
('checkatrade', 'Emma Thompson', 'emma.t@email.com', '07234 567890', '42 Maple Drive', 'SE9 3PL', 'Loft Conversion', 'Want to convert loft into bedroom with ensuite. Hip to gable required.', '£40k-£50k', 'high', 'contacted'),
('referral', 'David Wilson', 'david.wilson@email.com', '07345 678901', '8 Birch Close', 'SE13 6RT', 'Bathroom Refurb', 'Complete bathroom refit needed. 2m x 2.5m room.', '£8k-£12k', 'normal', 'quoted'),
('website', 'Sophie Clarke', 'sophie.clarke@email.com', '07456 789012', '23 Cedar Road', 'SE10 9HB', 'Garage Conversion', 'Convert single garage to home office. Insulation, electrics, heating needed.', '£15k-£20k', 'normal', 'new'),
('checkatrade', 'Michael Brown', 'mbrown@email.com', '07567 890123', '67 Pine Street', 'SE14 5KL', 'House Extension', 'Two-story side extension - planning permission granted.', '£80k-£100k', 'high', 'contacted');