const { onCall, onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Resend } = require('resend');

// Define secret for Resend API key
const resendApiKey = defineSecret('RESEND_API_KEY');

initializeApp();
const db = getFirestore();

// Send invoice email using Resend
exports.sendInvoiceEmail = onCall({ secrets: [resendApiKey] }, async (request) => {
  // Initialize Resend with the secret API key
  const resend = new Resend(resendApiKey.value());
  // Check if user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { invoiceId, emailType = 'invoice' } = request.data;

  if (!invoiceId) {
    throw new Error('Invoice ID is required');
  }

  try {
    console.log(`📧 Sending ${emailType} email for invoice: ${invoiceId}`);

    // Get invoice from Firestore
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      throw new Error('Invoice not found');
    }

    const invoice = invoiceDoc.data();

    // Verify the invoice belongs to the authenticated user
    if (invoice.userId !== request.auth.uid) {
      throw new Error('Access denied');
    }

    // Get user profile for sender information
    const userDoc = await db.collection('users').doc(request.auth.uid).get();
    const userProfile = userDoc.data();
    const senderName = userProfile?.displayName || 'Billr User';
    const senderEmail = userProfile?.email || 'user@billr.biz';

    // Generate email content based on type
    let emailHtml, emailSubject;

    // Check if invoice is overdue for better subject lines
    const now = new Date();
    const dueDate = new Date(invoice.dueDate.toDate());
    const isOverdue = dueDate < now;
    const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    if (emailType === 'payment_confirmation') {
      emailSubject = `✅ Payment Received - Invoice #${invoice.number}`;
      emailHtml = generatePaymentConfirmationHTML(invoice, senderName);
    } else if (emailType === 'payment_reminder') {
      // Enhanced subject line for overdue invoices
      if (isOverdue) {
        emailSubject = `🚨 Payment Overdue (${daysOverdue} day${daysOverdue === 1 ? '' : 's'}) - Invoice #${invoice.number}`;
      } else {
        emailSubject = `⏰ Payment Reminder - Invoice #${invoice.number}`;
      }
      emailHtml = generatePaymentReminderHTML(invoice, senderName);
    } else {
      emailSubject = `📄 Invoice #${invoice.number} - Payment Request`;
      emailHtml = generateInvoiceHTML(invoice, senderName, userProfile);
    }

    // Send email using Resend
    const emailData = {
      from: `${senderName} <invoices@billr.biz>`,
      to: [invoice.clientEmail],
      reply_to: senderEmail,
      subject: emailSubject,
      html: emailHtml,
    };

    console.log('📧 Sending email with Resend:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    });

    const result = await resend.emails.send(emailData);

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      throw new functions.https.HttpsError('internal', `Email sending failed: ${result.error.message}`);
    }

    console.log('✅ Email sent successfully:', result.data);

    // Update invoice to track that email was sent
    await db.collection('invoices').doc(invoiceId).update({
      emailSent: true,
      emailSentAt: new Date(),
      emailSentBy: request.auth.uid,
      lastEmailSent: new Date(),
      emailsSent: (invoice.emailsSent || 0) + 1
    });

    return { 
      success: true, 
      message: 'Email sent successfully',
      emailId: result.data?.id
    };

  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
});

