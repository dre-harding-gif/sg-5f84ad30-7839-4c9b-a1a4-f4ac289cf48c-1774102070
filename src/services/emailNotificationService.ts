import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | 'job_assigned' 
  | 'job_updated' 
  | 'schedule_reminder' 
  | 'po_created' 
  | 'customer_message' 
  | 'time_log_reminder';

interface NotificationData {
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
}

export const emailNotificationService = {
  /**
   * Send a notification email to a team member
   */
  async sendNotification(
    type: NotificationType,
    recipientEmail: string,
    recipientName: string,
    data: NotificationData
  ) {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-team-notification', {
        body: {
          type,
          recipientEmail,
          recipientName,
          data,
        },
      });

      if (error) throw error;

      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send job assignment notification
   */
  async notifyJobAssignment(
    recipientEmail: string,
    recipientName: string,
    jobTitle: string,
    jobNumber: string,
    jobAddress: string,
    startDate: string,
    endDate: string,
    assignedBy?: string
  ) {
    return this.sendNotification('job_assigned', recipientEmail, recipientName, {
      jobTitle,
      jobNumber,
      jobAddress,
      startDate,
      endDate,
      assignedBy,
    });
  },

  /**
   * Send job update notification
   */
  async notifyJobUpdate(
    recipientEmail: string,
    recipientName: string,
    jobTitle: string,
    jobNumber: string,
    changes: string[]
  ) {
    return this.sendNotification('job_updated', recipientEmail, recipientName, {
      jobTitle,
      jobNumber,
      changes,
    });
  },

  /**
   * Send schedule reminder
   */
  async sendScheduleReminder(
    recipientEmail: string,
    recipientName: string,
    jobTitle: string,
    jobAddress: string,
    startDate: string
  ) {
    return this.sendNotification('schedule_reminder', recipientEmail, recipientName, {
      jobTitle,
      jobAddress,
      startDate,
    });
  },

  /**
   * Send P/O created notification
   */
  async notifyPOCreated(
    recipientEmail: string,
    recipientName: string,
    jobTitle: string,
    poNumber: string,
    poAmount: string
  ) {
    return this.sendNotification('po_created', recipientEmail, recipientName, {
      jobTitle,
      poNumber,
      poAmount,
    });
  },

  /**
   * Send customer message notification
   */
  async notifyCustomerMessage(
    recipientEmail: string,
    recipientName: string,
    jobTitle: string,
    jobNumber: string,
    customerName: string,
    message: string
  ) {
    return this.sendNotification('customer_message', recipientEmail, recipientName, {
      jobTitle,
      jobNumber,
      customerName,
      message,
    });
  },

  /**
   * Send time log reminder
   */
  async sendTimeLogReminder(
    recipientEmail: string,
    recipientName: string,
    jobTitle: string,
    jobNumber: string
  ) {
    return this.sendNotification('time_log_reminder', recipientEmail, recipientName, {
      jobTitle,
      jobNumber,
    });
  },

  /**
   * Send notification to multiple team members
   */
  async sendBulkNotification(
    type: NotificationType,
    recipients: Array<{ email: string; name: string }>,
    data: NotificationData
  ) {
    const promises = recipients.map(recipient =>
      this.sendNotification(type, recipient.email, recipient.name, data)
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: failed === 0,
      total: recipients.length,
      successful,
      failed,
    };
  },
};