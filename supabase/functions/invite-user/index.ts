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
  password?: string;
  resend?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email, fullName, role, resend = false }: InviteRequest = await req.json();

    console.log("Team member request:", { email, fullName, role, resend });

    // Validate required fields
    if (!email || !fullName || !role) {
      console.error("Missing required fields:", { email: !!email, fullName: !!fullName, role: !!role });
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

    // Generate temporary password (for reference, even if auth is disabled)
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;

    // Since auth is disabled, we'll just create a profile directly
    // Generate a UUID for the profile
    const newUserId = crypto.randomUUID();

    if (resend) {
      console.log("Resend not applicable - auth is disabled");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Resend functionality requires authentication to be enabled" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if profile already exists with this email
    const { data: existingProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email);

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

    // Create profile directly (no auth.users entry needed since auth is disabled)
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
      throw new Error(`Failed to create team member: ${profileError.message}`);
    }

    console.log("Team member created successfully:", newUserId);

    // Return success response
    const response = {
      success: true,
      userId: newUserId,
      email,
      tempPassword: tempPassword, // Return password for reference (even though auth is disabled)
      emailSent: false, // Email not sent since auth/SMTP is disabled
      message: "Team member created successfully. Auth is disabled - credentials are for reference only.",
    };

    console.log("Success response:", { ...response, tempPassword: "[REDACTED]" });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unexpected error in invite-user function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred",
        details: error.toString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});