// Generate invoice HTML template
function generateInvoiceHTML(invoice, senderName, userProfile) {
  const dueDate = new Date(invoice.dueDate.toDate()).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #${invoice.number}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Billr
            </h1>
            <p style="margin: 8px 0 0 0; color: #e2e8f0; font-size: 16px;">
                Invoice Request
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #1e293b;">
                    Hi ${invoice.clientName || 'there'}! 👋
                </h2>
                <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.6;">
                    I hope this email finds you well. Here's your invoice for our recent work together.
                </p>
            </div>

            <!-- Invoice Details Card -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #334155;">
                        Invoice Details
                    </h3>
                    <span style="background-color: #ddd6fe; color: #7c3aed; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                        #${invoice.number}
                    </span>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 500;">
                        DESCRIPTION
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #1e293b; line-height: 1.5;">
                        ${invoice.description}
                    </p>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 0 8px;">
                    <div>
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 500;">
                            AMOUNT DUE
                        </p>
                        <p style="margin: 0; font-size: 24px; color: #059669; font-weight: 700;">
                            $${invoice.amount.toFixed(2)}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 500;">
                            DUE DATE
                        </p>
                        <p style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 600;">
                            ${dueDate}
                        </p>
                    </div>
                </div>

                ${invoice.notes ? `
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 500;">
                        ADDITIONAL NOTES
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
                        ${invoice.notes}
                    </p>
                </div>
                ` : ''}
            </div>

            <!-- Payment Button -->
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="${invoice.paymentLink || '#'}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); transition: all 0.2s ease;">
                    💳 Pay Now - $${invoice.amount.toFixed(2)}
                </a>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #64748b;">
                    Secure payment processing
                </p>
            </div>

            <!-- Message -->
            <div style="text-align: center; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.6;">
                    Thank you for your business! If you have any questions about this invoice, 
                    please don't hesitate to reach out.
                </p>
            </div>

            <!-- Contact Info -->
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; font-weight: 500;">
                    QUESTIONS? CONTACT ME:
                </p>
                <p style="margin: 0 0 4px 0; font-size: 16px; color: #334155; font-weight: 600;">
                    ${senderName}
                </p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                    ${userProfile?.email || 'contact@billr.biz'}
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                This invoice was sent from <strong>Billr</strong><br>
                Powered by <span style="color: #7c3aed; font-weight: 600;">Billr</span> ✨
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Generate payment confirmation HTML
function generatePaymentConfirmationHTML(invoice, senderName) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Payment Received! 🎉
            </h1>
            <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 16px;">
                Thank you for your payment
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px; text-align: center;">
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1e293b;">
                Hi ${invoice.clientName || 'there'}! 
            </h2>
            <p style="margin: 0 0 32px 0; font-size: 16px; color: #64748b; line-height: 1.6;">
                We've successfully received your payment for Invoice #${invoice.number}. 
                Your account is now up to date!
            </p>

            <!-- Payment Details -->
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 600; color: #166534;">
                    Payment Confirmation
                </h3>
                <div style="text-align: left;">
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #166534; line-height: 1.4;">
                        <strong>Invoice:</strong> #${invoice.number}
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #166534; line-height: 1.4;">
                        <strong>Description:</strong> ${invoice.description}
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #166534; line-height: 1.4;">
                        <strong>Amount Paid:</strong> $${invoice.amount.toFixed(2)}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #166534; line-height: 1.4;">
                        <strong>Payment Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>

            <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.6;">
                We appreciate your prompt payment and continued business. 
                If you need a receipt or have any questions, please don't hesitate to contact us.
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
                Thank you for choosing <strong>${senderName}</strong>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Generate payment reminder HTML
function generatePaymentReminderHTML(invoice, senderName) {
  const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate.toDate()).getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysOverdue > 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${isOverdue ? '#ef4444 0%, #dc2626 100%' : '#f59e0b 0%, #d97706 100%'}); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ${isOverdue ? '⚠️ Payment Overdue' : '⏰ Payment Reminder'}
            </h1>
            <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 16px;">
                Invoice #${invoice.number}
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1e293b;">
                Hi ${invoice.clientName || 'there'},
            </h2>
            <p style="margin: 0 0 32px 0; font-size: 16px; color: #64748b; line-height: 1.6;">
                ${isOverdue ? 
                  `This is a gentle reminder that your payment for Invoice #${invoice.number} was due on <strong>${new Date(invoice.dueDate.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> and is now <strong>${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue</strong>.` :
                  `This is a friendly reminder that your payment for Invoice #${invoice.number} is due on <strong>${new Date(invoice.dueDate.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.`
                }
            </p>

            <!-- Invoice Details -->
            <div style="background-color: ${isOverdue ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${isOverdue ? '#fecaca' : '#fed7aa'}; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 600; color: ${isOverdue ? '#991b1b' : '#92400e'};">
                    Invoice Details
                </h3>
                <div style="text-align: left;">
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: ${isOverdue ? '#991b1b' : '#92400e'}; line-height: 1.4;">
                        <strong>Invoice:</strong> #${invoice.number}
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: ${isOverdue ? '#991b1b' : '#92400e'}; line-height: 1.4;">
                        <strong>Description:</strong> ${invoice.description}
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: ${isOverdue ? '#991b1b' : '#92400e'}; line-height: 1.4;">
                        <strong>Amount Due:</strong> $${invoice.amount.toFixed(2)}
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: ${isOverdue ? '#991b1b' : '#92400e'}; line-height: 1.4;">
                        <strong>Original Due Date:</strong> ${new Date(invoice.dueDate.toDate()).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                    </p>
                    ${isOverdue ? `
                    <div style="background-color: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 15px; color: #991b1b; font-weight: 600; line-height: 1.4;">
                            ⚠️ <strong>Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}</strong>
                        </p>
                        <p style="margin: 8px 0 0 0; font-size: 14px; color: #7f1d1d; line-height: 1.4;">
                            Please submit payment as soon as possible to avoid late fees.
                        </p>
                    </div>
                    ` : `
                    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-top: 20px;">
                        <p style="margin: 0; font-size: 15px; color: #92400e; font-weight: 600; line-height: 1.4;">
                            ⏰ <strong>Payment Due Soon</strong>
                        </p>
                        <p style="margin: 8px 0 0 0; font-size: 14px; color: #78350f; line-height: 1.4;">
                            Please ensure payment is made by the due date.
                        </p>
                    </div>
                    `}
                </div>
            </div>

            <!-- Payment Button -->
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="${invoice.paymentLink || '#'}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
                    💳 Pay Now - $${invoice.amount.toFixed(2)}
                </a>
            </div>

            <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.6; text-align: center;">
                ${isOverdue ? 
                  `We understand that sometimes payments can be delayed. This invoice was originally due on <strong>${new Date(invoice.dueDate.toDate()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> and is now ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue. Please submit payment as soon as possible to bring your account up to date. If you need to discuss payment arrangements, please contact us immediately.` :
                  'Thank you for your business! Please ensure payment is made by the due date to avoid any late fees.'
                }
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #64748b;">
                Questions? Contact us at <strong>${senderName}</strong>
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

// Webhook for payment processing (placeholder)
exports.handlePaymentWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    // Verify webhook signature here
    // Parse payment data
    // Update invoice status to 'paid'
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
});

