import { supabase } from "@/integrations/supabase/client";

interface CreateNotificationParams {
  profileId: string;
  title: string;
  message: string;
  type: "job_update" | "new_lead" | "payment" | "message" | "system";
  link?: string;
}

export async function createNotification({
  profileId,
  title,
  message,
  type,
  link,
}: CreateNotificationParams) {
  try {
    const { error } = await supabase
      .from("notifications" as any)
      .insert({
        profile_id: profileId,
        title,
        message,
        type,
        link,
        read: false,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

// Helper to notify all admins/managers
export async function notifyAdmins(
  title: string,
  message: string,
  type: "job_update" | "new_lead" | "payment" | "message" | "system",
  link?: string
) {
  try {
    // Get all admin and manager users
    const { data: profiles } = await supabase
      .from("profiles" as any)
      .select("id, role")
      .in("role", ["admin", "manager"]);

    if (!profiles || profiles.length === 0) return;

    // Create notification for each admin/manager
    const notifications = profiles.map((profile: any) => ({
      profile_id: profile.id,
      title,
      message,
      type,
      link,
      read: false,
    }));

    await supabase.from("notifications" as any).insert(notifications);
    return true;
  } catch (error) {
    console.error("Error notifying admins:", error);
    return false;
  }
}

// Helper to notify specific user
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: "job_update" | "new_lead" | "payment" | "message" | "system",
  link?: string
) {
  return createNotification({
    profileId: userId,
    title,
    message,
    type,
    link,
  });
}

// Example usage functions
export async function notifyNewLead(leadId: string, customerName: string) {
  return notifyAdmins(
    "New Lead Received",
    `New enquiry from ${customerName}`,
    "new_lead",
    `/leads?highlight=${leadId}`
  );
}

export async function notifyJobUpdate(jobId: string, jobTitle: string, updateMessage: string) {
  return notifyAdmins(
    "Job Update",
    `${jobTitle}: ${updateMessage}`,
    "job_update",
    `/jobs/${jobId}`
  );
}

export async function notifyPaymentReceived(jobId: string, amount: number) {
  return notifyAdmins(
    "Payment Received",
    `Payment of £${amount.toFixed(2)} received`,
    "payment",
    `/jobs/${jobId}`
  );
}