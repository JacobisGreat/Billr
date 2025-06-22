import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  getDocs
} from 'firebase/firestore';
// import { httpsCallable } from 'firebase/functions';
import { db, config } from '../firebase';
// import { functions } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax?: number; // percentage
  total: number; // calculated: quantity * unitPrice * (1 + tax/100)
}

export interface BusinessInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string; // URL to logo image
  website?: string;
}

export interface Invoice {
  id: string;
  number: string;
  description: string; // Keep for backwards compatibility
  amount: number; // Keep for backwards compatibility, but will be calculated from line items
  lineItems: LineItem[];
  subtotal: number; // calculated from line items
  taxTotal: number; // calculated from line items
  total: number; // subtotal + taxTotal
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  businessInfo?: BusinessInfo;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Timestamp;
  issueDate: Timestamp;
  dueDate: Timestamp;
  userId: string;
  paymentLink?: string;
  notes?: string;
  footer?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurringEndDate?: Timestamp;
  recurringId?: string; // Links to recurring template
  isTemplate?: boolean; // True if this is a recurring template, false if it's a generated invoice
  templateName?: string; // Name for the recurring template
  nextInvoiceDate?: Timestamp; // When the next invoice should be generated
  totalGenerated?: number; // How many invoices have been generated from this template
  isActive?: boolean; // Whether the recurring template is active
  paidAt?: Timestamp;
  paidMethod?: string;
  emailSent?: boolean;
  emailSentAt?: Timestamp;
  emailSentBy?: string; // User ID who sent the email
}

export interface RecurringInvoice {
  id: string;
  templateName: string;
  lineItems: LineItem[];
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  businessInfo?: BusinessInfo;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Timestamp;
  endDate?: Timestamp;
  nextInvoiceDate: Timestamp;
  autoSend: boolean;
  isActive: boolean;
  userId: string;
  notes?: string;
  footer?: string;
  createdAt: Timestamp;
  lastInvoiceDate?: Timestamp;
  totalInvoicesSent: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  userId: string;
  createdAt: Timestamp;
  lastInvoiceDate?: Timestamp;
  totalInvoicesSent: number;
  totalAmountInvoiced: number;
  totalAmountPaid: number;
}

export interface CreateInvoiceData {
  title: string; // Unified with scheduled invoices
  description: string; // Keep for backwards compatibility
  amount?: number; // Keep for backwards compatibility
  lineItems: LineItem[];
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  businessInfo?: BusinessInfo;
  issueDate?: Date;
  dueDate: Date;
  notes?: string;
  footer?: string;
  status?: 'draft' | 'pending' | 'paid';
  // Recurring options (for unified interface)
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurringEndDate?: Date;
  templateName?: string; // For recurring templates
  sendImmediately?: boolean;
  // New contact and payment options
  markAsPaid?: boolean;
  paidMethod?: string;
}

export interface CreateRecurringInvoiceData {
  templateName: string;
  lineItems: LineItem[];
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  businessInfo?: BusinessInfo;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  autoSend: boolean;
  notes?: string;
  footer?: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Import auth loading state
  const { loading: authLoading } = useAuth();

