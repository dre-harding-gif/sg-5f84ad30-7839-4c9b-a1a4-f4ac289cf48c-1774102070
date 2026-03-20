-- Make customer_id optional in jobs table
-- This allows creating jobs without customers when auth is disabled
ALTER TABLE jobs 
ALTER COLUMN customer_id DROP NOT NULL;