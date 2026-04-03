import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return res.status(200).json({
    env_check: {
      has_supabase_url: !!supabaseUrl,
      has_anon_key: !!anonKey,
      has_service_role_key: !!serviceRoleKey,
      supabase_url: supabaseUrl,
      anon_key_length: anonKey?.length,
      anon_key_prefix: anonKey?.substring(0, 50),
      service_role_key_length: serviceRoleKey?.length,
      service_role_key_prefix: serviceRoleKey?.substring(0, 50),
      service_role_key_suffix: serviceRoleKey?.substring(serviceRoleKey?.length - 20),
      all_env_vars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    }
  });
}