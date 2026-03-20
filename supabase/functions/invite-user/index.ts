import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== INVITE USER FUNCTION START ===");
  console.log("Request method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const body = await req.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));
    
    const { email, fullName, role, resend } = body;

    // Validate inputs
    if (!email || !fullName || !role) {
      console.error("❌ Missing required fields:", { email: !!email, fullName: !!fullName, role: !!role });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: email, fullName, and role are required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("✅ All required fields present");

    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Supabase URL:", supabaseUrl);
    console.log("Service key exists:", !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase credentials");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing Supabase credentials" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("✅ Supabase credentials present, creating admin client...");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("✅ Supabase admin client created");

    // Check if user already exists in auth.users
    console.log("Checking for existing auth user with email:", email);
    const { data: existingAuthUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to check existing users",
          details: listError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const existingAuthUser = existingAuthUsers.users.find(u => u.email === email);
    console.log("Existing auth user check result:", existingAuthUser ? "Found" : "Not found");

    // Generate temporary password
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;
    console.log("Generated password length:", tempPassword.length);

    if (existingAuthUser && resend) {
      console.log("This is a resend request for existing user:", existingAuthUser.id);
      
      // Update the user's password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        { password: tempPassword }
      );

      if (updateError) {
        console.error("❌ Error updating user password:", updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to reset password",
            details: updateError
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log("✅ Password reset for existing user");
      
      return new Response(
        JSON.stringify({
          success: true,
          userId: existingAuthUser.id,
          email: email,
          tempPassword: tempPassword,
          emailSent: false,
          message: "Password reset. Share new credentials with team member.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (existingAuthUser && !resend) {
      console.log("❌ User already exists (not a resend request)");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Team member with this email already exists" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    // Create new auth user
    console.log("Creating new auth user with email:", email);
    const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: role
      }
    });

    if (createAuthError) {
      console.error("❌ Error creating auth user:", createAuthError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to create user account",
          details: createAuthError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("✅ Auth user created successfully:", newAuthUser.user.id);

    // Create profile with the auth user's ID
    console.log("Creating profile with data:", { id: newAuthUser.user.id, email, full_name: fullName, role });
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newAuthUser.user.id,
        email: email,
        full_name: fullName,
        role: role,
      })
      .select()
      .single();

    if (profileError) {
      console.error("❌ Error creating profile:", profileError);
      // If profile creation fails, delete the auth user to keep things consistent
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to create team member profile",
          details: profileError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("✅ Profile created successfully:", newProfile);
    console.log("=== INVITE USER FUNCTION SUCCESS ===");

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        userId: newAuthUser.user.id,
        email: email,
        tempPassword: tempPassword,
        emailSent: false,
        message: "Team member created successfully. Share credentials with them to log in.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("=== INVITE USER FUNCTION ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred",
        errorType: error.constructor.name,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});