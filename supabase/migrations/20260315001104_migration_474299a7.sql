-- Create purchase_orders table
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  supplier TEXT NOT NULL,
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'delivered', 'invoiced', 'paid')),
  items JSONB,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view purchase orders" ON purchase_orders 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage purchase orders" ON purchase_orders 
  FOR ALL USING (auth.uid() IS NOT NULL);