# WhatsApp Notification Setup Guide

This system uses Twilio's WhatsApp Business API to send real-time notifications for inventory alerts.

## Prerequisites

1. **Twilio Account**: Sign up at [https://www.twilio.com/](https://www.twilio.com/)
2. **WhatsApp-Enabled Number**: Activate WhatsApp on your Twilio account

## Setup Steps

### 1. Get Twilio Credentials

1. Log in to your Twilio Console: [https://console.twilio.com/](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
4. Note your **WhatsApp-enabled phone number** (format: `whatsapp:+14155238886`)

### 2. Configure Environment Variables

Update your `Backend/.env` file with your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Add Phone Numbers to User Profiles

Users who want to receive WhatsApp notifications must add their phone numbers:

**Format**: International format with country code (e.g., `+254712345678` for Kenya)

#### Via API:
```bash
PUT /api/users/:id
{
  "phone": "+254712345678"
}
```

#### Via Database:
```sql
UPDATE "User" SET phone = '+254712345678' WHERE email = 'admin@example.com';
```

### 4. Test WhatsApp Sandbox (Development)

For testing, Twilio provides a WhatsApp Sandbox:

1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join the sandbox (send "join <code>" to the sandbox number)
3. Use the sandbox number as `TWILIO_WHATSAPP_FROM`

### 5. Production Setup

For production, you need a **Twilio WhatsApp Business Profile**:

1. Apply for WhatsApp Business API access through Twilio
2. Complete business verification
3. Get your production WhatsApp-enabled number
4. Update `TWILIO_WHATSAPP_FROM` with your production number

## Notification Types

The system sends WhatsApp alerts for:

- 🚨 **Low Stock Alerts**: When product stock falls below threshold
- ⚠️ **Out of Stock Alerts**: When products are completely out of stock
- 📦 **Overstock Alerts**: When stock exceeds forecasted demand
- ⏰ **Expiring Soon Alerts**: Products expiring within 30 days
- 🚫 **Expired Alerts**: Products that have already expired
- 📊 **Daily Digest**: Summary of all active alerts

## Costs

- **Twilio WhatsApp Messaging**: ~$0.005 per message (varies by country)
- **Sandbox (Testing)**: Free
- Check current pricing: [https://www.twilio.com/whatsapp/pricing](https://www.twilio.com/whatsapp/pricing)

## Fallback Behavior

If WhatsApp is not configured:
- System continues to work normally
- Email notifications still sent
- WhatsApp messages are skipped with a log message
- No errors thrown

## Testing

Test WhatsApp notifications:

```bash
# Run expiry check manually (if you have products with expiry dates)
node Backend/cron/checkExpiryAlerts.js

# Or trigger an alert by creating a low-stock scenario
# (reduce product stock below threshold)
```

## Troubleshooting

### Messages not received?

1. **Check environment variables**: Ensure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM` are set
2. **Verify phone number format**: Must include country code (e.g., `+254712345678`)
3. **Sandbox users**: Ensure recipient has joined the Twilio sandbox
4. **Check Twilio logs**: View delivery status in Twilio Console → Monitor → Logs → Messaging

### Error: "Authenticate"

- Invalid `TWILIO_ACCOUNT_SID` or `TWILIO_AUTH_TOKEN`
- Check credentials in Twilio Console

### Error: "Invalid 'To' phone number"

- Phone number must be in E.164 format: `+[country code][number]`
- For sandbox, recipient must have joined by texting the sandbox

## Alternative: Kenya-Based Solutions

If Twilio is too expensive or not available, consider:

1. **Africa's Talking**: [https://africastalking.com/](https://africastalking.com/)
2. **Infobip**: [https://www.infobip.com/](https://www.infobip.com/)
3. **Clickatell**: [https://www.clickatell.com/](https://www.clickatell.com/)

To integrate alternatives, update `Backend/services/whatsappService.js` with the new provider's SDK.

## Security Notes

- Never commit `.env` file with real credentials to version control
- Use environment variables for all sensitive data
- Rotate Twilio Auth Token regularly
- Use Twilio subaccounts for different environments (dev/staging/prod)

---

**Need Help?** Contact Twilio Support or check their documentation: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
