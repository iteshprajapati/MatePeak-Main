# Email System Implementation Guide

**Date:** November 1, 2025  
**Purpose:** Complete email notification system for booking communications  
**Status:** Ready to Implement

---

## 🎯 Overview

This guide covers implementing a complete email system for:

1. **Booking Confirmations** - Sent to both student and mentor
2. **Session Reminders** - 24 hours and 1 hour before session
3. **Follow-up Messages** - After session completion
4. **Cancellation Notifications** - When sessions are cancelled
5. **Rescheduling Notifications** - When sessions are rescheduled

---

## 📋 Email Service Options

### **Option 1: Resend (Recommended)**

✅ **Pros:**

- Modern, developer-friendly API
- Free tier: 3,000 emails/month, 100 emails/day
- Simple integration with Deno/Edge Functions
- Built-in email templates with React
- Great deliverability
- Easy testing with sandbox mode

❌ **Cons:**

- Newer service (less established)
- Limited template customization

**Pricing:** Free tier sufficient for MVP, $20/month for 50k emails

---

### **Option 2: SendGrid**

✅ **Pros:**

- Industry standard (Twilio-owned)
- Free tier: 100 emails/day
- Reliable deliverability
- Advanced analytics
- Battle-tested at scale

❌ **Cons:**

- More complex API
- Free tier has SendGrid branding
- Requires API key management

**Pricing:** Free tier for testing, $19.95/month for 40k emails

---

### **Option 3: AWS SES**

✅ **Pros:**

- Cheapest at scale ($0.10 per 1,000 emails)
- Highly scalable
- Integrated with AWS ecosystem

❌ **Cons:**

- Complex setup (requires domain verification, DKIM, SPF)
- Requires AWS account
- Steeper learning curve

**Pricing:** $0.10 per 1,000 emails

---

### **Option 4: Mailgun**

✅ **Pros:**

- Developer-friendly
- Free tier: 5,000 emails/month for 3 months
- Good documentation

❌ **Cons:**

- Credit card required for free tier
- Less modern API compared to Resend

**Pricing:** $35/month after trial for 50k emails

---

## 🏆 Recommendation: Use Resend

**Why Resend?**

