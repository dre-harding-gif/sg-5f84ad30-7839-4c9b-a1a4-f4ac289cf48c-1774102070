# 📧 Team Email Notifications Guide

## 🎯 **OVERVIEW**

Your Harding Homes system now includes automated email notifications to keep your team informed about job assignments, updates, schedules, and customer communications.

---

## 📨 **NOTIFICATION TYPES**

### **1. Job Assignment Notifications 🔨**

**When it's sent:**
- A team member is assigned to a new job
- Job is created with team member assigned
- Team member is added to an existing job

**Email includes:**
- Job title and number
- Job address
- Start and end dates
- Who assigned them
- Link to view job details
- Next steps checklist

**Example:**
```
Subject: New Job Assignment: Kitchen Extension - Smith Residence

Hi Mike,

You have been assigned to a new job!

Job Details:
- Title: Kitchen Extension - Smith Residence
- Job Number: JOB-2024-001
- Address: 123 High Street, Manchester
- Start: 14 Jan 2026
- End: 28 Jan 2026
- Assigned By: John (Manager)

[View Job Details Button]
```

---

### **2. Job Update Notifications 📝**

**When it's sent:**
- Job details are modified
- Job status changes
- Schedule is updated
- Materials list is changed

**Email includes:**
- Job title and number
- List of changes made
- Link to view updated job
- Action items if needed

**Example:**
```
Subject: Job Updated: Kitchen Extension - Smith Residence

Hi Mike,

A job you're working on has been updated:

Changes Made:
• End date extended to 31 Jan 2026
• Added new material requirement: Insulation
• Status changed to "In Progress"

[View Updated Job Button]
```

---

### **3. Schedule Reminders 📅**

**When it's sent:**
- Daily at 6 AM for today's jobs
- Weekly on Sundays for upcoming week
- Custom reminders for important dates

**Email includes:**
- Jobs scheduled for the day/week
- Addresses and times
- Customer contact info
- Link to full schedule

**Example:**
```
Subject: Your Schedule for 14 Jan 2026

Hi Mike,

Here's your schedule for today:

Job: Kitchen Extension - Smith Residence
Address: 123 High Street, Manchester
Time: 8:00 AM - 5:00 PM

[View Full Schedule Button]
```

---

### **4. Purchase Order Notifications 🧾**

**When it's sent:**
- New P/O is generated for a job
- P/O status is updated to "Delivered"
- Materials are ready for collection

**Email includes:**
- P/O number and amount
- Job it's for
- Supplier information
- Delivery status
- Link to view P/O details

**Example:**
```
Subject: New Purchase Order: PO-000045

Hi Mike,

A new purchase order has been created for your job:

P/O Number: PO-000045
Job: Kitchen Extension - Smith Residence
Amount: £2,450.00
Supplier: Travis Perkins

Materials will be delivered to the job site.

[View Purchase Order Button]
```

---

### **5. Customer Message Notifications 💬**

**When it's sent:**
- Customer sends message via portal
- Customer raises concern
- Customer approves/rejects changes

**Email includes:**
- Customer name
- Job title
- Message content
- Link to respond
- Priority level

**Example:**
```
Subject: New Message from John Smith

Hi Mike,

John Smith sent a message about the job:

Job: Kitchen Extension - Smith Residence

Message:
"Can we adjust the cabinet placement slightly? 
I'd like to discuss the layout tomorrow morning."

Please respond promptly to maintain good customer relations.

[View & Respond Button]
```

---

### **6. Time Log Reminders ⏰**

**When it's sent:**
- Daily at 5 PM if no hours logged
- Weekly summary request
- End of job reminder

**Email includes:**
- Jobs worked on today
- Reminder to log hours
- Link to time logging
- Importance explanation

**Example:**
```
Subject: Time Log Reminder: Kitchen Extension

Hi Mike,

Don't forget to log your hours worked today!

Job: Kitchen Extension - Smith Residence

Please record your time spent on this job to ensure 
accurate tracking and billing.

[Log Your Hours Button]

Why it's important:
• Accurate job costing
• Fair compensation
• Project tracking
• Customer billing
```

---

## 🔧 **SETUP INSTRUCTIONS**

### **Step 1: Deploy Email Function**

The email notification system uses a Supabase Edge Function. It's already created but needs to be deployed:

```bash
# The function is created at:
supabase/functions/send-team-notification/index.ts

# It will be automatically deployed when you use it
```