// Create payment link (placeholder - would integrate with Stripe/PayPal)
exports.createPaymentLink = onCall(async (request) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const { invoiceId } = request.data;

  try {
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    const invoice = invoiceDoc.data();

    if (invoice.userId !== request.auth.uid) {
      throw new Error('Access denied');
    }

    // This would create a real payment link with Stripe, PayPal, etc.
    const paymentLink = `${process.env.APP_URL || 'https://billr.biz'}/pay/${invoice.number}`;

    await db.collection('invoices').doc(invoiceId).update({
      paymentLink: paymentLink
    });

    return { paymentLink };

  } catch (error) {
    console.error('Error creating payment link:', error);
    throw new Error('Failed to create payment link');
  }
});

// Schedule function to check for overdue invoices (runs daily at 9 AM)
exports.checkOverdueInvoices = onSchedule('0 9 * * *', async (event) => {
  const now = new Date();
  
  try {
    const overdueInvoices = await db
      .collection('invoices')
      .where('status', '==', 'pending')
      .where('dueDate', '<', now)
      .get();

    const batch = db.batch();

    overdueInvoices.forEach((doc) => {
      batch.update(doc.ref, { status: 'overdue' });
    });

    await batch.commit();
    
    console.log(`Updated ${overdueInvoices.size} overdue invoices`);
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
  }
}); 