# 📧 Email Setup Guide for Team Invitations

## 🚨 **CRITICAL: Email Configuration Required**

For automatic team invitation emails to work, you must configure email settings in your Supabase Dashboard.

---

## 📋 **SETUP STEPS:**

### **Step 1: Access Supabase Dashboard**
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**

### **Step 2: Configure SMTP Settings (Recommended)**

**Why SMTP?** 
- ✅ Professional "from" address (e.g., noreply@hardinghomes.co.uk)
- ✅ Better deliverability
- ✅ Custom branding
- ✅ No "via Supabase" warnings

**SMTP Providers (Choose One):**

#### **Option A: Gmail (Free, Easy Setup)**
1. Go to: **Project Settings** → **Authentication** → **SMTP Settings**
2. Click **Enable Custom SMTP**
3. Fill in:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [App Password - NOT your Gmail password]
   ```

**Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Copy the 16-character password
4. Paste into Supabase SMTP Password field

#### **Option B: SendGrid (Free Tier Available)**
1. Sign up: https://sendgrid.com
2. Create API Key
3. In Supabase SMTP Settings:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   ```

#### **Option C: Mailgun (Developer Plan)**
1. Sign up: https://www.mailgun.com
2. Get SMTP credentials
3. In Supabase SMTP Settings:
   ```
   Host: smtp.mailgun.org
   Port: 587
   Username: [Your Mailgun username]
   Password: [Your Mailgun password]
   ```

#### **Option D: Use Supabase Default (Quick Start)**
- ⚠️ Shows "via Supabase" in emails
- ⚠️ May go to spam
- ✅ Zero configuration needed
- ✅ Works immediately for testing

### **Step 3: Customize Email Template**

Navigate to: **Authentication** → **Email Templates** → **Invite user**

**Default Template:**
```html
<h2>You have been invited</h2>
<p>You have been invited to create a user on {{ .SiteURL }}.</p>
<p><a href="{{ .ConfirmationURL }}">Accept invitation</a></p>
```

