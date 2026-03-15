-- Create time_logs table for tracking work hours
CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked DECIMAL(5,2) NOT NULL,
  work_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own time logs" ON time_logs 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time logs" ON time_logs 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated staff can view all time logs" ON time_logs 
  FOR SELECT USING (auth.uid() IS NOT NULL);