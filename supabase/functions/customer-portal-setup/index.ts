import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerId, customerEmail, customerName, jobId } = await req.json();

    if (!customerId || !customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Generate secure temporary password
    const tempPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    // Check if customer already has an auth account
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const customerExists = existingUser?.users?.find(u => u.email === customerEmail);

    let authUserId;

    if (customerExists) {
      authUserId = customerExists.id;
    } else {
      // Create new auth account for customer
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
          is_customer: true,
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        return new Response(
          JSON.stringify({ success: false, error: authError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      authUserId = authData.user.id;
    }

    // Update customer record with auth_user_id
    const { error: updateError } = await supabaseAdmin
      .from("customers")
      .update({ auth_user_id: authUserId })
      .eq("id", customerId);

    if (updateError) {
      console.error("Customer update error:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: customerEmail,
        tempPassword: customerExists ? null : tempPassword,
        isNewAccount: !customerExists,
        portalUrl: `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "vercel.app") || ""}/portal/login`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});