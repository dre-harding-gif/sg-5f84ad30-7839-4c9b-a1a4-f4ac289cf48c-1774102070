-- Create purchase_orders table for PO number tracking
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'delivered', 'cancelled')),
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  invoice_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view purchase orders" ON purchase_orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create purchase orders" ON purchase_orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update purchase orders" ON purchase_orders FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete purchase orders" ON purchase_orders FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create function to generate PO numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  po_number TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the next number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 'PO-' || current_year || '-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM purchase_orders
  WHERE po_number LIKE 'PO-' || current_year || '-%';
  
  -- Format: PO-2026-0001
  po_number := 'PO-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Create index for faster PO number lookups
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_job_id ON purchase_orders(job_id);