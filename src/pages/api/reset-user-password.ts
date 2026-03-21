import type { NextApiRequest, NextApiResponse } from "next";

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

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Get service role key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("API: Missing Supabase configuration");
      return res.status(500).json({ 
        error: "Server configuration error",
        details: "Missing Supabase URL or service role key"
      });
    }

    console.log("API: Using Supabase Admin API", { supabaseUrl });

    // Call Supabase Admin API to update user password
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
        "apikey": serviceRoleKey
      },
      body: JSON.stringify({
        password: newPassword
      })
    });

    const responseText = await response.text();
    console.log("API: Supabase response", { 
      status: response.status,
      statusText: response.statusText,
      responseText
    });

    if (!response.ok) {
      console.error("API: Supabase Admin API error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      let errorMessage = "Failed to reset password";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }

      return res.status(response.status).json({ 
        error: errorMessage,
        details: `Status: ${response.status}`,
        supabaseResponse: responseText
      });
    }

    const userData = JSON.parse(responseText);
    console.log("API: Password reset successful", { userId: userData.id });

    return res.status(200).json({ 
      success: true, 
      message: "Password reset successfully",
      user: {
        id: userData.id,
        email: userData.email
      }
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