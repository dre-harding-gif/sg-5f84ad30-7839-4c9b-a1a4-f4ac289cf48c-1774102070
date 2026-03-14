-- Create inventory_items table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('material', 'tool')),
  name VARCHAR(300) NOT NULL,
  category VARCHAR(100) NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  unit VARCHAR(50),
  location VARCHAR(100),
  reorder_level INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2),
  supplier VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view inventory" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage inventory" ON inventory_items FOR ALL USING (auth.uid() IS NOT NULL);