-- Create company_settings table for email configuration
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Harding Homes',
  company_email text NOT NULL,
  notification_email text,
  resend_api_key_configured boolean DEFAULT false,
  email_notifications_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for company_settings
CREATE POLICY "Anyone can view company settings"
  ON company_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only owners can update company settings"
  ON company_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

CREATE POLICY "Only owners can insert company settings"
  ON company_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- Insert initial company settings
INSERT INTO company_settings (
  company_name,
  company_email,
  notification_email,
  resend_api_key_configured,
  email_notifications_enabled
)
VALUES (
  'Harding Homes',
  'dre-harding@hardinghomes.info',
  'dre-harding@hardinghomes.info',
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Verify Dre Harding's account
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE email = 'dre-harding@hardinghomes.info';