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
    const { email, fullName, role, password, resend = false }: InviteRequest = await req.json();

    console.log("Invite request:", { email, fullName, role, resend });

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

    // Generate temporary password if not provided
    const tempPassword = password || `Temp${Math.random().toString(36).slice(-8)}!`;

    let userId: string;
    let emailSent = false;
    let isNewUser = false;

    if (resend) {
      console.log("Resending invitation for existing user:", email);
      
      // Find existing user by email
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error("Error listing users:", listError);
        throw new Error(`Failed to list users: ${listError.message}`);
      }

      const existingUser = users?.find(u => u.email === email);
      
      if (!existingUser) {
        console.error("User not found for resend:", email);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "User not found. Please create the user first." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      userId = existingUser.id;
      console.log("Found existing user:", userId);

      // Update user password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: tempPassword }
      );

      if (updateError) {
        console.error("Error updating user password:", updateError);
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      console.log("Password updated successfully");

      // Try to send password recovery email
      try {
        const { error: recoveryError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
          redirectTo: `${Deno.env.get("SITE_URL") || "https://yourdomain.com"}/reset-password`,
        });

        if (recoveryError) {
          console.warn("Password recovery email failed (SMTP may not be configured):", recoveryError.message);
          emailSent = false;
        } else {
          console.log("Password recovery email sent successfully");
          emailSent = true;
        }
      } catch (emailError) {
        console.warn("Email sending failed:", emailError);
        emailSent = false;
      }

    } else {
      console.log("Creating new user:", email);
      isNewUser = true;

      // Check if user already exists
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error("Error listing users:", listError);
        throw new Error(`Failed to list users: ${listError.message}`);
      }

      const existingUser = users?.find(u => u.email === email);
      
      if (existingUser) {
        console.error("User already exists:", email);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "User with this email already exists. Use 'Resend Invite' instead." 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
        );
      }

      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      if (!newUser.user) {
        console.error("User creation returned no user object");
        throw new Error("User creation failed: No user object returned");
      }

      userId = newUser.user.id;
      console.log("User created successfully:", userId);

      // Update profile with role
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Don't fail the whole operation if profile update fails
        console.warn("Profile update failed, but user was created successfully");
      } else {
        console.log("Profile updated with role:", role);
      }

      // Try to send welcome email via password recovery
      try {
        const { error: recoveryError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
          redirectTo: `${Deno.env.get("SITE_URL") || "https://yourdomain.com"}/reset-password`,
        });

        if (recoveryError) {
          console.warn("Welcome email failed (SMTP may not be configured):", recoveryError.message);
          emailSent = false;
        } else {
          console.log("Welcome email sent successfully");
          emailSent = true;
        }
      } catch (emailError) {
        console.warn("Email sending failed:", emailError);
        emailSent = false;
      }
    }

    // Return success response
    const response = {
      success: true,
      userId,
      email,
      tempPassword: emailSent ? undefined : tempPassword, // Only return password if email wasn't sent
      emailSent,
      message: emailSent 
        ? `${resend ? 'Invitation resent' : 'Invitation sent'} successfully via email`
        : `User ${resend ? 'updated' : 'created'} successfully. Share credentials manually.`,
    };

    console.log("Success response:", { ...response, tempPassword: response.tempPassword ? "[REDACTED]" : undefined });

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