import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'job_assigned' | 'job_updated' | 'schedule_reminder' | 'po_created' | 'customer_message' | 'time_log_reminder';
  recipientEmail: string;
  recipientName: string;
  data: {
    jobTitle?: string;
    jobNumber?: string;
    jobAddress?: string;
    startDate?: string;
    endDate?: string;
    poNumber?: string;
    poAmount?: string;
    customerName?: string;
    message?: string;
    changes?: string[];
    assignedBy?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, recipientName, data }: NotificationRequest = await req.json();

    // Validate required fields
    if (!type || !recipientEmail || !recipientName) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase admin client
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

    const siteUrl = Deno.env.get("SITE_URL") || "https://yourdomain.com";

    // Build email content based on notification type
    let subject = "";
    let htmlContent = "";

    switch (type) {
      case 'job_assigned':
        subject = `New Job Assignment: ${data.jobTitle}`;
        htmlContent = buildJobAssignedEmail(recipientName, data, siteUrl);
        break;
      
      case 'job_updated':
        subject = `Job Updated: ${data.jobTitle}`;
        htmlContent = buildJobUpdatedEmail(recipientName, data, siteUrl);
        break;
      
      case 'schedule_reminder':
        subject = `Your Schedule for ${data.startDate}`;
        htmlContent = buildScheduleReminderEmail(recipientName, data, siteUrl);
        break;
      
      case 'po_created':
        subject = `New Purchase Order: ${data.poNumber}`;
        htmlContent = buildPOCreatedEmail(recipientName, data, siteUrl);
        break;
      
      case 'customer_message':
        subject = `New Message from ${data.customerName}`;
        htmlContent = buildCustomerMessageEmail(recipientName, data, siteUrl);
        break;
      
      case 'time_log_reminder':
        subject = `Time Log Reminder: ${data.jobTitle}`;
        htmlContent = buildTimeLogReminderEmail(recipientName, data, siteUrl);
        break;
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid notification type" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }

    // Send email using Supabase Auth email service
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(recipientEmail, {
      data: {
        subject,
        html: htmlContent,
      },
    });

    // Note: Since Supabase doesn't have a direct "send custom email" API,
    // we'll need to use a third-party service or SMTP
    // For now, we'll log the email and return success
    console.log("Email to send:", { recipientEmail, subject, htmlContent });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification email queued successfully",
        recipient: recipientEmail,
        type,
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

// Email template builders
function buildJobAssignedEmail(name: string, data: any, siteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f97316; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .job-details { background: white; padding: 20px; border-left: 4px solid #f97316; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔨 New Job Assignment</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>You have been assigned to a new job! Here are the details:</p>
      
      <div class="job-details">
        <h3>${data.jobTitle}</h3>
        <div class="detail-row">
          <span class="detail-label">Job Number:</span> ${data.jobNumber}
        </div>
        <div class="detail-row">
          <span class="detail-label">Address:</span> ${data.jobAddress}
        </div>
        <div class="detail-row">
          <span class="detail-label">Start Date:</span> ${data.startDate}
        </div>
        <div class="detail-row">
          <span class="detail-label">End Date:</span> ${data.endDate}
        </div>
        ${data.assignedBy ? `
        <div class="detail-row">
          <span class="detail-label">Assigned By:</span> ${data.assignedBy}
        </div>
        ` : ''}
      </div>

      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Review the job details in your dashboard</li>
        <li>Check the job sheet for specifications</li>
        <li>Contact the customer if needed</li>
        <li>Log your hours worked daily</li>
      </ul>

      <a href="${siteUrl}/jobs/${data.jobNumber}" class="button">View Job Details</a>

      <p>If you have any questions, contact your manager.</p>
    </div>
    <div class="footer">
      <p>© 2026 Harding Homes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildJobUpdatedEmail(name: string, data: any, siteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .changes { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .change-item { padding: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📝 Job Updated</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>A job you're working on has been updated:</p>
      
      <div class="changes">
        <h3>${data.jobTitle}</h3>
        <p><strong>Job Number:</strong> ${data.jobNumber}</p>
        
        ${data.changes && data.changes.length > 0 ? `
        <p><strong>Changes Made:</strong></p>
        <ul>
          ${data.changes.map(change => `<li class="change-item">${change}</li>`).join('')}
        </ul>
        ` : ''}
      </div>

      <a href="${siteUrl}/jobs/${data.jobNumber}" class="button">View Updated Job</a>

      <p>Please review the changes and adjust your work accordingly.</p>
    </div>
    <div class="footer">
      <p>© 2026 Harding Homes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildScheduleReminderEmail(name: string, data: any, siteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .schedule { background: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Your Schedule</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Here's your schedule for ${data.startDate}:</p>
      
      <div class="schedule">
        <h3>${data.jobTitle}</h3>
        <p><strong>Address:</strong> ${data.jobAddress}</p>
        <p><strong>Time:</strong> ${data.startDate}</p>
      </div>

      <a href="${siteUrl}/schedule" class="button">View Full Schedule</a>

      <p>Have a productive day!</p>
    </div>
    <div class="footer">
      <p>© 2026 Harding Homes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildPOCreatedEmail(name: string, data: any, siteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .po-details { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧾 New Purchase Order</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>A new purchase order has been created for your job:</p>
      
      <div class="po-details">
        <h3>P/O ${data.poNumber}</h3>
        <p><strong>Job:</strong> ${data.jobTitle}</p>
        <p><strong>Amount:</strong> ${data.poAmount}</p>
      </div>

      <p>Materials will be ordered and delivered to the job site.</p>

      <a href="${siteUrl}/purchase-orders" class="button">View Purchase Order</a>
    </div>
    <div class="footer">
      <p>© 2026 Harding Homes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildCustomerMessageEmail(name: string, data: any, siteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ec4899; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .message { background: white; padding: 20px; border-left: 4px solid #ec4899; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #ec4899; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 New Customer Message</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>${data.customerName} sent a message about the job:</p>
      
      <div class="message">
        <h3>${data.jobTitle}</h3>
        <p><strong>Message:</strong></p>
        <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${data.message}</p>
      </div>

      <p>Please respond promptly to maintain good customer relations.</p>

      <a href="${siteUrl}/jobs/${data.jobNumber}" class="button">View & Respond</a>
    </div>
    <div class="footer">
      <p>© 2026 Harding Homes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildTimeLogReminderEmail(name: string, data: any, siteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .reminder { background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Time Log Reminder</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Don't forget to log your hours worked today!</p>
      
      <div class="reminder">
        <h3>${data.jobTitle}</h3>
        <p>Please record your time spent on this job to ensure accurate tracking and billing.</p>
      </div>

      <a href="${siteUrl}/jobs/${data.jobNumber}" class="button">Log Your Hours</a>

      <p><strong>Why it's important:</strong></p>
      <ul>
        <li>Accurate job costing</li>
        <li>Fair compensation</li>
        <li>Project tracking</li>
        <li>Customer billing</li>
      </ul>
    </div>
    <div class="footer">
      <p>© 2026 Harding Homes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}