import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { LineItem, BusinessInfo, CreateInvoiceData } from './useInvoices';

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

export const useRecurringInvoices = () => {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { loading: authLoading } = useAuth();

  // Calculate next invoice date based on frequency
  const calculateNextInvoiceDate = (date: Date, frequency: string): Date => {
    const nextDate = new Date(date);
    
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

  // Real-time subscription to user's recurring invoices
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      setRecurringInvoices([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'recurringInvoices'),
        where('userId', '==', currentUser.uid),
        orderBy('templateName', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const recurringList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RecurringInvoice[];
          setRecurringInvoices(recurringList);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error fetching recurring invoices:', error);
          setError(`Failed to load recurring invoices: ${error.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error: any) {
      console.error('Error setting up recurring invoices subscription:', error);
      setError(`Failed to connect to database: ${error.message}`);
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  // Create new recurring invoice template
  const createRecurringInvoice = async (data: CreateRecurringInvoiceData): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const recurringData = {
        templateName: data.templateName.trim(),
        lineItems: data.lineItems,
        clientEmail: data.clientEmail.trim().toLowerCase(),
        clientName: data.clientName?.trim() || '',
        clientPhone: data.clientPhone?.trim() || '',
        businessInfo: data.businessInfo || {},
        frequency: data.frequency,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : undefined,
        nextInvoiceDate: Timestamp.fromDate(data.startDate),
        autoSend: data.autoSend,
        isActive: true,
        userId: currentUser.uid,
        notes: data.notes?.trim() || '',
        footer: data.footer?.trim() || '',
        createdAt: Timestamp.now(),
        totalInvoicesSent: 0
      };

      const docRef = await addDoc(collection(db, 'recurringInvoices'), recurringData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating recurring invoice:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      }
      throw new Error(`Failed to create recurring invoice: ${error.message}`);
    }
  };

  // Update recurring invoice
  const updateRecurringInvoice = async (recurringId: string, updates: Partial<RecurringInvoice>): Promise<void> => {
    try {
      const recurringRef = doc(db, 'recurringInvoices', recurringId);
      await updateDoc(recurringRef, updates);
    } catch (error: any) {
      console.error('Error updating recurring invoice:', error);
      throw new Error(`Failed to update recurring invoice: ${error.message}`);
    }
  };

  // Delete recurring invoice
  const deleteRecurringInvoice = async (recurringId: string): Promise<void> => {
    try {
      const recurringRef = doc(db, 'recurringInvoices', recurringId);
      await deleteDoc(recurringRef);
    } catch (error: any) {
      console.error('Error deleting recurring invoice:', error);
      throw new Error(`Failed to delete recurring invoice: ${error.message}`);
    }
  };

  // Pause/Resume recurring invoice
  const toggleRecurringInvoice = async (recurringId: string, isActive: boolean): Promise<void> => {
    await updateRecurringInvoice(recurringId, { isActive });
  };

  // Generate invoice from recurring template
  const generateInvoiceFromTemplate = (recurring: RecurringInvoice): CreateInvoiceData => {
    return {
      title: `${recurring.templateName} - ${recurring.frequency} invoice`,
      description: `${recurring.templateName} - ${recurring.frequency} invoice`,
      lineItems: recurring.lineItems,
      clientEmail: recurring.clientEmail,
      clientName: recurring.clientName,
      clientPhone: recurring.clientPhone,
      businessInfo: recurring.businessInfo,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: recurring.notes,
      footer: recurring.footer,
      status: 'pending'
    };
  };

  // Update recurring invoice after generating an invoice
  const recordInvoiceGenerated = async (recurringId: string): Promise<void> => {
    try {
      const recurring = recurringInvoices.find(r => r.id === recurringId);
      if (!recurring) return;

      const nextDate = calculateNextInvoiceDate(
        recurring.nextInvoiceDate.toDate(), 
        recurring.frequency
      );

      const updates: Partial<RecurringInvoice> = {
        lastInvoiceDate: Timestamp.now(),
        nextInvoiceDate: Timestamp.fromDate(nextDate),
        totalInvoicesSent: recurring.totalInvoicesSent + 1
      };

      // Check if we should deactivate based on end date
      if (recurring.endDate && nextDate > recurring.endDate.toDate()) {
        updates.isActive = false;
      }

      await updateRecurringInvoice(recurringId, updates);
    } catch (error) {
      console.error('Error recording invoice generation:', error);
      // Don't throw here as this is not critical
    }
  };

  // Get recurring invoices due for generation
  const getRecurringInvoicesDue = (): RecurringInvoice[] => {
    const now = new Date();
    return recurringInvoices.filter(recurring => 
      recurring.isActive && 
      recurring.nextInvoiceDate.toDate() <= now &&
      (!recurring.endDate || now <= recurring.endDate.toDate())
    );
  };

  // Get active recurring invoices
  const getActiveRecurringInvoices = (): RecurringInvoice[] => {
    return recurringInvoices.filter(recurring => recurring.isActive);
  };

  // Get paused recurring invoices
  const getPausedRecurringInvoices = (): RecurringInvoice[] => {
    return recurringInvoices.filter(recurring => !recurring.isActive);
  };

  return {
    recurringInvoices,
    loading,
    error,
    createRecurringInvoice,
    updateRecurringInvoice,
    deleteRecurringInvoice,
    toggleRecurringInvoice,
    generateInvoiceFromTemplate,
    recordInvoiceGenerated,
    getRecurringInvoicesDue,
    getActiveRecurringInvoices,
    getPausedRecurringInvoices,
    calculateNextInvoiceDate
  };
}; 