const { onCall, onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Resend } = require('resend');
const PDFDocument = require('pdfkit');

// Professional PDF generation function using PDFKit
async function generateInvoicePDF(invoice, senderName, senderEmail) {
  console.log('📄 Generating PDF for invoice:', invoice.number);
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      // Collect PDF data
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        const base64Content = pdfData.toString('base64');
        resolve(base64Content);
      });
      
      // Header with Billr branding
      doc.fontSize(28)
         .fillColor('#2E75B0')
         .text('Billr', 50, 50);
      
      doc.fontSize(11)
         .fillColor('#64748b')
         .text('Professional Invoicing', 50, 82);
      
      // Invoice title and number - right aligned
      doc.fontSize(24)
         .fillColor('#1e293b')
         .text('INVOICE', 350, 50, { width: 200, align: 'right' });
      
      doc.fontSize(14)
         .fillColor('#64748b')
         .text(`#${invoice.number}`, 350, 78, { width: 200, align: 'right' });
      
      // Date information - right aligned  
      doc.fontSize(11)
         .fillColor('#64748b')
         .text(`Invoice Date: ${new Date(invoice.createdAt.toDate()).toLocaleDateString()}`, 350, 100, { width: 200, align: 'right' })
         .text(`Due Date: ${new Date(invoice.dueDate.toDate()).toLocaleDateString()}`, 350, 116, { width: 200, align: 'right' });
      
      // Bill To section
      doc.fontSize(11)
         .fillColor('#64748b')
         .text('BILL TO:', 50, 150);
      
      doc.fontSize(13)
         .fillColor('#1e293b')
         .text(invoice.clientName || 'Client', 50, 168)
         .fontSize(12)
         .fillColor('#64748b')
         .text(invoice.clientEmail, 50, 186);
      
      if (invoice.clientPhone) {
        doc.text(invoice.clientPhone, 50, 202);
      }
      
      // From section
      doc.fontSize(11)
         .fillColor('#64748b')
         .text('FROM:', 350, 150);
      
      doc.fontSize(13)
         .fillColor('#1e293b')
         .text(senderName, 350, 168)
         .fontSize(12)
         .fillColor('#64748b')
         .text(senderEmail, 350, 186);
      
      // Line separator
      doc.moveTo(50, 230)
         .lineTo(550, 230)
         .strokeColor('#e2e8f0')
         .lineWidth(1)
         .stroke();
      
      // Table header
      const tableTop = 260;
      doc.fontSize(11)
         .fillColor('#1e293b')
         .text('DESCRIPTION', 50, tableTop)
         .text('QTY', 320, tableTop, { width: 40, align: 'center' })
         .text('PRICE', 380, tableTop, { width: 60, align: 'right' })
         .text('TOTAL', 480, tableTop, { width: 70, align: 'right' });
      
      // Table header line
      doc.moveTo(50, tableTop + 18)
         .lineTo(550, tableTop + 18)
         .strokeColor('#2E75B0')
         .lineWidth(1.5)
         .stroke();
      
      // Line items
      let yPosition = tableTop + 35;
      
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        invoice.lineItems.forEach((item) => {
          const itemTotal = item.quantity * item.unitPrice;
          
          doc.fontSize(12)
             .fillColor('#1e293b')
             .text(item.description, 50, yPosition, { width: 260 })
             .text(item.quantity.toString(), 320, yPosition, { width: 40, align: 'center' })
             .text(`$${item.unitPrice.toFixed(2)}`, 380, yPosition, { width: 60, align: 'right' })
             .text(`$${itemTotal.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });
          
          // Add tax info if present
          if (item.tax && item.tax > 0) {
            yPosition += 15;
            doc.fontSize(10)
               .fillColor('#64748b')
               .text(`(includes ${item.tax}% tax)`, 50, yPosition, { width: 260 });
            yPosition += 15;
          } else {
            yPosition += 25;
          }
        });
      } else {
        // Handle single description invoice
        const baseAmount = invoice.taxRate && invoice.taxRate > 0 ? 
          invoice.amount / (1 + invoice.taxRate / 100) : 
          invoice.amount;
        
        doc.fontSize(12)
           .fillColor('#1e293b')
           .text(invoice.description, 50, yPosition, { width: 260 })
           .text('1', 320, yPosition, { width: 40, align: 'center' })
           .text(`$${baseAmount.toFixed(2)}`, 380, yPosition, { width: 60, align: 'right' })
           .text(`$${baseAmount.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });
        
        // Add tax info if present
        if (invoice.taxRate && invoice.taxRate > 0) {
          yPosition += 15;
          doc.fontSize(10)
             .fillColor('#64748b')
             .text(`(includes ${invoice.taxRate}% tax)`, 50, yPosition, { width: 260 });
          yPosition += 15;
        } else {
          yPosition += 25;
        }
      }
      
      // Calculate totals
      let subtotal = 0;
      let taxTotal = 0;
      
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        // Calculate from line items
        invoice.lineItems.forEach((item) => {
          const itemTotal = item.quantity * item.unitPrice;
          subtotal += itemTotal;
          if (item.tax && item.tax > 0) {
            taxTotal += itemTotal * (item.tax / 100);
          }
        });
      } else {
        // Single item invoice
        subtotal = invoice.amount;
        // Check if there's tax info in the invoice
        if (invoice.taxRate && invoice.taxRate > 0) {
          const baseAmount = invoice.amount / (1 + invoice.taxRate / 100);
          subtotal = baseAmount;
          taxTotal = invoice.amount - baseAmount;
        }
      }
      
      const finalTotal = subtotal + taxTotal;
      
      // Totals section
      yPosition += 30;
      
      // Subtotal
      doc.fontSize(12)
         .fillColor('#64748b')
         .text('Subtotal:', 350, yPosition, { width: 100 })
         .text(`$${subtotal.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });
      
      yPosition += 20;
      
      // Tax (if applicable)
      if (taxTotal > 0) {
        doc.fontSize(12)
           .fillColor('#64748b')
           .text('Tax:', 350, yPosition, { width: 100 })
           .text(`$${taxTotal.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });
        
        yPosition += 20;
      }
      
      // Total line
      doc.moveTo(350, yPosition)
         .lineTo(550, yPosition)
         .strokeColor('#2E75B0')
         .lineWidth(2)
         .stroke();
      
      yPosition += 20;
      
      // Final total
      doc.fontSize(16)
         .fillColor('#2E75B0')
         .text('TOTAL AMOUNT:', 350, yPosition, { width: 120 })
         .fontSize(18)
         .fillColor('#1e293b')
         .text(`$${finalTotal.toFixed(2)}`, 480, yPosition, { width: 70, align: 'right' });
      
      // Notes section
      if (invoice.notes) {
        yPosition += 60;
        doc.fontSize(11)
           .fillColor('#2E75B0')
           .text('NOTES:', 50, yPosition);
        
        yPosition += 18;
        doc.fontSize(11)
           .fillColor('#64748b')
           .text(invoice.notes, 50, yPosition, { width: 500, lineGap: 2 });
      }
      
      // Footer with better positioning
      const footerY = Math.max(yPosition + 80, 720);
      
      doc.fontSize(9)
         .fillColor('#94a3b8')
         .text(`Generated by Billr • ${new Date().toLocaleDateString()}`, 50, footerY, { align: 'center', width: 500 });
      
      // Payment link
      if (invoice.paymentLink) {
        doc.fontSize(10)
           .fillColor('#2E75B0')
           .text(`Pay online: ${invoice.paymentLink}`, 50, footerY + 18, { align: 'center', width: 500 });
      }
      
      doc.end();
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      reject(error);
    }
  });
}