- Best developer experience
- React email templates (we're using React)
- No credit card for free tier
- Perfect for MVP and scales well
- Modern API with TypeScript support

---

## 🚀 Implementation Steps

### **Step 1: Set Up Resend Account**

1. Go to [resend.com](https://resend.com)
2. Sign up with GitHub/Google
3. Verify your email
4. Get your API key from dashboard
5. Add to Supabase secrets:

```bash
# In Supabase Dashboard > Project Settings > Edge Functions > Secrets
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 2: Create Email Templates**

Create: `supabase/functions/_shared/email-templates.ts`

```typescript
// Email templates with proper styling
export const emailTemplates = {
  bookingConfirmation: {
    student: (data: any) => ({
      subject: `Booking Confirmed: ${data.serviceName} with ${data.mentorName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #111827; color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .card { background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #111827; font-size: 20px; margin-top: 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { color: #6b7280; font-weight: 500; }
    .detail-value { color: #111827; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.studentName},</p>
      <p>Great news! Your booking with <strong>${
        data.mentorName
      }</strong> has been confirmed.</p>
      
      <div class="card">
        <h2>Session Details</h2>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${data.serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${data.date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${data.time} (${data.timezone})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${data.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount Paid</span>
          <span class="detail-value">₹${data.amount}</span>
        </div>
      </div>
      
      ${
        data.meetingLink
          ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.meetingLink}" class="button">Join Meeting</a>
      </div>
      `
          : ""
      }
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>What to expect:</strong><br>
        • You'll receive a reminder 24 hours before the session<br>
        • Another reminder will be sent 1 hour before<br>
        • ${data.mentorName} will reach out if they need any preparation details
      </p>
    </div>
    
    <div class="footer">
      <p>Need help? <a href="mailto:support@sparkmentorconnect.com">Contact Support</a></p>
      <p>&copy; 2025 Spark Mentor Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
    }),

    mentor: (data: any) => ({
      subject: `New Booking: ${data.serviceName} with ${data.studentName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #111827; color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .card { background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #111827; font-size: 20px; margin-top: 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { color: #6b7280; font-weight: 500; }
    .detail-value { color: #111827; font-weight: 600; }
    .message-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Booking Received</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.mentorName},</p>
      <p>You have a new booking from <strong>${data.studentName}</strong>.</p>
      
      <div class="card">
        <h2>Session Details</h2>
        <div class="detail-row">
          <span class="detail-label">Student</span>
          <span class="detail-value">${data.studentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${data.serviceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${data.date}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${data.time} (${data.timezone})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${data.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Earnings</span>
          <span class="detail-value">₹${data.earnings}</span>
        </div>
      </div>
      
      ${
        data.purpose
          ? `
      <div class="message-box">
        <strong>Session Purpose:</strong><br>
        ${data.purpose}
      </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.dashboardLink}" class="button">View in Dashboard</a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>Next Steps:</strong><br>
        • Review the session purpose above<br>
        • Prepare any materials needed<br>
        • Generate meeting link if not already created
      </p>
    </div>
    
    <div class="footer">
      <p>Questions? <a href="mailto:support@sparkmentorconnect.com">Contact Support</a></p>
      <p>&copy; 2025 Spark Mentor Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
    }),
  },

  sessionReminder: (data: any, hoursUntil: number) => ({
    subject: `Reminder: Session ${
      hoursUntil === 24 ? "Tomorrow" : "in 1 Hour"
    } with ${data.otherPersonName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .card { background-color: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6; }
    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
    .time-badge { display: inline-block; background-color: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ ${
        hoursUntil === 24 ? "Session Tomorrow!" : "Session Starting Soon!"
      }</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>This is a friendly reminder about your upcoming session with <strong>${
        data.otherPersonName
      }</strong>.</p>
      
      <div class="card">
        <div style="text-align: center;">
          <div class="time-badge">
            ${hoursUntil === 24 ? "Tomorrow" : "In 1 Hour"}
          </div>
          <h2 style="margin: 16px 0; color: #1e40af;">${data.date} at ${
      data.time
    }</h2>
          <p style="color: #6b7280; margin: 8px 0;">Duration: ${
            data.duration
          } minutes</p>
          <p style="color: #6b7280; margin: 8px 0;">Timezone: ${
            data.timezone
          }</p>
        </div>
      </div>
      
      ${
        data.meetingLink
          ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.meetingLink}" class="button">Join Meeting Room</a>
      </div>
      `
          : ""
      }
      
      ${
        hoursUntil === 24
          ? `
      <p style="color: #6b7280; font-size: 14px;">
        <strong>Preparation Checklist:</strong><br>
        ✓ Review your session notes<br>
        ✓ Test your camera and microphone<br>
        ✓ Prepare any questions or materials<br>
        ✓ Find a quiet space for the call
      </p>
      `
          : `
      <p style="color: #dc2626; font-weight: 600; text-align: center;">
        ⚠️ Your session starts in 1 hour. Please be ready!
      </p>
      `
      }
    </div>
    
    <div class="footer">
      <p>Need to reschedule? <a href="${
        data.dashboardLink
      }">Manage Booking</a></p>
      <p>&copy; 2025 Spark Mentor Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  sessionFollowUp: (data: any) => ({
    subject: `How was your session with ${data.otherPersonName}?`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .card { background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #10b981; }
    .button { display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
    .star-rating { font-size: 24px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Session Completed!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.studentName},</p>
      <p>We hope you had a great session with <strong>${
        data.mentorName
      }</strong>!</p>
      
      <div class="card">
        <p style="text-align: center; margin: 0;">
          <strong>Session Summary</strong><br>
          ${data.date} • ${data.duration} minutes<br>
          ${data.serviceName}
        </p>
      </div>
      
      <p>Your feedback helps us improve and helps other students find great mentors.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <div class="star-rating">⭐⭐⭐⭐⭐</div>
        <a href="${data.reviewLink}" class="button">Leave a Review</a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        ${
          data.hasRecording
            ? "📹 Your session recording will be available within 24 hours."
            : ""
        }
      </p>
      
      ${
        !data.hasRecording
          ? `
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>💡 Pro Tip:</strong> Add session recording to your next booking to review key insights and action items!
        </p>
      </div>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 24px 0;">
        <p><strong>Want another session with ${data.mentorName}?</strong></p>
        <a href="${
          data.bookAgainLink
        }" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Book Again →</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Questions? <a href="mailto:support@sparkmentorconnect.com">Contact Support</a></p>
      <p>&copy; 2025 Spark Mentor Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  cancellationNotice: (data: any) => ({
    subject: `Session Cancelled: ${data.serviceName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #ef4444; color: white; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .card { background-color: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #ef4444; }
    .button { display: inline-block; background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
    h1 { margin: 0; font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Session Cancelled</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.recipientName},</p>
      <p>Your session with <strong>${
        data.otherPersonName
      }</strong> has been cancelled.</p>
      
      <div class="card">
        <p style="margin: 0;">
          <strong>Cancelled Session:</strong><br>
          ${data.serviceName}<br>
          ${data.date} at ${data.time}
        </p>
        ${
          data.reason
            ? `<p style="margin-top: 16px; color: #6b7280;"><strong>Reason:</strong> ${data.reason}</p>`
            : ""
        }
      </div>
      
      ${
        data.refundAmount
          ? `
      <p style="background-color: #d1fae5; border-radius: 8px; padding: 16px; color: #065f46;">
        <strong>💰 Refund Processed:</strong> ₹${data.refundAmount} has been refunded to your account. It may take 5-7 business days to reflect.
      </p>
      `
          : ""
      }
      
      <div style="text-align: center; margin: 32px 0;">
        <p><strong>We're sorry for the inconvenience!</strong></p>
        <a href="${data.rescheduleLink}" class="button">Book Another Session</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Need help? <a href="mailto:support@sparkmentorconnect.com">Contact Support</a></p>
      <p>&copy; 2025 Spark Mentor Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
  }),
};
```

---

### **Step 3: Create Email Service Function**

Create: `supabase/functions/send-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      subject,
      html,
      from = "Spark Mentor Connect <noreply@sparkmentorconnect.com>",
    }: EmailRequest = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data.id);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

---

### **Step 4: Update Booking Service to Send Emails**

Update: `src/services/bookingService.ts`

Add email sending after booking creation:

```typescript
// After successful booking creation
const sendBookingConfirmationEmails = async (bookingData: any) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Send to student
    await supabase.functions.invoke("send-email", {
      body: {
        to: bookingData.userEmail,
        ...emailTemplates.bookingConfirmation.student({
          studentName: bookingData.userName,
          mentorName: bookingData.mentorName,
          serviceName: bookingData.serviceName,
          date: format(
            new Date(bookingData.scheduledDate),
            "EEEE, MMMM d, yyyy"
          ),
          time: bookingData.scheduledTime,
          timezone: bookingData.userTimezone,
          duration: bookingData.duration,
          amount: bookingData.totalAmount,
          meetingLink: bookingData.meetingLink,
        }),
      },
    });

    // Send to mentor
    await supabase.functions.invoke("send-email", {
      body: {
        to: bookingData.mentorEmail,
        ...emailTemplates.bookingConfirmation.mentor({
          mentorName: bookingData.mentorName,
          studentName: bookingData.userName,
          serviceName: bookingData.serviceName,
          date: format(
            new Date(bookingData.scheduledDate),
            "EEEE, MMMM d, yyyy"
          ),
          time: bookingData.scheduledTime,
          timezone: bookingData.mentorTimezone,
          duration: bookingData.duration,
          earnings: bookingData.mentorEarnings,
          purpose: bookingData.purpose,
          dashboardLink: `${window.location.origin}/dashboard/${bookingData.mentorUsername}`,
        }),
      },
    });
  } catch (error) {
    console.error("Failed to send confirmation emails:", error);
    // Don't fail the booking if email fails
  }
};
```

---

### **Step 5: Create Scheduled Email Function (Reminders)**

Create: `supabase/functions/send-scheduled-emails/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// This function runs on a cron schedule
Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    // Get bookings 24 hours away
    const { data: bookings24h } = await supabase
      .from("bookings")
      .select(
        `
        *,
        user:profiles!bookings_user_id_fkey(full_name, email),
        expert:expert_profiles(full_name, email, username)
      `
      )
      .eq("status", "confirmed")
      .gte("scheduled_date", in24Hours.toISOString().split("T")[0])
      .lte(
        "scheduled_date",
        new Date(in24Hours.getTime() + 3600000).toISOString().split("T")[0]
      )
      .is("reminder_24h_sent", false);

    // Send 24h reminders
    for (const booking of bookings24h || []) {
      // Send to student
      await supabase.functions.invoke("send-email", {
        body: {
          to: booking.user.email,
          ...emailTemplates.sessionReminder(
            {
              recipientName: booking.user.full_name,
              otherPersonName: booking.expert.full_name,
              date: format(new Date(booking.scheduled_date), "EEEE, MMMM d"),
              time: booking.scheduled_time,
              timezone: booking.user_timezone,
              duration: booking.duration,
              meetingLink: booking.meeting_link,
              dashboardLink: `${supabaseUrl}/dashboard`,
            },
            24
          ),
        },
      });

      // Mark as sent
      await supabase
        .from("bookings")
        .update({ reminder_24h_sent: true })
        .eq("id", booking.id);
    }

    // Similar logic for 1-hour reminders...

    return new Response(
      JSON.stringify({
        success: true,
        sent24h: bookings24h?.length || 0,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
});
```

---

### **Step 6: Set Up Cron Job**

In Supabase Dashboard > Database > Cron Jobs:

```sql
-- Run every hour to send reminder emails
SELECT cron.schedule(
  'send-reminder-emails',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-scheduled-emails',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

### **Step 7: Add Database Columns**

```sql
-- Add email tracking columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS followup_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmation_email_sent BOOLEAN DEFAULT FALSE;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_bookings_reminders
ON bookings(scheduled_date, scheduled_time, status)
WHERE reminder_24h_sent = FALSE OR reminder_1h_sent = FALSE;
```

---

## 📊 Email Flow Diagram

```
Booking Created
    ↓
[Confirmation Email] → Student + Mentor
    ↓
24 Hours Before
    ↓
[Reminder Email] → Student + Mentor
    ↓
1 Hour Before
    ↓
[Reminder Email] → Student + Mentor
    ↓
Session Completed
    ↓
[Follow-up Email] → Student (with review request)
    ↓
[Follow-up Email] → Mentor (with earnings summary)
```

---

## 🧪 Testing

### **1. Test in Development**

```typescript
// Test email sending
const testEmail = async () => {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: {
      to: "your-email@example.com",
      subject: "Test Email",
      html: "<h1>This is a test</h1>",
    },
  });
  console.log(data, error);
};
```

### **2. Use Resend Sandbox**

Resend provides test email addresses:

- `test@resend.dev` - Always succeeds
- `bounce@resend.dev` - Always bounces

### **3. Check Logs**

```bash
# View edge function logs
supabase functions logs send-email --project-ref YOUR_PROJECT_ID
```

---

## 💰 Cost Estimation

### **Free Tier (3,000 emails/month)**

- 100 bookings/month = 200 confirmation emails
- 100 bookings × 2 reminders = 200 reminder emails
- 100 follow-ups = 100 emails
- **Total: 500 emails/month** ✅ Well within free tier

### **Paid Plan ($20/month for 50k emails)**

- Good for up to **8,000 bookings/month**
- Scales automatically

---

## 🔒 Security Best Practices

1. **Never expose API keys in frontend**
2. **Always use Edge Functions for email sending**
3. **Validate email addresses before sending**
4. **Rate limit email sending per user**
5. **Log all email attempts for debugging**
6. **Handle failures gracefully (don't block bookings)**

---

## 📈 Monitoring & Analytics

Track email metrics:

- Delivery rate
- Open rate
- Click-through rate (CTR)
- Bounce rate

Resend provides built-in analytics dashboard.

---

## 🚀 Deployment Checklist

- [ ] Sign up for Resend account
- [ ] Get API key and add to Supabase secrets
- [ ] Deploy `send-email` edge function
- [ ] Deploy `send-scheduled-emails` edge function
- [ ] Add database columns for email tracking
- [ ] Set up cron job for reminders
- [ ] Update booking service to send confirmations
- [ ] Test with sandbox emails
- [ ] Verify domain for production (optional but recommended)
- [ ] Monitor first 100 emails
- [ ] Set up error alerts

---

## 🎯 Next Steps After Implementation

1. **Add unsubscribe functionality**
2. **Implement email preferences per user**
3. **Add SMS notifications (optional)**
4. **Create email digest (weekly summary)**
5. **A/B test email templates**
6. **Add branded email templates**

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Email Best Practices](https://postmarkapp.com/guides/email-best-practices)

---

**Status:** Ready to implement! Start with Step 1 and work through sequentially.

**Estimated Time:** 4-6 hours for complete implementation
