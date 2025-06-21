# Stripe & EmailJS Integration Setup Guide

This guide will help you set up Stripe payment processing and EmailJS email functionality for your Billr invoice system.

## 🚀 Quick Start

### 1. Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# EmailJS Configuration  
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Company Information (Optional)
VITE_COMPANY_NAME=Your Company Name
VITE_COMPANY_EMAIL=invoices@yourcompany.com
```

## 💳 Stripe Setup

### Step 1: Create Stripe Account
1. Visit [stripe.com](https://stripe.com) and create an account
2. Complete the verification process
3. Navigate to **Developers > API Keys**
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)

### Step 2: Configure Stripe
1. Add your publishable key to the `.env` file
2. **Important**: For production, you'll need a backend server to:
   - Create payment intents securely
   - Handle webhooks for payment confirmation
   - Update invoice status when payments succeed

### Step 3: Test Mode vs Live Mode
- Use test keys (starting with `pk_test_`) for development
- Switch to live keys (starting with `pk_live_`) for production
- Test with Stripe's test card numbers: `4242 4242 4242 4242`

## 📧 EmailJS Setup

### Step 1: Create EmailJS Account
1. Visit [emailjs.com](https://www.emailjs.com/) and create an account
2. Go to **Email Services** and connect your email provider:
   - Gmail
   - Outlook
   - Yahoo
   - SMTP
   - Or other supported services

### Step 2: Create Email Template
1. Go to **Email Templates** and click **Create New Template**
2. Use these template variables in your email content:

```html
Subject: Invoice #{{invoice_number}} - {{subject}}

Dear {{to_name}},

{{message}}

Invoice Details:
- Invoice Number: #{{invoice_number}}
- Amount: {{amount}}
- Due Date: {{due_date}}
- Payment Link: {{payment_link}}

Best regards,
{{company_name}}
```

### Step 3: Get Your Keys
1. **Service ID**: Found in your Email Services section
2. **Template ID**: Found in your Email Templates section  
3. **Public Key**: Go to **Account > General** and copy your Public Key

### Step 4: Configure EmailJS Settings
In your EmailJS account:
1. **Email Services**: Make sure your email service is active
2. **Template**: Ensure all variables are properly mapped
3. **Access Management**: Your public key should allow sending from your domain

## 🔧 Features Included

### Payment Processing
- **Pay Now Button**: Appears on unpaid invoices
- **Stripe Checkout**: Secure payment processing
- **Payment Links**: Shareable URLs for invoice payments
- **Payment Status**: Automatic invoice status updates (with backend)

### Email Functionality
- **Invoice Emails**: Send invoices to clients with payment links
- **Payment Confirmations**: Automatic emails when payments are received
- **Payment Reminders**: Send reminders for overdue invoices
- **Smart Email Content**: Different email templates based on invoice status

### Invoice Management
- **Email Integration**: Send invoices directly from the dashboard
- **Payment Integration**: Process payments through Stripe
- **Status Tracking**: Track payment status and invoice history
- **Customer Management**: Store customer information for future use

## 🛠 Backend Requirements (Important!)

For full functionality, you'll need a backend server to handle:

### Stripe Backend Endpoints
```javascript
// Create payment intent
POST /api/create-payment-intent
{
  "amount": 5000,
  "currency": "usd", 
  "description": "Invoice #123",
  "invoiceId": "inv_123",
  "customerEmail": "client@example.com"
}

// Create checkout session  
POST /api/create-checkout-session
{
  "amount": 5000,
  "currency": "usd",
  "description": "Invoice #123", 
  "invoiceId": "inv_123",
  "customerEmail": "client@example.com",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}

// Verify payment
GET /api/verify-payment/:paymentIntentId

// Webhook endpoint
POST /api/stripe-webhook
```

### Webhook Configuration
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add endpoint: `https://yourbackend.com/api/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `checkout.session.completed`
4. Use webhook to update invoice status in your database

## 🧪 Testing

### Test Stripe Integration
1. Use test publishable key
2. Test with card number: `4242 4242 4242 4242`
3. Use any future expiry date and any 3-digit CVC
4. Check Stripe Dashboard for test transactions

### Test Email Integration
1. Send test email through EmailJS dashboard
2. Check email delivery and formatting
3. Verify all template variables are working
4. Test different email types (invoice, reminder, confirmation)

## 📱 Mobile Considerations

### Stripe Mobile
- Stripe Checkout is mobile-responsive
- Payment forms work on all devices
- Apple Pay and Google Pay supported automatically

### Email Mobile
- Email templates should be mobile-friendly
- Test email rendering on different devices
- Keep email content concise for mobile viewing

## 🔒 Security Best Practices

### Stripe Security
- Never expose secret keys in frontend code
- Use HTTPS for all payment pages
- Validate all data on the backend
- Handle webhooks securely with signature verification

### EmailJS Security
- Limit EmailJS usage with domain restrictions
- Monitor email sending quotas
- Use environment variables for all keys
- Don't include sensitive data in email templates

## 🆘 Troubleshooting

### Common Stripe Issues
- **"Invalid API Key"**: Check your publishable key format
- **Payment Fails**: Ensure backend endpoints are working
- **CORS Errors**: Configure proper CORS settings on backend

### Common EmailJS Issues  
- **"Email not sent"**: Check service configuration
- **Template errors**: Verify all variables are defined
- **Rate limits**: Check your EmailJS quota and upgrade if needed

### Integration Issues
- **Payment status not updating**: Implement Stripe webhooks
- **Emails not sending**: Verify EmailJS configuration
- **CORS issues**: Configure your backend properly

## 📞 Support

### Stripe Support
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

### EmailJS Support  
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Support](https://www.emailjs.com/support/)

## 🎯 Next Steps

1. Set up your environment variables
2. Configure Stripe and EmailJS accounts
3. Test the integration in development
4. Build backend endpoints for production
5. Deploy with proper security measures
6. Monitor transactions and email delivery

Happy invoicing! 🚀 