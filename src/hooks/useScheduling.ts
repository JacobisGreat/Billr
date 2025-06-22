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

export interface ScheduledInvoice {
  id: string;
  title: string;
  description: string;
  lineItems: LineItem[];
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  businessInfo?: BusinessInfo;
  scheduledDate: Timestamp;
  sendImmediately: boolean;
  isRecurring: boolean;
  recurringId?: string;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurringEndDate?: Timestamp;
  status: 'scheduled' | 'sent' | 'cancelled';
  userId: string;
  notes?: string;
  footer?: string;
  createdAt: Timestamp;
  lastSentAt?: Timestamp;
  nextSendDate?: Timestamp;
  totalSent: number;
}

export interface CreateScheduledInvoiceData {
  title: string;
  description: string;
  lineItems: LineItem[];
  clientEmail: string;
  clientName?: string;
  clientPhone?: string;
  businessInfo?: BusinessInfo;
  scheduledDate: Date;
  sendImmediately?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurringEndDate?: Date;
  notes?: string;
  footer?: string;
}

export interface ScheduleBatch {
  id: string;
  name: string;
  scheduledInvoices: string[]; // Array of scheduled invoice IDs
  userId: string;
  createdAt: Timestamp;
  totalInvoices: number;
}

export const useScheduling = () => {
  const [scheduledInvoices, setScheduledInvoices] = useState<ScheduledInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { loading: authLoading } = useAuth();

  // Calculate next occurrence for recurring schedules
  const calculateNextOccurrence = (date: Date, frequency: string): Date => {
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

  // Real-time subscription to user's scheduled invoices
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      setScheduledInvoices([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'scheduledInvoices'),
        where('userId', '==', currentUser.uid),
        orderBy('scheduledDate', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const scheduledList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ScheduledInvoice[];
          setScheduledInvoices(scheduledList);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error fetching scheduled invoices:', error);
          setError(`Failed to load scheduled invoices: ${error.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error: any) {
      console.error('Error setting up scheduled invoices subscription:', error);
      setError(`Failed to connect to database: ${error.message}`);
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  // Create new scheduled invoice
  const createScheduledInvoice = async (data: CreateScheduledInvoiceData): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const scheduledData: any = {
        title: data.title.trim(),
        description: data.description.trim(),
        lineItems: data.lineItems,
        clientEmail: data.clientEmail.trim().toLowerCase(),
        clientName: data.clientName?.trim() || '',
        clientPhone: data.clientPhone?.trim() || '',
        businessInfo: data.businessInfo || {},
        scheduledDate: Timestamp.fromDate(data.scheduledDate),
        sendImmediately: data.sendImmediately || false,
        isRecurring: data.isRecurring || false,
        status: 'scheduled' as const,
        userId: currentUser.uid,
        notes: data.notes?.trim() || '',
        footer: data.footer?.trim() || '',
        createdAt: Timestamp.now(),
        totalSent: 0
      };

      // Only add optional fields if they have values
      if (data.recurringFrequency) {
        scheduledData.recurringFrequency = data.recurringFrequency;
      }
      
      if (data.recurringEndDate) {
        scheduledData.recurringEndDate = Timestamp.fromDate(data.recurringEndDate);
      }
      
      if (data.isRecurring) {
        scheduledData.nextSendDate = Timestamp.fromDate(data.scheduledDate);
      }

      const docRef = await addDoc(collection(db, 'scheduledInvoices'), scheduledData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating scheduled invoice:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      }
      throw new Error(`Failed to create scheduled invoice: ${error.message}`);
    }
  };

  // Update scheduled invoice
  const updateScheduledInvoice = async (scheduledId: string, updates: Partial<ScheduledInvoice>): Promise<void> => {
    try {
      const scheduledRef = doc(db, 'scheduledInvoices', scheduledId);
      await updateDoc(scheduledRef, updates);
    } catch (error: any) {
      console.error('Error updating scheduled invoice:', error);
      throw new Error(`Failed to update scheduled invoice: ${error.message}`);
    }
  };

  // Delete scheduled invoice
  const deleteScheduledInvoice = async (scheduledId: string): Promise<void> => {
    try {
      const scheduledRef = doc(db, 'scheduledInvoices', scheduledId);
      await deleteDoc(scheduledRef);
    } catch (error: any) {
      console.error('Error deleting scheduled invoice:', error);
      throw new Error(`Failed to delete scheduled invoice: ${error.message}`);
    }
  };

  // Cancel scheduled invoice
  const cancelScheduledInvoice = async (scheduledId: string): Promise<void> => {
    await updateScheduledInvoice(scheduledId, { status: 'cancelled' });
  };

  // Generate invoice data from scheduled invoice
  const generateInvoiceFromScheduled = (scheduled: ScheduledInvoice): CreateInvoiceData => {
    return {
      title: scheduled.title,
      description: scheduled.description,
      lineItems: scheduled.lineItems,
      clientEmail: scheduled.clientEmail,
      clientName: scheduled.clientName,
      clientPhone: scheduled.clientPhone,
      businessInfo: scheduled.businessInfo,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: scheduled.notes,
      footer: scheduled.footer,
      status: 'pending'
    };
  };

  // Mark scheduled invoice as sent and handle recurring
  const markScheduledAsSent = async (scheduledId: string): Promise<void> => {
    try {
      const scheduled = scheduledInvoices.find(s => s.id === scheduledId);
      if (!scheduled) return;

      const updates: Partial<ScheduledInvoice> = {
        lastSentAt: Timestamp.now(),
        totalSent: scheduled.totalSent + 1
      };

      if (scheduled.isRecurring && scheduled.recurringFrequency) {
        const nextDate = calculateNextOccurrence(
          scheduled.scheduledDate.toDate(), 
          scheduled.recurringFrequency
        );

        // Check if we should continue recurring
        if (!scheduled.recurringEndDate || nextDate <= scheduled.recurringEndDate.toDate()) {
          updates.nextSendDate = Timestamp.fromDate(nextDate);
          updates.scheduledDate = Timestamp.fromDate(nextDate);
        } else {
          updates.status = 'sent';
        }
      } else {
        updates.status = 'sent';
      }

      await updateScheduledInvoice(scheduledId, updates);
    } catch (error) {
      console.error('Error marking scheduled as sent:', error);
      throw error;
    }
  };

  // Get scheduled invoices for a specific date
  const getScheduledInvoicesForDate = (date: Date): ScheduledInvoice[] => {
    const dateStr = date.toDateString();
    return scheduledInvoices.filter(scheduled => 
      scheduled.status === 'scheduled' &&
      scheduled.scheduledDate.toDate().toDateString() === dateStr
    );
  };

  // Get upcoming scheduled invoices (next 7 days)
  const getUpcomingScheduledInvoices = (): ScheduledInvoice[] => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return scheduledInvoices.filter(scheduled => 
      scheduled.status === 'scheduled' &&
      scheduled.scheduledDate.toDate() >= now &&
      scheduled.scheduledDate.toDate() <= nextWeek
    );
  };

  // Get overdue scheduled invoices
  const getOverdueScheduledInvoices = (): ScheduledInvoice[] => {
    const now = new Date();
    return scheduledInvoices.filter(scheduled => 
      scheduled.status === 'scheduled' &&
      scheduled.scheduledDate.toDate() < now
    );
  };

  // Get all dates that have scheduled invoices
  const getScheduledDates = (): Date[] => {
    const dates = scheduledInvoices
      .filter(scheduled => scheduled.status === 'scheduled')
      .map(scheduled => scheduled.scheduledDate.toDate());
    
    // Remove duplicates
    return Array.from(new Set(dates.map(d => d.toDateString()))).map(d => new Date(d));
  };

  // Batch schedule multiple invoices
  const createBatchSchedule = async (
    invoices: CreateScheduledInvoiceData[], 
    batchName: string
  ): Promise<string[]> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const scheduledIds: string[] = [];
      
      // Create all scheduled invoices
      for (const invoice of invoices) {
        const id = await createScheduledInvoice(invoice);
        scheduledIds.push(id);
      }

      // Create batch record
      const batchData = {
        name: batchName,
        scheduledInvoices: scheduledIds,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        totalInvoices: invoices.length
      };

      await addDoc(collection(db, 'scheduleBatches'), batchData);
      
      return scheduledIds;
    } catch (error: any) {
      console.error('Error creating batch schedule:', error);
      throw new Error(`Failed to create batch schedule: ${error.message}`);
    }
  };

  return {
    scheduledInvoices,
    loading,
    error,
    createScheduledInvoice,
    updateScheduledInvoice,
    deleteScheduledInvoice,
    cancelScheduledInvoice,
    generateInvoiceFromScheduled,
    markScheduledAsSent,
    getScheduledInvoicesForDate,
    getUpcomingScheduledInvoices,
    getOverdueScheduledInvoices,
    getScheduledDates,
    createBatchSchedule,
    calculateNextOccurrence
  };
}; 