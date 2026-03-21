import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      urlValue: supabaseUrl
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          error: "Missing environment variables",
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceKey
          }
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, newPassword } = await req.json();

    console.log("Request data:", { email, hasPassword: !!newPassword });

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: "email and newPassword are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // First, find the user by email
    console.log("Looking up user by email:", email);
    const { data: users, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();

    if (lookupError) {
      console.error("Error looking up users:", lookupError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to look up user",
          details: lookupError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: `No user found with email: ${email}`,
          suggestion: "Make sure the email address is correct"
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found user:", { id: user.id, email: user.email });

    // Reset password using admin API
    console.log("Attempting password reset for user:", user.id);
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    console.log("Admin API response:", { 
      success: !!data, 
      error: error?.message,
      errorDetails: error
    });

    if (error) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset successfully",
        user: { id: data.user.id, email: data.user.email }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});