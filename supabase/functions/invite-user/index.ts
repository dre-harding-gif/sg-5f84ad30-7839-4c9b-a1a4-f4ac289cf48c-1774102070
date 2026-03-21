import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

console.log("🚀 Edge Function starting up...");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("📨 Request received:", req.method, req.url);

  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔐 Checking environment variables...");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing environment variables:", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseServiceKey 
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Server configuration error: Missing environment variables" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("✅ Environment variables OK");
    console.log("📦 Creating Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Supabase client created");

    console.log("📖 Reading request body...");
    const body = await req.json();
    console.log("📦 Request body:", JSON.stringify(body, null, 2));

    const { email, full_name, role, phone } = body;

    if (!email || !full_name || !role) {
      console.error("❌ Missing required fields:", { email: !!email, full_name: !!full_name, role: !!role });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email, full name, and role are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    console.log("✅ Required fields validated");
    console.log("🔍 Checking if user already exists:", email);

    // Check if user already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (profileCheckError) {
      console.error("❌ Error checking existing profile:", profileCheckError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Database error while checking user",
          details: profileCheckError.message 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    console.log("🔍 User exists check result:", existingProfile ? "EXISTS" : "NEW USER");

    let userId: string;
    let isNewUser = false;
    let temporaryPassword = "";

    if (existingProfile) {
      console.log("♻️ Updating existing user:", email);
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
        console.error("❌ Error updating profile:", updateError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to update user profile",
            details: updateError.message 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 500 
          }
        );
      }

      console.log("✅ Profile updated");
      console.log("📧 Sending password reset email...");

      // Send password reset email
      const { error: resetError } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (resetError) {
        console.error("⚠️ Password reset error:", resetError);
      } else {
        console.log("✅ Password reset email sent");
      }

    } else {
      console.log("➕ Creating new user:", email);
      isNewUser = true;
      temporaryPassword = generatePassword();
      console.log("🔑 Generated temporary password");

      console.log("👤 Creating auth user...");
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
        console.error("❌ Auth user creation error:", authError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to create user account", 
            details: authError.message 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 400 
          }
        );
      }

      if (!authUser.user) {
        console.error("❌ No user returned from auth creation");
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to create user account - no user data returned" 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 500 
          }
        );
      }

      userId = authUser.user.id;
      console.log("✅ Auth user created:", userId);

      console.log("👤 Creating profile...");
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
        console.error("❌ Profile creation error:", profileError);
        console.log("🔄 Rolling back: deleting auth user...");
        await supabase.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to create user profile", 
            details: profileError.message 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 400 
          }
        );
      }

      console.log("✅ Profile created successfully");
    }

    const response = {
      success: true,
      userId,
      email,
      isNewUser,
      temporaryPassword: isNewUser ? temporaryPassword : undefined,
      message: isNewUser 
        ? "User created! Share the temporary password with them (SMTP may not be configured)."
        : "User updated and password reset email sent (if SMTP is configured)."
    };

    console.log("✅ Success! Returning response:", JSON.stringify({ ...response, temporaryPassword: "***" }));

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("💥 UNEXPECTED ERROR:", error);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
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