### **Step 2: Configure SMTP (Required)**

Email notifications require SMTP configuration. Follow the main Email Setup Guide:

**Quick Setup:**
1. Go to Supabase Dashboard
2. Navigate to: **Authentication** → **SMTP Settings**
3. Enable Custom SMTP
4. Use Gmail, SendGrid, or Mailgun (see EMAIL_SETUP_GUIDE.md)
5. Test with a user invitation

### **Step 3: Set Site URL**

Make sure your site URL is configured:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set Site URL to your production domain
3. Add redirect URLs for email links

### **Step 4: Enable Notifications (Per User)**

Users can control which notifications they receive:

1. Go to **Settings** → **Notifications**
2. Toggle notification types:
   - ☑️ Job Assignments
   - ☑️ Job Updates
   - ☑️ Schedule Reminders
   - ☑️ Purchase Orders
   - ☑️ Customer Messages
   - ☑️ Time Log Reminders
3. Choose email frequency:
   - Instant (as they happen)
   - Daily digest (once per day)
   - Weekly summary (once per week)

---

## 💻 **HOW TO USE IN CODE**

### **Import the Service:**

```typescript
import { emailNotificationService } from "@/services/emailNotificationService";
```

### **Example 1: Notify Job Assignment**

```typescript
// When assigning a team member to a job
await emailNotificationService.notifyJobAssignment(
  "mike@hardinghomes.co.uk",     // Recipient email
  "Mike Jones",                   // Recipient name
  "Kitchen Extension",            // Job title
  "JOB-2024-001",                // Job number
  "123 High Street, Manchester",  // Job address
  "14 Jan 2026",                 // Start date
  "28 Jan 2026",                 // End date
  "John (Manager)"               // Who assigned them
);
```

### **Example 2: Notify Job Update**

```typescript
// When job details are updated
await emailNotificationService.notifyJobUpdate(
  "mike@hardinghomes.co.uk",
  "Mike Jones",
  "Kitchen Extension",
  "JOB-2024-001",
  [
    "End date extended to 31 Jan 2026",
    "Added new material requirement: Insulation",
    "Status changed to In Progress"
  ]
);
```

### **Example 3: Send Schedule Reminder**

```typescript
// Daily schedule reminder
await emailNotificationService.sendScheduleReminder(
  "mike@hardinghomes.co.uk",
  "Mike Jones",
  "Kitchen Extension - Smith Residence",
  "123 High Street, Manchester",
  "14 Jan 2026"
);
```

### **Example 4: Notify P/O Created**

```typescript
// When new P/O is generated
await emailNotificationService.notifyPOCreated(
  "mike@hardinghomes.co.uk",
  "Mike Jones",
  "Kitchen Extension",
  "PO-000045",
  "£2,450.00"
);
```

### **Example 5: Notify Customer Message**

```typescript
// When customer sends message
await emailNotificationService.notifyCustomerMessage(
  "mike@hardinghomes.co.uk",
  "Mike Jones",
  "Kitchen Extension",
  "JOB-2024-001",
  "John Smith",
  "Can we adjust the cabinet placement slightly?"
);
```

### **Example 6: Send Time Log Reminder**

```typescript
// Daily time log reminder
await emailNotificationService.sendTimeLogReminder(
  "mike@hardinghomes.co.uk",
  "Mike Jones",
  "Kitchen Extension",
  "JOB-2024-001"
);
```

### **Example 7: Bulk Notifications**

```typescript
// Notify multiple team members
const teamMembers = [
  { email: "mike@hardinghomes.co.uk", name: "Mike Jones" },
  { email: "sarah@hardinghomes.co.uk", name: "Sarah Williams" },
  { email: "tom@hardinghomes.co.uk", name: "Tom Brown" }
];

await emailNotificationService.sendBulkNotification(
  'job_updated',
  teamMembers,
  {
    jobTitle: "Kitchen Extension",
    jobNumber: "JOB-2024-001",
    changes: ["Materials delivered", "Ready to start"]
  }
);
```

---

## 🎨 **EMAIL TEMPLATES**

All email templates are professionally designed with:

✅ **Company branding** (Harding Homes colors and logo)
✅ **Mobile responsive** design
✅ **Clear call-to-action** buttons
✅ **Professional formatting**
✅ **Helpful content** and next steps

