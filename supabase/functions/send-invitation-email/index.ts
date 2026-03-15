import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface InvitationEmailRequest {
  to: string;
  fullName: string;
  tempPassword: string;
  role: string;
  appUrl: string;
  companyName: string;
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { to, fullName, tempPassword, role, appUrl, companyName }: InvitationEmailRequest = await req.json();

    // Validate required fields
    if (!to || !fullName || !tempPassword || !role || !appUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create email HTML template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName || "the Team"}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to ${companyName || "the Team"}! 🎉</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi <strong>${fullName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Your account has been created! You've been assigned as <strong>${role}</strong> and can now access our job management system.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #333333; font-size: 18px; font-weight: 600;">Your Login Credentials</h2>
                    
                    <p style="margin: 0 0 8px; color: #666666; font-size: 14px;">
                      <strong style="color: #333333;">Email:</strong><br>
                      <span style="font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">${to}</span>
                    </p>
                    
                    <p style="margin: 16px 0 0; color: #666666; font-size: 14px;">
                      <strong style="color: #333333;">Temporary Password:</strong><br>
                      <span style="font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">${tempPassword}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Important:</strong> Please change your password immediately after logging in for the first time. Go to <strong>Settings → Security</strong> to update your password.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Access the App</a>
                  </td>
                </tr>
              </table>

              <!-- Getting Started -->
              <h2 style="margin: 30px 0 16px; color: #333333; font-size: 18px; font-weight: 600;">Getting Started</h2>
              
              <ol style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                <li>Click the "Access the App" button above</li>
                <li>Sign in with your email and temporary password</li>
                <li>Change your password in Settings</li>
                <li>Install the app on your phone (tap "Add to Home Screen" in Safari/Chrome)</li>
                <li>Start managing your jobs!</li>
              </ol>

              <!-- Install Instructions -->
              <h3 style="margin: 24px 0 12px; color: #333333; font-size: 16px; font-weight: 600;">📱 Install on Your Phone</h3>
              
              <p style="margin: 0 0 12px; color: #666666; font-size: 14px; line-height: 1.6;">
                <strong>iPhone (Safari):</strong> Tap Share → Add to Home Screen
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                <strong>Android (Chrome):</strong> Tap Menu (⋮) → Add to Home Screen
              </p>

              <!-- Support -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 0; padding-top: 30px; border-top: 1px solid #e9ecef;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      Need help? Contact your manager or check the Setup Instructions in the app settings.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated message from ${companyName || "your job management system"}.<br>
                App URL: <a href="${appUrl}" style="color: #667eea; text-decoration: none;">${appUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Plain text version
    const emailText = `
Welcome to ${companyName || "the Team"}!

Hi ${fullName},

Your account has been created! You've been assigned as ${role} and can now access our job management system.

YOUR LOGIN CREDENTIALS:
Email: ${to}
Temporary Password: ${tempPassword}

⚠️ IMPORTANT: Please change your password immediately after logging in for the first time.
Go to Settings → Security to update your password.

GETTING STARTED:
1. Visit: ${appUrl}
2. Sign in with your email and temporary password
3. Change your password in Settings
4. Install the app on your phone (tap "Add to Home Screen" in Safari/Chrome)
5. Start managing your jobs!

INSTALL ON YOUR PHONE:
- iPhone (Safari): Tap Share → Add to Home Screen
- Android (Chrome): Tap Menu (⋮) → Add to Home Screen

Need help? Contact your manager or check the Setup Instructions in the app settings.

---
This is an automated message from ${companyName || "your job management system"}.
App URL: ${appUrl}
    `;

    // If Resend API key is configured, use Resend
    if (RESEND_API_KEY) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${companyName || "Job Management"} <onboarding@resend.dev>`,
          to: [to],
          subject: `Welcome to ${companyName || "the Team"} - Your Account is Ready!`,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error("Resend API error:", error);
        throw new Error(`Failed to send email via Resend: ${error}`);
      }

      const result = await resendResponse.json();
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Invitation email sent successfully",
        emailId: result.id,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Fallback: Return email content for manual sending
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email content generated (no email service configured)",
        emailPreview: {
          to,
          subject: `Welcome to ${companyName || "the Team"} - Your Account is Ready!`,
          html: emailHtml,
          text: emailText,
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("Error sending invitation email:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to send invitation email",
      details: error.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});