// Define secret for Resend API key
const resendApiKey = defineSecret('RESEND_API_KEY');

// Get app URL from Firebase config (set via 'firebase functions:config:set app.url=URL')
const getAppUrl = () => {
  try {
    const config = require('firebase-functions').config();
    console.log('📍 Firebase config app.url:', config.app?.url);
    return config.app?.url || 'http://localhost:3000';
  } catch (error) {
    console.error('❌ Error reading Firebase config:', error);
    return 'http://localhost:3000';
  }
};

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
    const senderName = userProfile?.displayName || request.auth.token.name || 'Jacob';
    const senderEmail = userProfile?.email || request.auth.token.email || 'awesomejucob23@gmail.com';

    // Generate payment link (force regenerate to use current URL config)
    const currentAppUrl = getAppUrl();
    invoice.paymentLink = `${currentAppUrl}/pay/${invoiceId}?amount=${invoice.amount.toFixed(2)}`;
    
    console.log('🔗 Generated payment link:', invoice.paymentLink);
    
    await db.collection('invoices').doc(invoiceId).update({
      paymentLink: invoice.paymentLink
    });

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
      emailHtml = generatePaymentReminderHTML(invoice, senderName, senderEmail);
    } else {
      emailSubject = `📄 Invoice #${invoice.number} - Payment Request`;
      emailHtml = generateInvoiceHTML(invoice, senderName, userProfile);
    }

    // Generate PDF attachment if requested
    let attachments = [];
    try {
      // Check if PDF should be attached (you can add a parameter for this)
      if (request.data.includePDF !== false) { // Default to true
        console.log('📄 Generating PDF attachment...');
        
        // Here we would generate the PDF using a server-side solution
        // For now, we'll create a placeholder
        const pdfContent = await generateInvoicePDF(invoice, senderName, senderEmail);
        
        attachments = [{
          filename: `Invoice-${invoice.number}.pdf`,
          content: pdfContent,
          type: 'application/pdf'
        }];
        
        console.log('✅ PDF attachment prepared');
      }
    } catch (pdfError) {
      console.warn('⚠️ PDF generation failed, sending email without attachment:', pdfError);
    }

    // Send email using Resend
    const emailData = {
      from: `${senderName} <invoices@billr.biz>`,
      to: [invoice.clientEmail],
      reply_to: senderEmail,
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments
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
    console.error('Error sending invoice email:', error);
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; color: #1e293b; line-height: 1.5;">
    
    <!-- Email Container -->
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #2E75B0 0%, #3B8BC7 50%, #4A9FD9 100%); padding: 48px 40px 48px 40px; text-align: center; position: relative;">
            <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                Billr
            </h1>
            <p style="margin: 0; color: #B8E2F2; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Professional Invoice
            </p>
          </div>
          
        <!-- Main Content -->
        <div style="padding: 48px 40px;">
            
            <!-- Greeting Section -->
            <div style="text-align: center; margin-bottom: 48px;">
                <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1e293b;">
                    Hi ${invoice.clientName || 'there'}! 👋
                </h2>
                <p style="margin: 0; font-size: 18px; color: #64748b; line-height: 1.7; max-width: 500px; margin-left: auto; margin-right: auto;">
                    I hope this email finds you well. Here's your invoice for our recent work together.
                </p>
            </div>

            <!-- Invoice Information Card -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e1f5fe 100%); border-radius: 16px; padding: 40px; margin-bottom: 40px; border: 2px solid #B8E2F2; box-shadow: 0 4px 20px rgba(46, 117, 176, 0.08);">
                
                <!-- Header Row -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #B8E2F2;">
                    <h3 style="margin: 0; font-size: 24px; font-weight: 800; color: #2E75B0;">
                        Invoice Details
                    </h3>
                    <div style="background: #2E75B0; color: #ffffff; padding: 12px 24px; border-radius: 30px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(46, 117, 176, 0.3);">
                        #${invoice.number}
                    </div>
                </div>
                
                <!-- Invoice Details Table -->
                <div style="margin-bottom: 40px;">
                    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #2E75B0, #3B8BC7);">
                                <th style="padding: 20px; text-align: left; color: #ffffff; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: none;">
                                    Service Description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 24px 20px; border: none; font-size: 18px; color: #1e293b; font-weight: 500; line-height: 1.6;">
                                    ${invoice.description}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Amount Due Section -->
                <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #ffffff, #f0f9ff); border-radius: 16px; border: 3px solid #89CFF0; margin-bottom: 32px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #3B8BC7; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                        Total Amount Due
                    </p>
                    <div style="margin: 0 0 24px 0; font-size: 64px; color: #2E75B0; font-weight: 900; text-shadow: 0 2px 4px rgba(46, 117, 176, 0.2); line-height: 1;">
                        $${invoice.amount.toFixed(2)}
                    </div>
                    <div style="display: inline-block; background: linear-gradient(135deg, #4A9FD9, #77C3EC); padding: 12px 32px; border-radius: 25px; box-shadow: 0 4px 12px rgba(119, 195, 236, 0.3);">
                        <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            Due: ${dueDate}
                        </p>
                    </div>
                </div>

                ${invoice.notes ? `
                <!-- Additional Notes Section -->
                <div style="margin-top: 32px; padding: 24px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3B8BC7;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #3B8BC7; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Additional Notes
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.7; font-weight: 500;">
                        ${invoice.notes}
                    </p>
                </div>
                ` : ''}
            </div>

            <!-- Payment Action Section -->
            <div style="text-align: center; margin-bottom: 48px; padding: 40px 32px; background: linear-gradient(135deg, #f8fafc 0%, #e1f5fe 100%); border-radius: 20px; border: 2px solid #B8E2F2;">
                <h3 style="margin: 0 0 32px 0; font-size: 24px; font-weight: 800; color: #2E75B0;">
                    Ready to Pay?
                </h3>
                <a href="${invoice.paymentLink || '#'}" style="display: inline-block; background: linear-gradient(135deg, #2E75B0 0%, #4A9FD9 100%); color: #ffffff; text-decoration: none; padding: 24px 56px; border-radius: 16px; font-weight: 800; font-size: 20px; letter-spacing: 0.5px; box-shadow: 0 12px 32px rgba(46, 117, 176, 0.4); text-shadow: 0 1px 2px rgba(0,0,0,0.2); transform: scale(1); transition: all 0.3s ease;">
                    Pay $${invoice.amount.toFixed(2)} Now
                </a>
                <div style="margin-top: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; color: #3B8BC7; font-weight: 600;">
                        Secure Payment • SSL Encrypted • Instant Processing
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic;">
                        Powered by industry-leading security standards
                    </p>
                </div>
            </div>
            
            <!-- Payment Methods Section -->
            <div style="margin-bottom: 48px; padding: 32px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #1e293b; text-align: center;">
                    Payment Methods Accepted
                </h4>
            <div style="text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.6;">
                        We accept all major credit cards, bank transfers, and digital payments. 
                        Click the "Pay Now" button above for secure, instant payment processing.
                    </p>
                </div>
            </div>
            
            <!-- Thank You Message -->
            <div style="text-align: center; margin-bottom: 40px; padding: 32px; background: linear-gradient(135deg, #ffffff, #f0f9ff); border-radius: 12px; border: 1px solid #B8E2F2;">
                <p style="margin: 0; font-size: 18px; color: #475569; line-height: 1.7; font-weight: 500; max-width: 480px; margin-left: auto; margin-right: auto;">
                    Thank you for choosing our services! If you have any questions about this invoice, please reach out anytime.
                </p>
          </div>
          
            <!-- Contact Information -->
            <div style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #cbd5e1;">
                <h4 style="margin: 0 0 20px 0; font-size: 16px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                    Questions? Contact Me:
                </h4>
                <div style="margin-bottom: 12px;">
                    <p style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700;">
                        ${senderName}
                    </p>
                </div>
                <div>
                    <a href="mailto:${userProfile?.email || 'contact@billr.biz'}" style="color: #2E75B0; text-decoration: none; font-size: 16px; font-weight: 600;">
                        ${userProfile?.email || 'contact@billr.biz'}
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer Section -->
        <div style="background: linear-gradient(135deg, #2E75B0 0%, #3B8BC7 100%); padding: 40px; text-align: center; position: relative;">
            <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 700;">
                    This invoice was sent from <span style="color: #B8E2F2; font-weight: 800;">Billr</span>
                </p>
            </div>
            <div style="margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px; color: #B8E2F2; font-weight: 600;">
                    Professional invoicing made simple
                </p>
            </div>
            <div style="padding-top: 20px; border-top: 1px solid rgba(184, 226, 242, 0.3);">
                <p style="margin: 0; font-size: 14px; color: #9DD9F3; font-weight: 500;">
                    Secure • Reliable • Professional
                </p>
          </div>
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
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%); padding: 40px 32px; text-align: center; position: relative; overflow: hidden;">
            <!-- Subtle pattern overlay -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 30px 30px; opacity: 0.3;"></div>
            
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; position: relative; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Payment Received!
            </h1>
            <p style="margin: 12px 0 0 0; color: #d1fae5; font-size: 16px; position: relative; font-weight: 500;">
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

