import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== Invite User Function Started ===");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { email, full_name, role, phone } = requestBody;

    // Validate required fields
    if (!email || !full_name || !role) {
      console.error("Missing required fields:", { email: !!email, full_name: !!full_name, role: !!role });
      return new Response(
        JSON.stringify({ error: "Email, full name, and role are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Processing invite for:", email);

    // Check if user already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Profile check error:", profileCheckError);
      return new Response(
        JSON.stringify({ error: "Database error checking existing user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    let userId: string;
    let isNewUser = false;
    let temporaryPassword = "";

    if (existingProfile) {
      console.log("User exists, updating profile:", existingProfile.id);
      userId = existingProfile.id;
      
      // Update profile with new details
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name,
          role,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Profile update error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update user profile" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Send password reset email (will use SMTP if configured)
      const { error: resetError } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (resetError) {
        console.error("Password reset error:", resetError);
        // Don't fail the whole operation if email fails
      }

      console.log("Updated existing user:", email);
    } else {
      console.log("Creating new user:", email);
      isNewUser = true;
      temporaryPassword = generatePassword();

      // Create new auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
        },
      });

      if (authError) {
        console.error("Auth user creation error:", authError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to create user account", 
            details: authError.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (!authUser.user) {
        console.error("No user returned from createUser");
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      userId = authUser.user.id;
      console.log("Auth user created:", userId);

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email,
        full_name,
        role,
        phone: phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Rollback: delete auth user
        await supabase.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ 
            error: "Failed to create user profile", 
            details: profileError.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Profile created for:", email);
    }

    // Prepare success response
    const response: any = {
      success: true,
      userId,
      email,
      isNewUser,
    };

    if (isNewUser) {
      response.temporaryPassword = temporaryPassword;
      response.message = "User created successfully! Share the temporary password with them.";
      response.emailSent = false; // We're returning the password, not sending email
    } else {
      response.message = "User updated and password reset email sent (if SMTP configured).";
      response.emailSent = true; // Attempted to send email
    }

    console.log("=== Invite User Function Completed Successfully ===");
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("=== Unexpected Error ===");
    console.error("Error:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generatePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  const crypto = globalThis.crypto;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}