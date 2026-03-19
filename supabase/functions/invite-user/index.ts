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
    const { email, fullName, role } = await req.json();

    // Validate required fields
    if (!email || !fullName || !role) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
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

    // Generate a secure temporary password (16 characters)
    const tempPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    // Get the site URL for the login link
    const siteUrl = Deno.env.get("SITE_URL") || "https://yourdomain.com";

    // Create the user account with email sending enabled
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
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

    // Send custom invitation email with credentials
    // Note: This uses Supabase's built-in email templates
    // You'll need to customize the email template in Supabase Dashboard:
    // Authentication > Email Templates > Invite user
    
    // Generate password reset link (user can change password after first login)
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (resetError) {
      console.error("Reset link error:", resetError);
    }

    // For now, we'll return the credentials to be shown in the UI
    // Supabase will send a confirmation email automatically since email_confirm: true
    
    return new Response(
      JSON.stringify({
        success: true,
        email,
        tempPassword,
        userId: authData.user.id,
        fullName,
        role,
        loginUrl: siteUrl,
        message: "User created successfully. Credentials should be shared manually via the UI dialog.",
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