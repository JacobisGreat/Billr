# Firebase Functions Email Setup Guide

## 🚀 **Overview**

This guide explains how to set up Firebase Functions with Resend email integration for the Billr invoicing system. The system uses Firebase Functions to securely send emails from the server-side, ensuring better deliverability and security.

## 📋 **Prerequisites**

- Firebase project with Functions enabled
- Resend account with API key
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)

## 🔧 **Setup Steps**

### 1. Firebase Functions Dependencies

The following packages are already installed in `/functions/package.json`:
```json
{
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "resend": "^1.0.0"
  }
}
```

### 2. Environment Configuration

Set your Resend API key in Firebase Functions config:
```bash
firebase functions:config:set resend.api_key="YOUR_RESEND_API_KEY"
```

### 3. Development with Emulator

For local development, use Firebase emulator:
```bash
# Start the emulator
firebase emulators:start --only functions

# The emulator runs on:
# - Functions: http://localhost:5002
# - Admin UI: http://localhost:4002
```

### 4. Production Deployment

To deploy to production (requires billing account):
```bash
firebase deploy --only functions
```

**Note**: If you get a service account error, you may need to enable billing or recreate the service account.

## 📧 **Available Functions**

### `sendInvoiceEmail`
Sends invoice emails with professional templates.

**Parameters:**
- `invoiceId` (string): The invoice document ID
- `emailType` (string): Email type ('invoice', 'payment_confirmation', 'payment_reminder')

**Example Usage:**
```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const sendEmail = httpsCallable(functions, 'sendInvoiceEmail');

const result = await sendEmail({
  invoiceId: 'invoice-123',
  emailType: 'invoice'
});
```

### `createPaymentLink`
Creates payment links for invoices.

### `handlePaymentWebhook`
Handles payment webhook notifications.

### `checkOverdueInvoices`
Scheduled function to check for overdue invoices daily.

## 🎨 **Email Templates**

The system includes three professional email templates:

1. **Invoice Email**: Clean, professional invoice with payment button
2. **Payment Confirmation**: Celebrates successful payments
3. **Payment Reminder**: Friendly reminder for overdue invoices

## 🔐 **Security Features**

- User authentication required for all functions
- Invoice ownership verification
- Secure email sending through Resend
- Audit logging and error tracking

## 🧪 **Testing**

### Frontend Testing
```javascript
// Test from browser console
testFirebaseEmail('invoice-id-here');
```

### Direct API Testing
```bash
# Test function endpoint (requires auth token)
curl -X POST \
  "http://localhost:5002/billr-7f713/us-central1/sendInvoiceEmail" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"data":{"invoiceId":"test-invoice","emailType":"invoice"}}'
```

## 📊 **Monitoring**

### Function Logs
```bash
# View function logs
firebase functions:log

# View real-time logs
firebase functions:log --only sendInvoiceEmail
```

### Emulator Logs
Check the emulator console output for detailed logging including:
- Email sending attempts
- Function execution time
- Error messages
- Resend API responses

## 🔧 **Configuration Files**

### firebase.json
```json
{
  "emulators": {
    "functions": {
      "port": 5002
    },
    "ui": {
      "enabled": true,
      "port": 4002
    }
  }
}
```

### src/firebase.ts
```typescript
// Automatically connects to emulator in development
if (import.meta.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5002);
}
```

## 🎯 **Email From Address**

Emails are sent from: `invoices@billr.biz`

To use a custom domain:
1. Add and verify your domain in Resend
2. Update the `from` field in the Firebase Function
3. Set up SPF, DKIM, and DMARC records

## 🔄 **Troubleshooting**

### Common Issues

1. **Port Already in Use**
   ```bash
   pkill -f firebase
   firebase emulators:start --only functions
   ```

2. **Authentication Errors**
   - Ensure user is logged in
   - Check Firebase Auth configuration
   - Verify invoice ownership

3. **Resend API Errors**
   - Check API key configuration
   - Verify domain verification
   - Check rate limits

4. **Function Not Found**
   - Ensure emulator is running
   - Check function name spelling
   - Verify Firebase project ID

### Debug Mode

Enable debug logging in the function:
```javascript
console.log('📧 Function called with:', data);
console.log('📧 User context:', context.auth);
```

## 🚀 **Production Considerations**

1. **Billing**: Firebase Functions require a billing account for production
2. **Rate Limits**: Monitor Resend rate limits
3. **Error Handling**: Implement proper error notifications
4. **Monitoring**: Set up alerting for failed email sends
5. **Security**: Regularly rotate API keys

## 📞 **Support**

- Firebase Functions: https://firebase.google.com/docs/functions
- Resend API: https://resend.com/docs
- Billr Issues: Create a GitHub issue

---

✨ **Your Firebase Functions email system is now ready to send professional invoices!** 