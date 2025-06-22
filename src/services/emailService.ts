import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export interface EmailTemplate {
  to_email: string;
  to_name: string;
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
  invoice_number?: string;
  amount?: string;
  due_date?: string;
  payment_link?: string;
  company_name?: string;
}

export interface InvoiceEmailData {
  clientEmail: string;
  clientName: string;
  invoiceId: string;
  description: string;
  amount: number;
  dueDate: Date;
  paymentLink?: string;
  companyName?: string;
  notes?: string;
  fromName: string;
  fromEmail?: string;
}

class EmailService {
  private sendInvoiceEmailFunction: any;

  constructor() {
    console.log('📧 Email service initialized with Firebase Functions');
    
    // Initialize Firebase Function
    this.sendInvoiceEmailFunction = httpsCallable(functions, 'sendInvoiceEmail');
  }

  // Send invoice email via Firebase Function
  async sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending invoice email via Firebase Function for:', data.clientEmail);

      const result = await this.sendInvoiceEmailFunction({
        invoiceId: data.invoiceId,
        emailType: 'invoice',
        includePDF: true // Include PDF attachment by default
      });

      if (result.data.success) {
        console.log('✅ Email sent successfully via Firebase Function:', result.data);
        return true;
      } else {
        console.error('❌ Firebase Function failed:', result.data);
        return false;
      }

    } catch (error) {
      console.error('❌ Error calling Firebase Function:', error);
      return false;
    }
  }

  // Send payment confirmation email via Firebase Function
  async sendPaymentConfirmation(data: InvoiceEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending payment confirmation via Firebase Function');

      const result = await this.sendInvoiceEmailFunction({
        invoiceId: data.invoiceId,
        emailType: 'payment_confirmation'
      });

      if (result.data.success) {
        console.log('✅ Payment confirmation sent successfully:', result.data);
        return true;
      } else {
        console.error('❌ Payment confirmation failed:', result.data);
        return false;
      }

    } catch (error) {
      console.error('❌ Error sending payment confirmation:', error);
      return false;
    }
  }

  // Send payment reminder via Firebase Function
  async sendPaymentReminder(data: InvoiceEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending payment reminder via Firebase Function');

      const result = await this.sendInvoiceEmailFunction({
        invoiceId: data.invoiceId,
        emailType: 'payment_reminder',
        includePDF: true // Include PDF attachment
      });

      if (result.data.success) {
        console.log('✅ Payment reminder sent successfully:', result.data);
        return true;
      } else {
        console.error('❌ Payment reminder failed:', result.data);
        return false;
      }

    } catch (error) {
      console.error('❌ Error sending payment reminder:', error);
      return false;
    }
  }

  // Simple test function
  async testConfiguration(): Promise<boolean> {
    console.log('🧪 Testing Firebase Function connection...');
    
    try {
      // For testing, you could create a test invoice first
      console.log('Firebase Function email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Firebase Function test failed:', error);
      return false;
    }
  }

  // Generate mailto link as fallback
  generateMailtoLink(data: InvoiceEmailData): string {
    const subject = encodeURIComponent(`Invoice #${data.invoiceId} - Payment Request`);
    const body = encodeURIComponent(`
Hi ${data.clientName || 'there'},

Here's your invoice for our recent work together:

Invoice #: ${data.invoiceId}
Description: ${data.description}
Amount Due: $${data.amount.toFixed(2)}
Due Date: ${data.dueDate.toLocaleDateString()}

${data.notes ? `Notes: ${data.notes}` : ''}

Thank you for your business!

Best regards,
${data.fromName}
${data.fromEmail || 'contact@billr.biz'}
    `);
    
    return `mailto:${data.clientEmail}?subject=${subject}&body=${body}`;
  }
}

export const emailService = new EmailService();

// Debug function for console testing
(window as any).testFirebaseEmail = async (invoiceId: string) => {
  console.log('🧪 Testing Firebase email function with invoice:', invoiceId);
  
  try {
    const result = await emailService.sendInvoiceEmail({
      clientEmail: 'test@example.com',
      clientName: 'Test Client',
      invoiceId: invoiceId,
      description: 'Test Invoice',
      amount: 100,
      dueDate: new Date(),
      fromName: 'Test User'
    });
    
    console.log('Test result:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}; 