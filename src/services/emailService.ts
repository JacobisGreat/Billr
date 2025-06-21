import emailjs from '@emailjs/browser';

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
}

class EmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;
  private initialized: boolean = false;

  constructor() {
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
  }

  initialize() {
    if (!this.initialized && this.publicKey) {
      emailjs.init(this.publicKey);
      this.initialized = true;
    }
  }

  private validateConfig(): boolean {
    return !!(this.serviceId && this.templateId && this.publicKey);
  }

  // Send invoice email
  async sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        console.error('EmailJS configuration missing. Please set environment variables.');
        return false;
      }

      this.initialize();

      const templateParams: EmailTemplate = {
        to_email: data.clientEmail,
        to_name: data.clientName || 'Valued Customer',
        from_name: data.companyName || 'Your Company',
        from_email: 'invoices@yourcompany.com', // Replace with your email
        subject: `Invoice #${data.invoiceId} - ${data.description}`,
        message: this.generateInvoiceEmailContent(data),
        invoice_number: data.invoiceId,
        amount: `$${data.amount.toFixed(2)}`,
        due_date: data.dueDate.toLocaleDateString(),
        payment_link: data.paymentLink || '',
        company_name: data.companyName || 'Your Company'
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(data: InvoiceEmailData): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        console.error('EmailJS configuration missing.');
        return false;
      }

      this.initialize();

      const templateParams: EmailTemplate = {
        to_email: data.clientEmail,
        to_name: data.clientName || 'Valued Customer',
        from_name: data.companyName || 'Your Company',
        from_email: 'invoices@yourcompany.com',
        subject: `Payment Received - Invoice #${data.invoiceId}`,
        message: this.generatePaymentConfirmationContent(data),
        invoice_number: data.invoiceId,
        amount: `$${data.amount.toFixed(2)}`,
        company_name: data.companyName || 'Your Company'
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      return false;
    }
  }

  // Send payment reminder
  async sendPaymentReminder(data: InvoiceEmailData): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        console.error('EmailJS configuration missing.');
        return false;
      }

      this.initialize();

      const templateParams: EmailTemplate = {
        to_email: data.clientEmail,
        to_name: data.clientName || 'Valued Customer',
        from_name: data.companyName || 'Your Company',
        from_email: 'invoices@yourcompany.com',
        subject: `Payment Reminder - Invoice #${data.invoiceId}`,
        message: this.generatePaymentReminderContent(data),
        invoice_number: data.invoiceId,
        amount: `$${data.amount.toFixed(2)}`,
        due_date: data.dueDate.toLocaleDateString(),
        payment_link: data.paymentLink || '',
        company_name: data.companyName || 'Your Company'
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Failed to send payment reminder:', error);
      return false;
    }
  }

  private generateInvoiceEmailContent(data: InvoiceEmailData): string {
    return `
Dear ${data.clientName || 'Valued Customer'},

Thank you for your business! Please find your invoice details below:

Invoice Number: #${data.invoiceId}
Description: ${data.description}
Amount: $${data.amount.toFixed(2)}
Due Date: ${data.dueDate.toLocaleDateString()}

${data.paymentLink ? `You can pay online using this secure link: ${data.paymentLink}` : ''}

${data.notes ? `Additional Notes: ${data.notes}` : ''}

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
${data.companyName || 'Your Company'}
    `.trim();
  }

  private generatePaymentConfirmationContent(data: InvoiceEmailData): string {
    return `
Dear ${data.clientName || 'Valued Customer'},

Thank you! We have successfully received your payment for Invoice #${data.invoiceId}.

Payment Details:
- Invoice Number: #${data.invoiceId}
- Description: ${data.description}
- Amount Paid: $${data.amount.toFixed(2)}
- Payment Date: ${new Date().toLocaleDateString()}

Your account is now up to date. We appreciate your prompt payment and continued business.

Best regards,
${data.companyName || 'Your Company'}
    `.trim();
  }

  private generatePaymentReminderContent(data: InvoiceEmailData): string {
    const daysOverdue = Math.floor((new Date().getTime() - data.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysOverdue > 0;

    return `
Dear ${data.clientName || 'Valued Customer'},

This is a ${isOverdue ? 'payment reminder' : 'friendly reminder'} for Invoice #${data.invoiceId}.

Invoice Details:
- Invoice Number: #${data.invoiceId}
- Description: ${data.description}
- Amount Due: $${data.amount.toFixed(2)}
- Due Date: ${data.dueDate.toLocaleDateString()}
${isOverdue ? `- Days Overdue: ${daysOverdue}` : ''}

${data.paymentLink ? `You can pay securely online: ${data.paymentLink}` : ''}

${isOverdue ? 
  'Please remit payment as soon as possible to avoid any late fees.' : 
  'Please ensure payment is made by the due date to avoid any late fees.'
}

If you have any questions or need to discuss payment arrangements, please contact us immediately.

Best regards,
${data.companyName || 'Your Company'}
    `.trim();
  }

  // Test email configuration
  async testConfiguration(): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        console.error('EmailJS configuration is incomplete');
        return false;
      }

      this.initialize();

      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        from_name: 'Test Sender',
        subject: 'EmailJS Configuration Test',
        message: 'This is a test email to verify EmailJS configuration.'
      };

      // Note: This will actually try to send an email
      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        testParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('EmailJS configuration test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 