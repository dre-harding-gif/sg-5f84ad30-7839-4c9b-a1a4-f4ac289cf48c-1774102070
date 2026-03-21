import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("🚀 Test function called!");
    
    const { email, newPassword } = await req.json();
    
    console.log("📧 Email received:", email);
    console.log("🔐 Password length:", newPassword?.length);
    
    // Check environment variables
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    
    console.log("🔑 Service role key exists:", !!serviceRoleKey);
    console.log("🌐 Supabase URL:", supabaseUrl);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Test function working!",
        receivedEmail: email,
        passwordLength: newPassword?.length,
        hasServiceKey: !!serviceRoleKey,
        supabaseUrl: supabaseUrl
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error: any) {
    console.error("❌ Error in test function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 200, // Return 200 so we can see the error
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});