**Recommended Custom Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f97316; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .credentials { background: white; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Harding Homes</h1>
    </div>
    <div class="content">
      <h2>You've Been Added to the Team! 🎉</h2>
      <p>Welcome to Harding Homes job management system. Your account has been created and you can now access the platform.</p>
      
      <div class="credentials">
        <h3>📧 Your Login Credentials:</h3>
        <p><strong>Email:</strong> {{ .Email }}</p>
        <p><strong>Temporary Password:</strong> [Will be provided separately]</p>
        <p><strong>Login URL:</strong> {{ .SiteURL }}</p>
      </div>

      <p><strong>⚠️ Important Security Steps:</strong></p>
      <ol>
        <li>Log in using your temporary password</li>
        <li>Immediately change your password (Settings → Security)</li>
        <li>Enable two-factor authentication (recommended)</li>
      </ol>

      <a href="{{ .ConfirmationURL }}" class="button">Activate Your Account</a>

      <p><strong>What You Can Do:</strong></p>
      <ul>
        <li>View and manage jobs</li>
        <li>Track schedules and tasks</li>
        <li>Access customer information</li>
        <li>Update job progress</li>
      </ul>

      <p>If you have any questions, contact your manager.</p>
    </div>
    <div class="footer">
      <p>© 2026 Harding Homes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### **Step 4: Configure Site URL**

Go to: **Authentication** → **URL Configuration**

Set your **Site URL** to:
```
Production: https://your-vercel-url.vercel.app
Development: http://localhost:3000
```

### **Step 5: Configure Redirect URLs**

Add these allowed redirect URLs:
```
https://*.vercel.app/**
http://localhost:3000/**
```

---

## 🧪 **TESTING EMAIL SETUP:**

### **Test 1: Send Test Email**
1. Go to your Harding Homes app
2. Navigate to: **Team Management**
3. Click **Add Team Member**
4. Fill in details with YOUR email address
5. Click **Send Invitation**
6. Check your inbox (and spam folder)

### **Test 2: Verify Email Contents**
Check that the email includes:
- ✅ Welcome message
- ✅ Login URL
- ✅ Activation link
- ✅ Instructions to change password
- ✅ Branded design (if using custom template)

### **Test 3: Confirm Link Works**
- Click the activation link in the email
- Verify it redirects to your login page
- Confirm you can log in with the temporary password

---

## 🐛 **TROUBLESHOOTING:**

### **Problem: No Email Received**

**Check 1: Spam/Junk Folder**
- Look in spam folder
- Mark as "Not Spam" if found

**Check 2: Email Logs**
1. Supabase Dashboard → **Authentication** → **Logs**
2. Look for email send attempts
3. Check for error messages

**Check 3: SMTP Settings**
- Verify credentials are correct
- Check port number (587 or 465)
- Ensure "Enable Custom SMTP" is turned ON

**Check 4: Console Errors**
- Open browser console (F12)
- Try sending invitation again
- Look for error messages in red

### **Problem: Emails Go to Spam**

**Solutions:**
1. **Use Custom SMTP** (not Supabase default)
2. **Add SPF Record** to your domain
3. **Add DKIM Record** to your domain
4. **Use Professional Email Provider** (Gmail, SendGrid, etc.)

### **Problem: Wrong "From" Address**

**Solution:**
1. Go to: **Authentication** → **SMTP Settings**
2. Set custom "From" address
3. Verify domain ownership if required

### **Problem: Email Template Not Applying**

**Solution:**
1. Make sure you're editing the **"Invite user"** template
2. Click **Save** after editing
3. Test again with a new invitation

---

## 📊 **EMAIL DELIVERY CHECKLIST:**

Before going live, verify:
- [ ] SMTP configured (or using Supabase default)
- [ ] Email template customized
- [ ] Site URL configured correctly
- [ ] Redirect URLs added
- [ ] Test email sent successfully
- [ ] Activation link works
- [ ] Email design looks good
- [ ] "From" address is professional
- [ ] Emails not going to spam

---

## 🚀 **AFTER SETUP:**

Once configured, the invitation flow will work like this:

1. **Manager clicks "Add Team Member"**
2. **Fills in:** Name, Email, Role
3. **System creates:** User account with temporary password
4. **System sends:** Automated email with:
   - Welcome message
   - Login URL
   - Activation link
   - Security instructions
5. **New user receives:** Professional branded email
6. **User clicks:** Activation link
7. **User logs in:** With temporary password
8. **User changes:** Password immediately
9. **User accesses:** Full system based on their role

---

## 📧 **EMAIL EXAMPLES:**

### **What User Receives:**

**Subject:** Welcome to Harding Homes - Your Account is Ready

**Body:**
```
Welcome to Harding Homes

You've Been Added to the Team! 🎉

Welcome to Harding Homes job management system. Your account has been 
created and you can now access the platform.

📧 Your Login Credentials:
Email: john@example.com
Temporary Password: [Shown in app dialog]
Login URL: https://your-app.vercel.app

⚠️ Important Security Steps:
1. Log in using your temporary password
2. Immediately change your password (Settings → Security)
3. Enable two-factor authentication (recommended)

[Activate Your Account Button]

What You Can Do:
• View and manage jobs
• Track schedules and tasks
• Access customer information
• Update job progress

If you have any questions, contact your manager.

© 2026 Harding Homes. All rights reserved.
```

---

## 💡 **PRO TIPS:**

### **For Better Deliverability:**
1. Use a custom domain email (not @gmail.com)
2. Set up SPF, DKIM, and DMARC records
3. Use a dedicated email service (SendGrid, Mailgun)
4. Keep email content professional and clean
5. Avoid spam trigger words

### **For Better User Experience:**
1. Include company logo in email
2. Use branded colors
3. Make activation link prominent
4. Include contact information
5. Explain what happens next

### **For Security:**
1. Force password change on first login
2. Include password requirements
3. Suggest enabling 2FA
4. Explain security best practices
5. Include IT support contact

---

## 📞 **NEED HELP?**

If you're stuck with email setup:

1. **Check Supabase Docs:** https://supabase.com/docs/guides/auth/auth-email
2. **Check Provider Docs:** Gmail, SendGrid, Mailgun setup guides
3. **Contact Supabase Support:** Via dashboard chat
4. **Share Error Logs:** From Authentication → Logs

---

## ✅ **QUICK START (5 Minutes):**

**Just want to test quickly?**

1. Go to Supabase Dashboard
2. Navigate to: Authentication → Email Templates
3. Click **"Invite user"** template
4. Leave default template as-is
5. Go back to your app
6. Try inviting yourself
7. Check your email (including spam)
8. If it works, you're good to go!
9. Customize template later when you have time

**That's it!** Supabase will use its default email service and send emails immediately.

---

**Last Updated:** 2026-03-19
**Version:** 1.0