  // Generate unique invoice number
  const generateInvoiceNumber = async (): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef, 
      where('userId', '==', currentUser.uid)
    );
    
    const snapshot = await getDocs(q);
    const invoiceCount = snapshot.size + 1;
    
    return `INV-${Date.now()}-${invoiceCount.toString().padStart(3, '0')}`;
  };

  // Real-time subscription to user's invoices
  useEffect(() => {
    console.log('useInvoices: Auth loading:', authLoading, 'Current user:', currentUser);
    
    // Wait for auth to finish loading before doing anything
    if (authLoading) {
      console.log('useInvoices: Auth still loading, waiting...');
      return;
    }
    
    if (!currentUser) {
      console.log('useInvoices: No current user after auth loaded, clearing invoices');
      setInvoices([]);
      setLoading(false);
      return;
    }

    console.log('useInvoices: Auth loaded, setting up subscription for user:', currentUser.uid);

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout reached, stopping loading state');
      setLoading(false);
      setError('Loading timed out. Please refresh the page.');
    }, 10000); // 10 seconds

    try {
      const q = query(
        collection(db, 'invoices'),
        where('userId', '==', currentUser.uid)
        // orderBy('createdAt', 'desc') // Temporarily disabled until index is built
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          console.log('✅ useInvoices: Snapshot received successfully, docs count:', querySnapshot.docs.length);
          clearTimeout(loadingTimeout); // Clear timeout since we got data
          
          const invoiceList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Invoice[];
          setInvoices(invoiceList);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('❌ useInvoices: Firestore error details:', {
            code: error.code,
            message: error.message,
            details: error
          });
          
          clearTimeout(loadingTimeout); // Clear timeout since we got an error
          
          // Handle offline and other errors gracefully
          if (error.code === 'unavailable') {
            console.log('Firebase offline - keeping existing invoices if any');
            setLoading(false);
            // Don't set error for offline, just stop loading
          } else if (error.code === 'permission-denied') {
            setError('Permission denied - check Firestore rules');
            setLoading(false);
          } else if (error.code === 'failed-precondition') {
            setError('Firestore Database not created yet. Please create it in Firebase Console first.');
            setLoading(false);
          } else if (error.code === 'not-found') {
            setError('Firestore project not found - check Firebase config');
            setLoading(false);
          } else {
            setError(`Database error (${error.code}): ${error.message}`);
            setLoading(false);
          }
        }
      );

      // Return cleanup function
      return () => {
        console.log('🧹 useInvoices: Cleaning up subscription');
        clearTimeout(loadingTimeout);
        unsubscribe();
      };
    } catch (error: any) {
      console.error('❌ useInvoices: Error setting up subscription:', error);
      clearTimeout(loadingTimeout);
      
      if (error.code === 'unavailable') {
        console.log('Firebase offline - cannot set up listener');
        setLoading(false);
        // Don't show error for offline state
      } else {
        setError(`Failed to connect to database: ${error.message}`);
        setLoading(false);
      }
    }
  }, [currentUser, authLoading]); // Add authLoading to dependencies

  // Calculate next invoice date based on frequency
  const calculateNextInvoiceDate = (startDate: Date, frequency: string): Date => {
    const nextDate = new Date(startDate);
    
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  };

  // Update invoice email status
  const updateInvoiceEmailStatus = async (invoiceId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      await updateDoc(invoiceRef, {
        emailSent: true,
        emailSentAt: Timestamp.now(),
        emailSentBy: currentUser.uid
      });
    } catch (error: any) {
      console.error('Error updating invoice email status:', error);
      throw new Error(`Failed to update email status: ${error.message}`);
    }
  };

  // Create new invoice
  const createInvoice = async (data: CreateInvoiceData): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      console.log('🔥 Creating invoice with data:', data);
      
      const invoiceNumber = await generateInvoiceNumber();
      console.log('🔥 Generated invoice number:', invoiceNumber);
      
      // Smart status detection: Check if due date is in the past
      const now = new Date();
      const isOverdue = data.dueDate < now;
      
      // Determine invoice status
      let invoiceStatus = 'pending';
      if (data.markAsPaid) {
        invoiceStatus = 'paid';
      } else if (isOverdue) {
        invoiceStatus = 'overdue';
        console.log('🚨 Invoice created with overdue status (due date in past)');
      } else {
        invoiceStatus = data.status || 'pending';
      }

      const invoiceData: any = {
        number: invoiceNumber,
        description: data.description,
        amount: data.amount || 0,
        lineItems: data.lineItems,
        subtotal: data.lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
        taxTotal: data.lineItems.reduce((total, item) => total + (item.tax ? item.quantity * item.unitPrice * (item.tax / 100) : 0), 0),
        total: data.lineItems.reduce((total, item) => total + item.quantity * item.unitPrice * (1 + (item.tax ? item.tax / 100 : 0)), 0),
        clientEmail: data.clientEmail,
        clientName: data.clientName || '',
        clientPhone: data.clientPhone || '',
        businessInfo: data.businessInfo || {},
        status: invoiceStatus,
        createdAt: Timestamp.now(),
        issueDate: data.issueDate ? Timestamp.fromDate(data.issueDate) : Timestamp.fromDate(new Date()),
        dueDate: Timestamp.fromDate(data.dueDate),
        userId: currentUser.uid,
        notes: data.notes || '',
        footer: data.footer || '',
        paymentLink: `${config.paymentLinkPrefix}/${invoiceNumber}`,
        isRecurring: data.isRecurring || false
      };

      // Add payment information if marked as paid with smart date logic
      if (data.markAsPaid) {
        const now = new Date();
        const dueDate = data.dueDate;
        
        // Only use due date if it's clearly in the past (at least 1 day ago)
        // Otherwise use today's date to avoid future paid dates
        const oneDayAgo = new Date();
        oneDayAgo.setDate(now.getDate() - 1);
        
        if (dueDate <= oneDayAgo) {
          invoiceData.paidAt = Timestamp.fromDate(dueDate);
          console.log('📅 Using due date as paid date:', dueDate, 'for invoice:', data.description);
        } else {
          invoiceData.paidAt = Timestamp.now();
          console.log('📅 Using today as paid date for invoice:', data.description, 'due date was:', dueDate);
        }
        
        invoiceData.paidMethod = data.paidMethod || 'Cash/E-transfer';
      }

      // Handle recurring invoices: create regular invoice first
      console.log('🔥 Invoice data to save (regular invoice):', invoiceData);
      
      const collectionRef = collection(db, 'invoices');
      const docRef = await addDoc(collectionRef, invoiceData);
      console.log('🔥 Regular invoice created successfully with ID:', docRef.id);
      
      // If recurring, also create a template for future invoices
      if (data.isRecurring && data.recurringFrequency) {
        console.log('🔄 Creating recurring template...');
        
        const templateData: any = {
          ...invoiceData, // Copy all invoice data
          number: `TEMPLATE-${invoiceNumber}`, // Different number for template
          description: data.templateName || `${data.description} (${data.recurringFrequency})`,
          isTemplate: true,
          templateName: data.templateName || `${data.description} (${data.recurringFrequency})`,
          recurringFrequency: data.recurringFrequency,
          nextInvoiceDate: Timestamp.fromDate(calculateNextInvoiceDate(data.dueDate, data.recurringFrequency)),
          totalGenerated: 1, // We already generated one (the regular invoice)
          isActive: true,
          status: 'draft', // Templates are drafts
          isRecurring: true
        };
        
        if (data.recurringEndDate) {
          templateData.recurringEndDate = Timestamp.fromDate(data.recurringEndDate);
        }
        
        console.log('🔄 Template data to save:', templateData);
        const templateDocRef = await addDoc(collectionRef, templateData);
        console.log('🔄 Recurring template created successfully with ID:', templateDocRef.id);
      }
      
      return docRef.id;
    } catch (error: any) {
      console.error('🚨 Full error creating invoice:', error);
      
      // Provide specific error messages for common issues
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      } else if (error.code === 'unavailable') {
        throw new Error('Database is unavailable. Please check your internet connection.');
      } else if (error.code === 'failed-precondition') {
        throw new Error('Firestore Database not created yet. Please create it in Firebase Console first.');
      } else if (error.code === 'not-found') {
        throw new Error('Project or database not found. Please check Firebase configuration.');
      } else if (error.message.includes('indexes')) {
        throw new Error('Database index missing. This should auto-create, please try again.');
      } else {
        throw new Error(`Failed to create invoice (${error.code}): ${error.message}`);
      }
    }
  };

  // Update invoice
  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>): Promise<void> => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      await updateDoc(invoiceRef, updates);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }
  };

  // Edit invoice with full CreateInvoiceData structure
  const editInvoice = async (invoiceId: string, data: CreateInvoiceData): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      // Get existing invoice to check current payment status
      const existingInvoice = invoices.find(inv => inv.id === invoiceId);
      
      // Smart status detection for editing: Check if due date is in the past
      const now = new Date();
      const isOverdue = data.dueDate < now;
      
      // Determine invoice status for editing
      let invoiceStatus = existingInvoice?.status || 'pending';
      if (data.markAsPaid) {
        invoiceStatus = 'paid';
      } else if (existingInvoice?.status !== 'paid' && isOverdue) {
        // Only change to overdue if not already paid and due date is in past
        invoiceStatus = 'overdue';
        console.log('🚨 Invoice updated with overdue status (due date in past)');
      } else if (existingInvoice?.status === 'overdue' && !isOverdue) {
        // If due date moved to future and was overdue, change back to pending
        invoiceStatus = 'pending';
        console.log('📅 Invoice status changed from overdue to pending (due date moved to future)');
      }

      const invoiceData: any = {
        description: data.description,
        amount: data.amount || 0,
        lineItems: data.lineItems,
        subtotal: data.lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
        taxTotal: data.lineItems.reduce((total, item) => total + (item.tax ? item.quantity * item.unitPrice * (item.tax / 100) : 0), 0),
        total: data.lineItems.reduce((total, item) => total + item.quantity * item.unitPrice * (1 + (item.tax ? item.tax / 100 : 0)), 0),
        clientEmail: data.clientEmail,
        clientName: data.clientName || '',
        clientPhone: data.clientPhone || '',
        businessInfo: data.businessInfo || {},
        status: invoiceStatus,
        issueDate: data.issueDate ? Timestamp.fromDate(data.issueDate) : Timestamp.fromDate(new Date()),
        dueDate: Timestamp.fromDate(data.dueDate),
        notes: data.notes || '',
        footer: data.footer || '',
        isRecurring: data.isRecurring || false
      };

      // Handle payment status updates with smart date logic
      if (data.markAsPaid && !existingInvoice?.paidAt) {
        const now = new Date();
        const dueDate = data.dueDate;
        
        invoiceData.status = 'paid';
        
        // Only use due date if it's clearly in the past (at least 1 day ago)
        // Otherwise use today's date to avoid future paid dates
        const oneDayAgo = new Date();
        oneDayAgo.setDate(now.getDate() - 1);
        
        if (dueDate <= oneDayAgo) {
          invoiceData.paidAt = Timestamp.fromDate(dueDate);
          console.log('📅 Edit: Using due date as paid date:', dueDate, 'for invoice:', data.description);
        } else {
          invoiceData.paidAt = Timestamp.now();
          console.log('📅 Edit: Using today as paid date for invoice:', data.description, 'due date was:', dueDate);
        }
        
        invoiceData.paidMethod = data.paidMethod || 'Cash/E-transfer';
      } else if (!data.markAsPaid && data.status) {
        invoiceData.status = data.status;
        // If unmarking as paid, remove payment info
        if (data.status !== 'paid') {
          invoiceData.paidAt = null;
          invoiceData.paidMethod = null;
        }
      }

      // Add recurring fields if this is a recurring invoice
      if (data.isRecurring && data.recurringFrequency) {
        invoiceData.recurringFrequency = data.recurringFrequency;
        if (data.recurringEndDate) {
          invoiceData.recurringEndDate = Timestamp.fromDate(data.recurringEndDate);
        }
      } else {
        // Remove recurring fields if not recurring
        invoiceData.recurringFrequency = null;
        invoiceData.recurringEndDate = null;
      }

      const invoiceRef = doc(db, 'invoices', invoiceId);
      await updateDoc(invoiceRef, invoiceData);
    } catch (error: any) {
      console.error('Error editing invoice:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      }
      throw new Error(`Failed to edit invoice: ${error.message}`);
    }
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId: string): Promise<void> => {
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId);
      await deleteDoc(invoiceRef);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  };

  // Send invoice email
  const sendInvoiceEmail = async (_invoiceId: string): Promise<void> => {
    try {
      // TODO: Re-enable when Firebase Functions are deployed on Blaze plan
      console.log('Email feature temporarily disabled - upgrade to Blaze plan to enable');
      // const sendEmail = httpsCallable(functions, 'sendInvoiceEmail');
      // await sendEmail({ invoiceId });
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw new Error('Failed to send invoice email');
    }
  };

  // Mark invoice as paid
  const markAsPaid = async (invoiceId: string): Promise<void> => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    
    const now = new Date();
    const dueDate = invoice.dueDate.toDate();
    
    // Use smart date logic: if due date is in the past, use due date as paid date
    // Otherwise use current date to avoid future paid dates
    const oneDayAgo = new Date();
    oneDayAgo.setDate(now.getDate() - 1);
    
    const paidDate = dueDate <= oneDayAgo ? dueDate : now;
    
    await updateInvoice(invoiceId, { 
      status: 'paid',
      paidAt: Timestamp.fromDate(paidDate),
      paidMethod: 'Cash/E-transfer'
    });
    
    console.log('📅 Invoice marked as paid:', invoiceId, 'paid date:', paidDate);
  };

  // Mark invoice as overdue
  const markAsOverdue = async (invoiceId: string): Promise<void> => {
    await updateInvoice(invoiceId, { status: 'overdue' });
  };

  // Create customer from invoice data
  const createCustomerFromInvoice = async (invoiceData: CreateInvoiceData): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const customerData = {
        name: invoiceData.clientName || 'No name provided',
        email: invoiceData.clientEmail,
        phone: invoiceData.clientPhone || '',
        address: '',
        notes: `Created from invoice: ${invoiceData.description}`,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        totalInvoicesSent: 1,
        totalAmountInvoiced: invoiceData.amount || 0,
        totalAmountPaid: invoiceData.markAsPaid ? (invoiceData.amount || 0) : 0
      };

      const docRef = await addDoc(collection(db, 'customers'), customerData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  };

  // Generate invoice from recurring template
  const generateInvoiceFromTemplate = async (templateId: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      // Find the template
      const template = invoices.find(inv => inv.id === templateId && inv.isTemplate);
      if (!template) {
        throw new Error('Recurring template not found');
      }

      // Check if template is still active
      if (!template.isActive) {
        throw new Error('Recurring template is not active');
      }

      // Check if we've reached the end date
      if (template.recurringEndDate && new Date() > template.recurringEndDate.toDate()) {
        // Deactivate the template
        await updateInvoice(templateId, { isActive: false });
        throw new Error('Recurring template has reached its end date');
      }

      // Generate new invoice number
      const invoiceNumber = await generateInvoiceNumber();

      // Create new invoice from template
      const newInvoiceData: any = {
        number: invoiceNumber,
        description: `${template.description} - ${template.recurringFrequency} #${(template.totalGenerated || 0) + 1}`,
        amount: template.amount,
        lineItems: template.lineItems,
        subtotal: template.subtotal,
        taxTotal: template.taxTotal,
        total: template.total,
        clientEmail: template.clientEmail,
        clientName: template.clientName || '',
        clientPhone: template.clientPhone || '',
        businessInfo: template.businessInfo || {},
        status: 'pending',
        createdAt: Timestamp.now(),
        issueDate: Timestamp.now(),
        dueDate: template.nextInvoiceDate || Timestamp.now(),
        userId: currentUser.uid,
        notes: template.notes || '',
        footer: template.footer || '',
        paymentLink: `${config.paymentLinkPrefix}/${invoiceNumber}`,
        isRecurring: false, // Individual invoices are not recurring
        isTemplate: false, // This is a generated invoice, not a template
        recurringId: templateId // Link back to the template
      };

      // Create the new invoice
      const docRef = await addDoc(collection(db, 'invoices'), newInvoiceData);

      // Update the template with new next invoice date and count
      const nextDate = calculateNextInvoiceDate(
        template.nextInvoiceDate?.toDate() || new Date(),
        template.recurringFrequency!
      );

      const templateUpdates: any = {
        nextInvoiceDate: Timestamp.fromDate(nextDate),
        totalGenerated: (template.totalGenerated || 0) + 1
      };

      // Check if we should deactivate after generating this invoice
      if (template.recurringEndDate && nextDate > template.recurringEndDate.toDate()) {
        templateUpdates.isActive = false;
      }

      await updateInvoice(templateId, templateUpdates);

      console.log(`Generated invoice ${invoiceNumber} from template ${template.templateName}`);
      return docRef.id;
    } catch (error: any) {
      console.error('Error generating invoice from template:', error);
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  };

  // Get all recurring templates
  const getRecurringTemplates = (): Invoice[] => {
    return invoices.filter(invoice => invoice.isTemplate === true);
  };

  // Get invoices generated from a specific template
  const getInvoicesFromTemplate = (templateId: string): Invoice[] => {
    return invoices.filter(invoice => invoice.recurringId === templateId);
  };

  // Get templates that are due for invoice generation
  const getTemplatesDueForGeneration = (): Invoice[] => {
    const now = new Date();
    return invoices.filter(invoice => 
      invoice.isTemplate === true &&
      invoice.isActive === true &&
      invoice.nextInvoiceDate &&
      invoice.nextInvoiceDate.toDate() <= now &&
      (!invoice.recurringEndDate || now <= invoice.recurringEndDate.toDate())
    );
  };

  // Toggle recurring template active status
  const toggleRecurringTemplate = async (templateId: string, isActive: boolean): Promise<void> => {
    await updateInvoice(templateId, { isActive });
  };

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    editInvoice,
    deleteInvoice,
    sendInvoiceEmail,
    markAsPaid,
    markAsOverdue,
    createCustomerFromInvoice,
    generateInvoiceFromTemplate,
    getRecurringTemplates,
    getInvoicesFromTemplate,
    getTemplatesDueForGeneration,
    toggleRecurringTemplate,
    updateInvoiceEmailStatus
  };
}; 