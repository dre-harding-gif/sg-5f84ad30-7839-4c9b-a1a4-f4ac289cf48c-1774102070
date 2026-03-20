import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  fullName: string;
  role: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== INVITE USER FUNCTION START ===");
    
    // Parse request body
    const body = await req.json();
    const { email, fullName, role } = body as InviteRequest;

    console.log("Request data:", { email, fullName, role });

    // Validate required fields
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

    // Get Supabase environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:", { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceKey 
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing Supabase credentials" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("Supabase admin client created");

    // Generate a UUID for the new profile
    const newUserId = crypto.randomUUID();
    console.log("Generated UUID:", newUserId);

    // Check if profile already exists with this email
    console.log("Checking for existing profile...");
    const { data: existingProfiles, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email);

    if (checkError) {
      console.error("Error checking existing profiles:", checkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Database error: ${checkError.message}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Existing profiles check result:", existingProfiles);

    if (existingProfiles && existingProfiles.length > 0) {
      console.error("Team member already exists:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Team member with this email already exists" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
      );
    }

    // Generate temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
    console.log("Generated temp password (hidden)");

    // Create profile directly (no auth.users entry needed since auth is disabled)
    console.log("Creating profile...");
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{
        id: newUserId,
        email: email,
        full_name: fullName,
        role: role
      }])
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create team member: ${profileError.message}`,
          details: profileError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Profile created successfully:", newUserId);

    // Return success response
    const response = {
      success: true,
      userId: newUserId,
      email: email,
      tempPassword: tempPassword,
      emailSent: false,
      message: "Team member created successfully. Auth is disabled - credentials are for reference only.",
    };

    console.log("=== SUCCESS - Returning response ===");

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("=== UNEXPECTED ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred",
        details: error.toString(),
        stack: error.stack
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});