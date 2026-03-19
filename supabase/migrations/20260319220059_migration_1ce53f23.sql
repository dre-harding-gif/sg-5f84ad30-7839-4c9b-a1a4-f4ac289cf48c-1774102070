-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated staff can manage jobs" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can view their own jobs" ON jobs;

-- Create new comprehensive policies for jobs table
CREATE POLICY "Users can create jobs"
  ON jobs
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update jobs"
  ON jobs
  FOR UPDATE
  TO public
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete jobs"
  ON jobs
  FOR DELETE
  TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view all jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Customers can view their own jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (customer_id = auth.uid());