-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  job_id UUID REFERENCES jobs(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  valid_until DATE,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  quote_id UUID REFERENCES quotes(id),
  job_id UUID REFERENCES jobs(id),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  payment_method TEXT,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  paid_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for automated communications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id),
  customer_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  trigger_event TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_photos table with before/after tagging
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes
CREATE POLICY "Users can view quotes" ON quotes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create quotes" ON quotes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update quotes" ON quotes FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices" ON invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for notifications
CREATE POLICY "Users can view notifications" ON notifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for job_photos
CREATE POLICY "Users can view job photos" ON job_photos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can upload job photos" ON job_photos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete job photos" ON job_photos FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_job ON quotes(job_id);
CREATE INDEX idx_invoices_quote ON invoices(quote_id);
CREATE INDEX idx_invoices_job ON invoices(job_id);
CREATE INDEX idx_notifications_job ON notifications(job_id);
CREATE INDEX idx_job_photos_job ON job_photos(job_id);
CREATE INDEX idx_job_photos_type ON job_photos(photo_type);