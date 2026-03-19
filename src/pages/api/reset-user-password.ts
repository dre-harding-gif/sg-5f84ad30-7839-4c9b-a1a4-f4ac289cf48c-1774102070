import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, newPassword } = req.body;

    console.log("API: Attempting password reset", { userId, hasPassword: !!newPassword });

    if (!userId || !newPassword) {
      return res.status(400).json({ error: "User ID and new password are required" });
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { userId, newPassword },
    });

    console.log("API: Edge Function response", { 
      data, 
      error: error?.message,
      errorContext: error?.context 
    });

    if (error) {
      console.error("API: Edge Function error:", error);
      return res.status(500).json({ 
        error: "Failed to reset password", 
        details: error.message,
        context: error.context
      });
    }

    if (data?.error) {
      console.error("API: Edge Function returned error:", data.error);
      return res.status(400).json({ 
        error: data.error,
        details: data.details
      });
    }

    console.log("API: Password reset successful");
    return res.status(200).json({ 
      success: true, 
      message: "Password reset successfully",
      user: data?.user
    });
  } catch (error: any) {
    console.error("API: Unexpected error:", error);
    return res.status(500).json({ 
      error: "Failed to reset password",
      details: error.message,
      stack: error.stack
    });
  }
}