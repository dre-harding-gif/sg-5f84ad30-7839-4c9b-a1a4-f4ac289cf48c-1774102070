import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, newPassword } = req.body;

    console.log("API: Attempting password reset for:", email);

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("API: Missing Supabase configuration");
      return res.status(500).json({ 
        error: "Server configuration error",
        details: "Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY in environment variables."
      });
    }

    // Create Supabase Admin Client using the Service Role Key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Look up user by email securely on the server
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("API: Failed to list users", listError);
      return res.status(500).json({ 
        error: "Failed to look up user", 
        details: listError.message 
      });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.error("API: User not found for email:", email);
      return res.status(404).json({ error: `No user found with email: ${email}` });
    }

    console.log("API: Found user ID:", user.id);

    // 2. Update the password using Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("API: Failed to update password", updateError);
      return res.status(500).json({ 
        error: "Failed to reset password", 
        details: updateError.message 
      });
    }

    console.log("API: Password reset successful for user:", user.id);

    return res.status(200).json({ 
      success: true, 
      message: "Password reset successfully",
    });
  } catch (error: any) {
    console.error("API: Unexpected error:", error);
    return res.status(500).json({ 
      error: "Failed to reset password",
      details: error.message || String(error)
    });
  }
}