**Template Colors:**
- 🔨 Job Assigned: Orange (#f97316)
- 📝 Job Updated: Blue (#3b82f6)
- 📅 Schedule: Purple (#8b5cf6)
- 🧾 Purchase Order: Green (#10b981)
- 💬 Customer Message: Pink (#ec4899)
- ⏰ Time Log: Amber (#f59e0b)

---

## 📊 **AUTOMATIC TRIGGERS**

### **Jobs Page:**
```typescript
// Automatically send email when job is created with team assignment
if (assignedTeamMember) {
  await emailNotificationService.notifyJobAssignment(
    assignedTeamMember.email,
    assignedTeamMember.name,
    jobData.title,
    jobData.job_number,
    jobData.address,
    jobData.start_date,
    jobData.end_date,
    currentUser.name
  );
}
```

### **Purchase Orders:**
```typescript
// Automatically send email when P/O is generated
await emailNotificationService.notifyPOCreated(
  assignedTeamMember.email,
  assignedTeamMember.name,
  jobData.title,
  poNumber,
  totalAmount
);
```

### **Customer Portal:**
```typescript
// Automatically send email when customer sends message
await emailNotificationService.notifyCustomerMessage(
  assignedTeamMember.email,
  assignedTeamMember.name,
  jobData.title,
  jobData.job_number,
  customerName,
  messageContent
);
```

---

## 🐛 **TROUBLESHOOTING**

### **Problem: Emails Not Being Sent**

**Check 1: SMTP Configuration**
- Verify SMTP is configured in Supabase Dashboard
- Test with user invitation first
- Check credentials are correct

**Check 2: Edge Function Deployed**
- Function should auto-deploy on first use
- Check Supabase Dashboard → Edge Functions
- Look for "send-team-notification" function

**Check 3: Console Errors**
- Open browser console (F12)
- Look for error messages when triggering notifications
- Check network tab for failed requests

### **Problem: Emails Going to Spam**

**Solutions:**
1. Configure SPF and DKIM records
2. Use professional email provider (SendGrid recommended)
3. Don't use Supabase default email service for production
4. Verify domain ownership with email provider

### **Problem: Wrong Email Content**

**Check:**
- Verify data being passed to notification service
- Check template variables match data structure
- Review email template in Edge Function

---

## ✅ **BEST PRACTICES**

### **1. Don't Spam Your Team**
```
❌ Bad: Send email for every tiny change
✅ Good: Batch minor updates into daily digest
✅ Good: Only send important changes immediately
```

### **2. Provide Context**
```
❌ Bad: "Job updated"
✅ Good: "Kitchen Extension - End date extended to 31 Jan"
```

### **3. Include Action Items**
```
❌ Bad: Just notify about change
✅ Good: Tell them what they need to do next
```

### **4. Test Before Going Live**
```
1. Send test emails to yourself first
2. Verify formatting looks good
3. Check all links work
4. Test on mobile devices
5. Then enable for team
```

### **5. Respect Notification Preferences**
```typescript
// Always check if user wants this notification type
const userPrefs = await getUserNotificationPreferences(userId);

if (userPrefs.job_assignments_email) {
  await emailNotificationService.notifyJobAssignment(...);
}
```

---

## 🔐 **SECURITY & PRIVACY**

### **Data Protection:**
- ✅ Emails sent over encrypted connection (TLS)
- ✅ No sensitive data in email subject lines
- ✅ Links expire after 7 days
- ✅ Email addresses never shared with third parties

### **Access Control:**
- ✅ Only assigned team members receive job emails
- ✅ Managers can't see other teams' notifications
- ✅ Users can unsubscribe from specific types
- ✅ All emails logged for audit trail

---

## 📞 **SUPPORT**

If you need help with email notifications:

1. **Check this guide** first
2. **Review EMAIL_SETUP_GUIDE.md** for SMTP setup
3. **Test with simple example** (job assignment)
4. **Check browser console** for errors
5. **Verify SMTP configuration** in Supabase
6. **Contact support** if still stuck

---

## 🚀 **QUICK START CHECKLIST**

- [ ] SMTP configured in Supabase Dashboard
- [ ] Site URL set correctly
- [ ] Edge Function deployed (auto-deploys on first use)
- [ ] Email service imported in code
- [ ] Test email sent successfully
- [ ] Email templates look good
- [ ] Links in emails work
- [ ] Team members notified about new system
- [ ] Notification preferences configured
- [ ] Monitoring enabled for failed sends

---

**Last Updated:** 2026-03-19
**Version:** 1.0
**System:** Harding Homes Team Email Notifications