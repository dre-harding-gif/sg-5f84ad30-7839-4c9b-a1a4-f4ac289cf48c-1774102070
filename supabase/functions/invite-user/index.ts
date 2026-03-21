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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Received request body:", body);

    const { email, fullName, role, phone, resend } = body;

    if (!email || !fullName || !role) {
      console.error("Missing required fields:", { email, fullName, role });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email, full name, and role are required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    let userId: string;
    let tempPassword = "";
    let emailSent = false;

    if (existingProfile) {
      // User exists - send password reset
      userId = existingProfile.id;
      console.log("User exists, sending password reset:", email);
      
      // Update profile with new details
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // Try to send password reset email
      try {
        const { error: resetError } = await supabase.auth.admin.inviteUserByEmail(email);
        
        if (resetError) {
          console.error("Password reset error:", resetError);
          // SMTP might not be configured - generate temp password
          tempPassword = generatePassword();
          
          // Update the user's password directly
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: tempPassword }
          );
          
          if (updateError) {
            console.error("Failed to update password:", updateError);
          }
        } else {
          emailSent = true;
          console.log("Password reset email sent successfully");
        }
      } catch (err) {
        console.error("Error sending reset email:", err);
        tempPassword = generatePassword();
      }

    } else {
      // Create new user
      console.log("Creating new user:", email);
      tempPassword = generatePassword();

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
        },
      });

      if (authError) {
        console.error("Auth user creation error:", authError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to create user account", 
            details: authError.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      userId = authUser.user!.id;

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email,
        full_name: fullName,
        role,
        phone: phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Rollback: delete auth user
        await supabase.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Failed to create user profile", 
            details: profileError.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("User created successfully:", userId);
    }

    // Prepare success response
    const response = {
      success: true,
      userId,
      email,
      tempPassword: emailSent ? null : tempPassword,
      emailSent,
      message: emailSent 
        ? "Invitation email sent successfully!" 
        : "User created. Share the temporary password manually (SMTP not configured)."
    };

    console.log("Returning response:", { ...response, tempPassword: response.tempPassword ? "[REDACTED]" : null });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
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