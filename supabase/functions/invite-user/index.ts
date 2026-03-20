import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== INVITE USER FUNCTION START ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);

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

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Supabase URL:", supabaseUrl);
    console.log("Service key exists:", !!supabaseServiceKey);
    console.log("Service key length:", supabaseServiceKey?.length || 0);

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

    console.log("✅ Supabase credentials present, creating client...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("✅ Supabase client created");

    // Check if user already exists
    console.log("Checking for existing user with email:", email);
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error checking for existing user:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error while checking for existing user",
          details: checkError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Existing user check result:", existingUser);

    if (existingUser && !resend) {
      console.log("❌ User already exists (not a resend request)");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Team member with this email already exists" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    // Generate UUID and temporary password
    const userId = existingUser?.id || crypto.randomUUID();
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;
    
    console.log("Generated userId:", userId);
    console.log("Generated password length:", tempPassword.length);

    if (existingUser && resend) {
      console.log("This is a resend request for existing user:", userId);
      console.log("✅ Password regenerated for resend");
      
      return new Response(
        JSON.stringify({
          success: true,
          userId: userId,
          email: email,
          tempPassword: tempPassword,
          emailSent: false,
          message: "Password reset. Share new credentials with team member.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create profile directly in profiles table
    console.log("Creating new profile with data:", { id: userId, email, full_name: fullName, role });
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
      })
      .select()
      .single();

    if (profileError) {
      console.error("❌ Error creating profile:", profileError);
      console.error("Profile error details:", JSON.stringify(profileError, null, 2));
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
        userId: userId,
        email: email,
        tempPassword: tempPassword,
        emailSent: false,
        message: "Team member created successfully. Auth is disabled - credentials are for reference only.",
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