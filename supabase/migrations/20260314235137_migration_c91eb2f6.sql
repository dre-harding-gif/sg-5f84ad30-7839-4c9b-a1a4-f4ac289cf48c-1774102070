-- Create inventory_transactions table
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('checkout', 'return', 'restock', 'adjustment')),
  quantity INTEGER NOT NULL,
  job_id VARCHAR(100),
  user_name VARCHAR(200),
  notes TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view transactions" ON inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create transactions" ON inventory_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);