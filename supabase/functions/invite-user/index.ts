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
    console.log("=== Edge Function invoked ===");
    console.log("Method:", req.method);
    console.log("Headers:", Object.fromEntries(req.headers));

    // Parse request body
    let requestBody;
    try {
      const text = await req.text();
      console.log("Raw body:", text);
      requestBody = JSON.parse(text);
      console.log("Parsed body:", requestBody);
    } catch (parseError) {
      console.error("Body parse error:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body", 
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }),
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

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error - missing credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Creating Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    console.log("Checking for existing profile:", email);
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Profile check error:", profileCheckError);
      return new Response(
        JSON.stringify({ 
          error: "Database error checking existing user", 
          details: profileCheckError.message 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    let userId: string;
    let isNewUser = false;
    let temporaryPassword = "";

    if (existingProfile) {
      console.log("Existing user found:", existingProfile.id);
      userId = existingProfile.id;
      
      // Update profile
      console.log("Updating profile...");
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
          JSON.stringify({ 
            error: "Failed to update user profile", 
            details: updateError.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Send password reset email
      console.log("Sending password reset email...");
      const { error: resetError } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (resetError) {
        console.error("Password reset email error:", resetError);
      }

      console.log("Existing user updated successfully");
    } else {
      console.log("Creating new user...");
      isNewUser = true;
      temporaryPassword = generatePassword();

      // Create auth user
      console.log("Creating auth user...");
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
        console.error("Auth user created but no user object returned");
        return new Response(
          JSON.stringify({ error: "User creation failed - no user object" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      userId = authUser.user.id;
      console.log("Auth user created:", userId);

      // Create profile
      console.log("Creating profile...");
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
        console.log("Rolling back - deleting auth user...");
        await supabase.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ 
            error: "Failed to create user profile", 
            details: profileError.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Profile created successfully");
    }

    // Prepare success response
    const response = {
      success: true,
      userId,
      email,
      isNewUser,
      temporaryPassword: isNewUser ? temporaryPassword : undefined,
      message: isNewUser 
        ? "User created successfully! Share the temporary password securely."
        : "User updated and password reset email sent (if SMTP is configured)."
    };

    console.log("=== Success response ===");
    console.log(response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("=== UNEXPECTED ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error",
        type: error?.constructor?.name || "UnknownError"
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