// Generate payment reminder HTML (matches invoice design with red theme for overdue)
function generatePaymentReminderHTML(invoice, senderName, senderEmail) {
  const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate.toDate()).getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysOverdue > 0;
  
  const dueDate = new Date(invoice.dueDate.toDate()).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Color scheme based on overdue status
  const colors = isOverdue ? {
    primary: '#dc2626',      // red-600
    secondary: '#ef4444',    // red-500
    tertiary: '#f87171',     // red-400
    light: '#fef2f2',        // red-50
    border: '#fecaca',       // red-300
    text: '#991b1b',         // red-800
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
    headerText: '#fee2e2',   // red-100
    email: 'Payment Overdue'
  } : {
    primary: '#f59e0b',      // amber-500
    secondary: '#d97706',    // amber-600
    tertiary: '#fbbf24',     // amber-400
    light: '#fffbeb',        // amber-50
    border: '#fed7aa',       // amber-200
    text: '#92400e',         // amber-800
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #fbbf24 100%)',
    headerText: '#fef3c7',   // amber-100
    email: 'Payment Reminder'
  };

  return `
      <!DOCTYPE html>
<html lang="en">
      <head>
    <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${colors.email} - Invoice #${invoice.number}</title>
      </head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; color: #1e293b; line-height: 1.5;">
    
    <!-- Email Container -->
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        
        <!-- Header Section -->
        <div style="background: ${colors.gradient}; padding: 48px 40px 48px 40px; text-align: center; position: relative;">
            <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                Billr
            </h1>
            <p style="margin: 0; color: ${colors.headerText}; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                ${colors.email}
            </p>
          </div>
          
        <!-- Main Content -->
        <div style="padding: 48px 40px;">
            
            <!-- Greeting Section -->
            <div style="text-align: center; margin-bottom: 48px;">
                <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #1e293b;">
                    Hi ${invoice.clientName || 'there'}! ${isOverdue ? '⚠️' : '⏰'}
                </h2>
                <p style="margin: 0; font-size: 18px; color: #64748b; line-height: 1.7; max-width: 500px; margin-left: auto; margin-right: auto;">
                    ${isOverdue ? 
                      `This is a gentle reminder about an overdue payment. Your account needs immediate attention.` :
                      `This is a friendly reminder about an upcoming payment deadline.`
                    }
                </p>
            </div>

            <!-- Invoice Information Card -->
            <div style="background: linear-gradient(135deg, ${colors.light} 0%, #fefefe 100%); border-radius: 16px; padding: 40px; margin-bottom: 40px; border: 2px solid ${colors.border}; box-shadow: 0 4px 20px rgba(220, 38, 38, 0.08);">
                
                <!-- Header Row -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid ${colors.border};">
                    <h3 style="margin: 0; font-size: 24px; font-weight: 800; color: ${colors.primary};">
                        ${isOverdue ? 'Overdue Invoice' : 'Payment Due'}
                    </h3>
                    <div style="background: ${colors.primary}; color: #ffffff; padding: 12px 24px; border-radius: 30px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                        #${invoice.number}
                    </div>
                </div>
                
                <!-- Invoice Details Table -->
                <div style="margin-bottom: 40px;">
                    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <thead>
                            <tr style="background: ${colors.gradient};">
                                <th style="padding: 20px; text-align: left; color: #ffffff; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: none;">
                                    Service Description
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 24px 20px; border: none; font-size: 18px; color: #1e293b; font-weight: 500; line-height: 1.6;">
                                    ${invoice.description}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Amount Due Section -->
                <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #ffffff, ${colors.light}); border-radius: 16px; border: 3px solid ${colors.border}; margin-bottom: 32px;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: ${colors.text}; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                        ${isOverdue ? 'Overdue Amount' : 'Amount Due'}
                    </p>
                    <div style="margin: 0 0 24px 0; font-size: 64px; color: ${colors.primary}; font-weight: 900; text-shadow: 0 2px 4px rgba(220, 38, 38, 0.2); line-height: 1;">
                        $${invoice.amount.toFixed(2)}
                    </div>
                    <div style="display: inline-block; background: ${colors.gradient}; padding: 12px 32px; border-radius: 25px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                        <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            ${isOverdue ? `Overdue: ${daysOverdue} day${daysOverdue === 1 ? '' : 's'}` : `Due: ${dueDate}`}
                        </p>
                    </div>
                </div>

                ${isOverdue ? `
                <!-- Overdue Warning Section -->
                <div style="margin-top: 32px; padding: 24px; background: #fef2f2; border-radius: 12px; border-left: 4px solid #dc2626;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #dc2626; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Urgent: Payment Required
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #991b1b; line-height: 1.7; font-weight: 500;">
                        This invoice was due on ${dueDate} and is now ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue. 
                        Please submit payment immediately to avoid any service interruptions.
                    </p>
                </div>
                ` : ''}

                ${invoice.notes ? `
                <!-- Additional Notes Section -->
                <div style="margin-top: 32px; padding: 24px; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${colors.primary};">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${colors.primary}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Additional Notes
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.7; font-weight: 500;">
                        ${invoice.notes}
                    </p>
                </div>
                ` : ''}
            </div>

            <!-- Payment Action Section -->
            <div style="text-align: center; margin-bottom: 48px; padding: 40px 32px; background: linear-gradient(135deg, ${colors.light} 0%, #fefefe 100%); border-radius: 20px; border: 2px solid ${colors.border};">
                <h3 style="margin: 0 0 32px 0; font-size: 24px; font-weight: 800; color: ${colors.primary};">
                    ${isOverdue ? 'Pay Now to Avoid Further Delays' : 'Ready to Pay?'}
                </h3>
                <a href="${invoice.paymentLink || '#'}" style="display: inline-block; background: ${colors.gradient}; color: #ffffff; text-decoration: none; padding: 24px 56px; border-radius: 16px; font-weight: 800; font-size: 20px; letter-spacing: 0.5px; box-shadow: 0 12px 32px rgba(220, 38, 38, 0.4); text-shadow: 0 1px 2px rgba(0,0,0,0.2); transform: scale(1); transition: all 0.3s ease;">
                    Pay $${invoice.amount.toFixed(2)} Now
                </a>
                <div style="margin-top: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; color: ${colors.text}; font-weight: 600;">
                        Secure Payment • SSL Encrypted • Instant Processing
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic;">
                        ${isOverdue ? 'Process payment immediately to bring account current' : 'Powered by industry-leading security standards'}
                    </p>
                </div>
            </div>
            
            <!-- Payment Methods Section -->
            <div style="margin-bottom: 48px; padding: 32px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #1e293b; text-align: center;">
                    Payment Methods Accepted
                </h4>
            <div style="text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.6;">
                        We accept all major credit cards, bank transfers, and digital payments. 
                        Click the "Pay Now" button above for secure, instant payment processing.
                    </p>
                </div>
            </div>
            
            <!-- Thank You Message -->
            <div style="text-align: center; margin-bottom: 40px; padding: 32px; background: linear-gradient(135deg, #ffffff, ${colors.light}); border-radius: 12px; border: 1px solid ${colors.border};">
                <p style="margin: 0; font-size: 18px; color: #475569; line-height: 1.7; font-weight: 500; max-width: 480px; margin-left: auto; margin-right: auto;">
                    ${isOverdue ? 
                      `We appreciate your business and understanding. Please process this payment at your earliest convenience to maintain our good relationship.` :
                      `Thank you for your business! Please ensure payment is made by the due date to avoid any late fees.`
                    }
                </p>
          </div>
          
            <!-- Contact Information -->
            <div style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 12px; padding: 32px; text-align: center; border: 1px solid #cbd5e1;">
                <h4 style="margin: 0 0 20px 0; font-size: 16px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                    Questions? Contact Me:
                </h4>
                <div style="margin-bottom: 12px;">
                    <p style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700;">
                        ${senderName}
                    </p>
                </div>
                <div>
                    <a href="mailto:${senderEmail}" style="color: #2E75B0; text-decoration: none; font-size: 16px; font-weight: 600;">
                        ${senderEmail}
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer Section -->
        <div style="background: ${colors.gradient}; padding: 40px; text-align: center; position: relative;">
            <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-size: 18px; color: #ffffff; font-weight: 700;">
                    This ${isOverdue ? 'overdue notice' : 'reminder'} was sent from <span style="color: ${colors.headerText}; font-weight: 800;">Billr</span>
                </p>
            </div>
            <div style="margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px; color: ${colors.headerText}; font-weight: 600;">
                    Professional invoicing made simple
                </p>
            </div>
            <div style="padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.3);">
                <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8); font-weight: 500;">
                    Secure • Reliable • Professional
                </p>
          </div>
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

    // Generate demo payment link that points to our new PaymentPage component (include amount)
    const currentAppUrl = getAppUrl();
    const paymentLink = `${currentAppUrl}/pay/${invoiceId}?amount=${invoice.amount.toFixed(2)}`;
    
    console.log('🔗 Generated payment link in createPaymentLink:', paymentLink);

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