image.pngconst functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter (you can use SendGrid, Gmail, or other services)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

// Send invoice email
exports.sendInvoiceEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invoiceId } = data;

  if (!invoiceId) {
    throw new functions.https.HttpsError('invalid-argument', 'Invoice ID is required');
  }

  try {
    // Get invoice from Firestore
    const invoiceDoc = await admin.firestore().collection('invoices').doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invoice not found');
    }

    const invoice = invoiceDoc.data();

    // Verify the invoice belongs to the authenticated user
    if (invoice.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // Get user profile for sender information
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userProfile = userDoc.data();

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.number}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
          .content { padding: 2rem; }
          .invoice-details { background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; }
          .amount { font-size: 2rem; font-weight: bold; color: #10b981; margin: 1rem 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 1.5rem 0; }
          .footer { background: #f8fafc; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem; }
          .logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Billr</div>
            <h1>Invoice ${invoice.number}</h1>
            <p>From ${userProfile?.displayName || userProfile?.email || 'Billr User'}</p>
          </div>
          
          <div class="content">
            <h2>Hi${invoice.clientName ? ` ${invoice.clientName}` : ''},</h2>
            <p>You have received an invoice for the following service:</p>
            
            <div class="invoice-details">
              <h3>Service Details</h3>
              <p><strong>Description:</strong> ${invoice.description}</p>
              <p><strong>Amount:</strong> <span class="amount">$${invoice.amount.toFixed(2)}</span></p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate.toDate()).toLocaleDateString()}</p>
              ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${invoice.paymentLink}" class="button">Pay Invoice Now</a>
            </div>
            
            <p>You can pay this invoice securely using the link above. If you have any questions, please reply to this email.</p>
            
            <p>Thank you for your business!</p>
            <p>Best regards,<br>${userProfile?.displayName || 'Billr User'}</p>
          </div>
          
          <div class="footer">
            <p>This invoice was sent via <strong>Billr</strong> - Professional invoicing made simple</p>
            <p>If you have any issues with this invoice, please contact the sender directly.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      Invoice ${invoice.number}
      
      Hi${invoice.clientName ? ` ${invoice.clientName}` : ''},
      
      You have received an invoice for: ${invoice.description}
      Amount: $${invoice.amount.toFixed(2)}
      Due Date: ${new Date(invoice.dueDate.toDate()).toLocaleDateString()}
      
      ${invoice.notes ? `Notes: ${invoice.notes}` : ''}
      
      Pay online: ${invoice.paymentLink}
      
      Thank you for your business!
      ${userProfile?.displayName || 'Billr User'}
      
      ---
      This invoice was sent via Billr - Professional invoicing made simple
    `;

    // Send email
    const mailOptions = {
      from: `"${userProfile?.displayName || 'Billr User'}" <${functions.config().email.user}>`,
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.number} - $${invoice.amount.toFixed(2)}`,
      text: emailText,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);

    // Update invoice to track that email was sent
    await admin.firestore().collection('invoices').doc(invoiceId).update({
      lastEmailSent: admin.firestore.FieldValue.serverTimestamp(),
      emailsSent: admin.firestore.FieldValue.increment(1)
    });

    return { success: true, message: 'Invoice email sent successfully' };

  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send invoice email');
  }
});

// Webhook for payment processing (placeholder)
exports.handlePaymentWebhook = functions.https.onRequest(async (req, res) => {
  // This would handle payment notifications from Stripe, PayPal, etc.
  // For now, it's a placeholder
  
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
exports.createPaymentLink = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invoiceId } = data;

  try {
    const invoiceDoc = await admin.firestore().collection('invoices').doc(invoiceId).get();
    const invoice = invoiceDoc.data();

    if (invoice.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied');
    }

    // This would create a real payment link with Stripe, PayPal, etc.
    // For now, return a placeholder link
    const paymentLink = `${functions.config().app.url}/pay/${invoice.number}`;

    await admin.firestore().collection('invoices').doc(invoiceId).update({
      paymentLink: paymentLink
    });

    return { paymentLink };

  } catch (error) {
    console.error('Error creating payment link:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create payment link');
  }
});

// Schedule function to check for overdue invoices
exports.checkOverdueInvoices = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  
  try {
    const overdueInvoices = await admin.firestore()
      .collection('invoices')
      .where('status', '==', 'pending')
      .where('dueDate', '<', now)
      .get();

    const batch = admin.firestore().batch();

    overdueInvoices.forEach((doc) => {
      batch.update(doc.ref, { status: 'overdue' });
    });

    await batch.commit();
    
    console.log(`Updated ${overdueInvoices.size} overdue invoices`);
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
  }
}); 