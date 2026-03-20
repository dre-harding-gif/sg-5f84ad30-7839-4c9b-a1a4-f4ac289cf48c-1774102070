import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== INVITE USER FUNCTION START ===");
    
    // Get request body
    const { email, fullName, role } = await req.json();
    console.log("Received request:", { email, fullName, role });

    // Validate inputs
    if (!email || !fullName || !role) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: email, fullName, and role are required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Supabase URL:", supabaseUrl);
    console.log("Service key exists:", !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing Supabase credentials" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    console.log("Checking for existing user...");
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing user:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Database error while checking for existing user",
          details: checkError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (existingUser) {
      console.log("User already exists");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Team member with this email already exists" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    // Generate UUID and temporary password
    const userId = crypto.randomUUID();
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;
    
    console.log("Generated userId:", userId);
    console.log("Generated password (hidden)");

    // Create profile directly in profiles table
    console.log("Creating profile...");
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
      console.error("Error creating profile:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to create team member profile",
          details: profileError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Profile created successfully:", newProfile.id);
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
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred",
        stack: error.stack
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});