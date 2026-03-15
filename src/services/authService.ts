import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the current redirect URL based on the environment
 */
function getRedirectUrl(path: string = ""): string {
  if (typeof window === "undefined") return "";
  
  const { protocol, host } = window.location;
  return `${protocol}//${host}${path}`;
}

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl("/"),
        data: metadata,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send password recovery email
   */
  async sendPasswordRecoveryEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl("/reset-password"),
    });

    if (error) throw error;
    return data;
  },

  /**
   * Update user password (must be called after password recovery)
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get the current user session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get the current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Invite a new user with email and assign role
   * Creates the user account and sends invitation email
   */
  async inviteUser(email: string, fullName: string, role: string) {
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      // Create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName,
        },
      });

      if (authError) throw authError;

      // Update the user's profile with their role
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          role,
          full_name: fullName,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Send invitation email via Edge Function
      const appUrl = typeof window !== "undefined" ? window.location.origin : "";
      const companyName = "Harding Homes"; // You can make this dynamic from settings
      
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            to: email,
            fullName,
            tempPassword,
            role,
            appUrl,
            companyName,
          },
        });

        if (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't throw - user was created successfully, just email failed
        }

        return {
          success: true,
          email,
          tempPassword,
          userId: authData.user.id,
          emailSent: !emailError,
          emailDetails: emailData,
        };
      } catch (emailErr) {
        console.error("Error invoking email function:", emailErr);
        // Return success anyway - user was created
        return {
          success: true,
          email,
          tempPassword,
          userId: authData.user.id,
          emailSent: false,
          emailError: "Email service unavailable",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl("/"),
      },
    });

    if (error) throw error;
    return data;
  },
};
