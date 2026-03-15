import { supabase } from "@/integrations/supabase/client";

export interface NotificationTemplate {
  type: "email" | "sms";
  subject?: string;
  message: string;
}

export const notificationTemplates = {
  jobAccepted: {
    email: {
      subject: "Welcome to Harding Homes - Your Job Has Been Accepted!",
      message: `Hi {customerName},

Great news! We've accepted your project and are excited to get started.

Job Details:
- Job Number: {jobNumber}
- Project: {jobTitle}
- Start Date: {startDate}

We've created a customer portal where you can:
- Track job progress in real-time
- View photos and updates
- Raise questions or concerns
- Access warranties and documents

Portal Login:
Email: {customerEmail}
Password: {portalPassword}
Link: {portalLink}

Our team will be in touch soon to confirm the schedule.

Best regards,
Harding Homes Team`
    },
    sms: {
      message: "Hi {customerName}, your Harding Homes job ({jobTitle}) has been accepted! Check your email for portal login details. Thanks!"
    }
  },

  jobStarting: {
    email: {
      subject: "We're Starting Your Project Today!",
      message: `Hi {customerName},

Exciting news! Our team is starting work on your {jobTitle} today.

Team Assignment:
{teamMembers}

You can track our progress in real-time through your customer portal:
{portalLink}

We'll keep you updated with regular photos and progress reports.

Best regards,
Harding Homes Team`
    },
    sms: {
      message: "Hi {customerName}, Harding Homes team is starting your {jobTitle} today! Track progress at {portalLink}"
    }
  },

  onTheWay: {
    sms: {
      message: "Hi {customerName}, Harding Homes here. Our team is on the way to your property and will arrive in approximately 30 minutes."
    }
  },

  dailyUpdate: {
    email: {
      subject: "Daily Progress Update - {jobTitle}",
      message: `Hi {customerName},

Here's today's progress update for your {jobTitle}:

Work Completed Today:
{workCompleted}

Photos:
We've uploaded {photoCount} new progress photos to your portal.

Next Steps:
{nextSteps}

View all updates in your portal: {portalLink}

Best regards,
Harding Homes Team`
    }
  },

  jobCompleted: {
    email: {
      subject: "Your Project is Complete! 🎉",
      message: `Hi {customerName},

Fantastic news! We've completed your {jobTitle}.

Final Details:
- Completion Date: {completionDate}
- Final Photos: Available in your portal
- Warranty Documents: Ready for download
- Final Invoice: {invoiceNumber}

Please log in to your portal to:
- Review final before/after photos
- Download warranty documents
- View and pay your final invoice
- Leave us a review (we'd really appreciate it!)

Portal Link: {portalLink}

It's been a pleasure working with you. If you need anything in the future, don't hesitate to reach out.

Best regards,
Harding Homes Team`
    },
    sms: {
      message: "Hi {customerName}, great news! Your {jobTitle} is complete. Check your portal for final photos, warranty docs & invoice: {portalLink}"
    }
  },

  paymentReminder: {
    email: {
      subject: "Payment Reminder - Invoice {invoiceNumber}",
      message: `Hi {customerName},

This is a friendly reminder about your outstanding invoice for {jobTitle}.

Invoice Details:
- Invoice Number: {invoiceNumber}
- Amount Due: £{amountDue}
- Due Date: {dueDate}

You can view and pay your invoice through your customer portal:
{portalLink}

Payment Methods:
- Bank Transfer
- Card Payment (via portal)

If you've already paid, please disregard this message.

Best regards,
Harding Homes Team`
    },
    sms: {
      message: "Payment reminder: Invoice {invoiceNumber} for £{amountDue} is due on {dueDate}. Pay via {portalLink}"
    }
  },

  warrantyExpiring: {
    email: {
      subject: "Your Warranty is Expiring Soon",
      message: `Hi {customerName},

This is a courtesy reminder that your warranty for {jobTitle} (completed on {completionDate}) will expire on {warrantyExpiry}.

If you've experienced any issues covered by the warranty, please contact us before the expiry date.

We'd also be happy to discuss any maintenance or new projects you might be considering.

Best regards,
Harding Homes Team`
    }
  }
};

export async function sendNotification(
  customerId: string,
  templateKey: keyof typeof notificationTemplates,
  variables: Record<string, string>,
  type: "email" | "sms" | "both" = "both"
) {
  try {
    // Get customer details
    const { data } = await supabase
      .from("customers" as any)
      .select("name, email, phone")
      .eq("id", customerId)
      .single();

    const customer = data as any;
    if (!customer) throw new Error("Customer not found");

    const template = notificationTemplates[templateKey] as any;
    const results = { email: false, sms: false };

    // Replace variables in message
    const replaceVariables = (text: string) => {
      let result = text;
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, "g"), value);
      });
      result = result.replace(/{customerName}/g, customer.name);
      result = result.replace(/{customerEmail}/g, customer.email);
      return result;
    };

    // Send Email
    if ((type === "email" || type === "both") && template.email) {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // For now, we'll log to console and save to notifications table
      const emailContent = {
        to: customer.email,
        subject: replaceVariables(template.email.subject || ""),
        body: replaceVariables(template.email.message)
      };

      console.log("Email to send:", emailContent);

      // Save notification record
      await supabase.from("notifications" as any).insert({
        customer_id: customerId,
        type: "email",
        template: templateKey,
        subject: emailContent.subject,
        message: emailContent.body,
        status: "sent",
        sent_at: new Date().toISOString()
      });

      results.email = true;
    }

    // Send SMS
    if ((type === "sms" || type === "both") && template.sms && customer.phone) {
      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      const smsContent = {
        to: customer.phone,
        message: replaceVariables(template.sms.message)
      };

      console.log("SMS to send:", smsContent);

      // Save notification record
      await supabase.from("notifications" as any).insert({
        customer_id: customerId,
        type: "sms",
        template: templateKey,
        message: smsContent.message,
        status: "sent",
        sent_at: new Date().toISOString()
      });

      results.sms = true;
    }

    return results;
  } catch (error) {
    console.error("Notification error:", error);
    throw error;
  }
}

// Helper function to send custom notification
export async function sendCustomNotification(
  customerId: string,
  type: "email" | "sms",
  message: string,
  subject?: string
) {
  try {
    const { data } = await supabase
      .from("customers" as any)
      .select("name, email, phone")
      .eq("id", customerId)
      .single();

    const customer = data as any;
    if (!customer) throw new Error("Customer not found");

    if (type === "email") {
      console.log("Custom email:", { to: customer.email, subject, message });
    } else {
      console.log("Custom SMS:", { to: customer.phone, message });
    }

    await supabase.from("notifications" as any).insert({
      customer_id: customerId,
      type,
      subject: subject || null,
      message,
      status: "sent",
      sent_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error("Custom notification error:", error);
    throw error;
  }
}