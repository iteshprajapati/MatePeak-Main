# 📧 Branded Email Setup Guide

## Quick Setup Checklist

### ☑️ Step 1: Get a Domain (Choose One)

**Option A: Buy a Domain (~$10/year)**
- Namecheap: https://www.namecheap.com
- Cloudflare: https://www.cloudflare.com/products/registrar
- GoDaddy: https://www.godaddy.com

**Recommended Names:**
- `sparkmentorconnect.com`
- `sparkmentor.io`
- `mentorconnect.app`

**Option B: Use Existing Domain**
If you already own a domain, skip to Step 2.

---

### ☑️ Step 2: Add Domain to Resend

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `sparkmentorconnect.com`)
4. Click "Add"

Resend will show you DNS records to copy.

---

### ☑️ Step 3: Add DNS Records

**Copy these records from Resend and add to your domain DNS:**

| Type | Name | Value | Priority |
|------|------|-------|----------|
| MX | @ | feedback-smtp.us-east-1.amazonses.com | 10 |
| TXT | @ | v=spf1 include:amazonses.com ~all | - |
| TXT | resend._domainkey | [long DKIM key from Resend] | - |
| TXT | _dmarc | v=DMARC1; p=none; | - |

**Where to add:**
- **Namecheap:** Dashboard → Domain → Advanced DNS
- **Cloudflare:** Dashboard → DNS → Records
- **GoDaddy:** My Products → Domains → DNS

---

### ☑️ Step 4: Wait & Verify

1. **Wait:** 15-60 minutes for DNS to propagate
2. **Check:** https://dnschecker.org (enter your domain)
3. **Verify:** Go back to Resend dashboard, click "Verify"
4. **Success:** You'll see ✅ Verified

---

### ☑️ Step 5: Update Code (After Verification)

Once your domain is verified, update these 2 files:

#### File 1: `supabase/functions/send-email/index.ts`

**Find this line (~line 35):**
```typescript
from = "Spark Mentor Connect <onboarding@resend.dev>",
```

**Replace with:**
```typescript
from = "Spark Mentor Connect <noreply@sparkmentorconnect.com>",
```
(Use YOUR domain)

#### File 2: `supabase/functions/send-reminders/index.ts`

**Find this line (~line 300):**
```typescript
from: "Spark Mentor Connect <onboarding@resend.dev>",
```

**Replace with:**
```typescript
from: "Spark Mentor Connect <noreply@sparkmentorconnect.com>",
```

---

### ☑️ Step 6: Redeploy Functions

After updating the code:

```powershell
# Redeploy both functions
npx supabase functions deploy send-email
npx supabase functions deploy send-reminders
```

---

## 🎯 Example: Complete Setup with Namecheap

### 1. Buy Domain
- Go to Namecheap.com
- Search for `sparkmentorconnect.com`
- Purchase (~$10/year)

### 2. Add to Resend
- Login to Resend
- Add domain `sparkmentorconnect.com`

### 3. Add DNS Records in Namecheap

**Navigate to:**
Dashboard → Domain List → Manage → Advanced DNS

**Add these records:**

**Record 1 - MX:**
```
Type: MX Record
Host: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

**Record 2 - SPF:**
```
Type: TXT Record
Host: @
Value: v=spf1 include:amazonses.com ~all
```

**Record 3 - DKIM:**
```
Type: TXT Record
Host: resend._domainkey
Value: [paste the long key from Resend dashboard]
```

**Record 4 - DMARC:**
```
Type: TXT Record
Host: _dmarc
Value: v=DMARC1; p=none;
```

**Save all records.**

### 4. Wait & Verify
- Wait 30-60 minutes
- Go to Resend dashboard
- Click "Verify"
- Should show ✅ Verified

### 5. Update & Deploy
- Change email addresses in code (see Step 5 above)
- Deploy functions
- Test by creating a booking!

---

## 💡 Alternative: Free Options

### Option 1: Subdomain (If You Have a Website)
If you already have a website like `mywebsite.com`, you can use a subdomain:
- `mail.mywebsite.com`
- `app.mywebsite.com`

Then use emails like: `noreply@mail.mywebsite.com`

### Option 2: Temporary - Keep Using Resend.dev
You can continue using `onboarding@resend.dev` for testing, but:
- ❌ May go to spam folders
- ❌ Not professional
- ❌ Limited to 100 emails/day
- ✅ Works immediately (no setup)

For production, **always use a custom domain.**

---

## 🐛 Troubleshooting

### Domain Not Verifying?
1. **Check DNS propagation:** https://dnschecker.org
2. **Wait longer:** Can take up to 48 hours
3. **Check for typos:** One wrong character breaks everything
4. **Contact domain support:** They can help add records

### Emails Going to Spam?
1. **Add all 4 DNS records** (MX, SPF, DKIM, DMARC)
2. **Wait 24-48 hours** for reputation to build
3. **Send gradually:** Don't send 1000 emails on day 1
4. **Ask users to whitelist:** Have them add your email to contacts

### Record Already Exists?
If you see "record already exists" when adding DNS:
- Delete the old record first
- Then add the new one
- Or edit the existing record

---

## 📊 Cost Comparison

| Service | Cost | Emails/Month | Best For |
|---------|------|--------------|----------|
| Resend (Free) | $0 | 3,000 | Startups |
| Resend (Pro) | $20 | 50,000 | Growing apps |
| Domain (Namecheap) | $10/year | - | Required |
| Domain (Cloudflare) | $9/year | - | Best price |

**Total to get started:** ~$10/year (just the domain)

---

## ✅ Final Checklist

Before going live, verify:

- [ ] Domain purchased and DNS configured
- [ ] All 4 DNS records added (MX, SPF, DKIM, DMARC)
- [ ] Domain verified in Resend (✅ shows in dashboard)
- [ ] Code updated in both functions
- [ ] Functions redeployed to Supabase
- [ ] Test email sent successfully
- [ ] Email NOT going to spam folder

---

## 🎉 After Setup

Your emails will be sent from:
**`Spark Mentor Connect <noreply@yourdomain.com>`**

This looks professional and won't go to spam! 🚀

---

## Need Help?

**Resend Support:**
- Docs: https://resend.com/docs
- Discord: https://resend.com/discord

**Domain Help:**
- Namecheap: https://www.namecheap.com/support
- Cloudflare: https://support.cloudflare.com

**Can't figure it out?**
Feel free to ask for help! Common issues:
1. "My domain won't verify" → Check DNS propagation
2. "Emails going to spam" → Wait 24-48h, add all records
3. "Can't add DNS records" → Contact domain support
