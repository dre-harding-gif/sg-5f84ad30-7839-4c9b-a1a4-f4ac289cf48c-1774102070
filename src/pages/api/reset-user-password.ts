import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: "Missing userId or newPassword" });
  }

  try {
    // Call the Edge Function to reset password with admin privileges
    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { userId, newPassword }
    });

    if (error) {
      console.error("Edge function error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
}