import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface StripePaymentData {
  amount: number;
  currency: string;
  description: string;
  invoiceId: string;
  clientEmail: string;
  clientName?: string;
}

export interface PaymentLinkData extends StripePaymentData {
  successUrl?: string;
  cancelUrl?: string;
}

class StripeService {
  private stripe: any = null;

  async initialize() {
    if (!this.stripe) {
      this.stripe = await stripePromise;
    }
    return this.stripe;
  }

  // Create a payment link for the invoice
  async createPaymentLink(data: PaymentLinkData): Promise<string> {
    try {
      // This would typically be done on your backend
      // For demo purposes, we'll create a client-side checkout session
      const stripe = await this.initialize();
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // In a real app, you'd call your backend API here
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Convert to cents
          currency: data.currency || 'usd',
          description: data.description,
          invoiceId: data.invoiceId,
          customerEmail: data.clientEmail,
          customerName: data.clientName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error('Failed to create payment link');
    }
  }

  // Redirect to Stripe Checkout (alternative approach)
  async redirectToCheckout(data: PaymentLinkData): Promise<void> {
    try {
      const stripe = await this.initialize();
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Call your backend to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100),
          currency: data.currency || 'usd',
          description: data.description,
          invoiceId: data.invoiceId,
          customerEmail: data.clientEmail,
          successUrl: data.successUrl || `${window.location.origin}/payment-success`,
          cancelUrl: data.cancelUrl || `${window.location.origin}/payment-cancelled`,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw new Error('Failed to redirect to payment');
    }
  }

  // Generate a shareable payment link (for email)
  generatePaymentUrl(invoiceId: string, amount: number): string {
    // This would typically be a link to your payment page
    const baseUrl = window.location.origin;
    return `${baseUrl}/pay/${invoiceId}?amount=${amount}`;
  }

  // Verify payment status
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/verify-payment/${paymentIntentId}`);
      const { status } = await response.json();
      return status === 'succeeded';
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }
}

export const stripeService = new StripeService(); 