import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, role, resend = false } = await req.json();

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const siteUrl = Deno.env.get("SITE_URL") || "https://yourdomain.com";

    // If resending, check if user exists
    if (resend) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === email);

      if (existingUser) {
        // Generate a new temporary password
        const tempPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

        // Update user password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password: tempPassword }
        );

        if (updateError) {
          console.error("Password update error:", updateError);
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Send password recovery email (this triggers Supabase's email)
        const { error: recoveryError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
          redirectTo: `${siteUrl}/reset-password`,
        });

        // Note: recoveryError may occur if SMTP isn't configured, but we still provide manual credentials
        const emailSent = !recoveryError;

        return new Response(
          JSON.stringify({
            success: true,
            email,
            tempPassword,
            userId: existingUser.id,
            fullName: existingUser.user_metadata?.full_name || fullName,
            role: existingUser.user_metadata?.role || role,
            loginUrl: siteUrl,
            emailSent,
            message: emailSent 
              ? "Invitation email sent! Password reset link delivered." 
              : "User credentials updated. Share manually (SMTP not configured).",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, error: "User not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
    }

    // Creating new user
    if (!fullName || !role) {
      return new Response(
        JSON.stringify({ success: false, error: "Full name and role are required for new users" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Generate a secure temporary password (16 characters)
    const tempPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    // Create the user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email to allow immediate login
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ success: false, error: authError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Update the user's profile with their role
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role,
        full_name: fullName,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: profileError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Try to send invitation email via password reset
    const { error: emailError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    const emailSent = !emailError;

    return new Response(
      JSON.stringify({
        success: true,
        email,
        tempPassword,
        userId: authData.user.id,
        fullName,
        role,
        loginUrl: siteUrl,
        emailSent,
        message: emailSent
          ? "User created and invitation email sent!"
          : "User created. Share credentials manually (SMTP not configured).",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});