-- Remove the foreign key constraint that requires auth.users to exist
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Now profiles.id can be any UUID without needing to exist in auth.users