import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 Admin reset password function called");

    // Get request body
    const { email, newPassword } = await req.json();
    console.log("📧 Email:", email);
    console.log("🔐 Password length:", newPassword?.length);

    // Validate inputs
    if (!email || !newPassword) {
      console.error("❌ Missing email or password");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email and password are required" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("🔧 Supabase URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
    console.log("🔑 Service Role Key:", serviceRoleKey ? "✅ Set" : "❌ Missing");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("❌ Missing environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing Supabase credentials" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    console.log("🔧 Creating Supabase admin client...");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Look up user by email
    console.log("🔍 Looking up user by email...");
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to list users: ${listError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error("❌ User not found:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `User not found: ${email}` 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ User found:", user.id);

    // Update user password
    console.log("🔄 Updating password...");
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("❌ Error updating password:", updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to update password: ${updateError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Password updated successfully!");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Password reset successful",
        user: {
          id: user.id,
          email: user.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err.message || "An unexpected error occurred",
        details: err.toString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});