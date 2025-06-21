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
  Timestamp,
  getDocs
} from 'firebase/firestore';
// import { httpsCallable } from 'firebase/functions';
import { db } from '../firebase';
// import { functions } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Invoice {
  id: string;
  number: string;
  description: string;
  amount: number;
  clientEmail: string;
  clientName?: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Timestamp;
  dueDate: Timestamp;
  userId: string;
  paymentLink?: string;
  notes?: string;
}

export interface CreateInvoiceData {
  description: string;
  amount: number;
  clientEmail: string;
  clientName?: string;
  dueDate: Date;
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
      const invoicesRef = collection(db, 'invoices');
      console.log('useInvoices: Invoices collection ref:', invoicesRef);
      
      // Simplified query without orderBy to test if that's causing issues
      const q = query(
        invoicesRef,
        where('userId', '==', currentUser.uid)
      );
      console.log('useInvoices: Query created (without orderBy):', q);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('✅ useInvoices: Snapshot received successfully, docs count:', snapshot.docs.length);
          clearTimeout(loadingTimeout); // Clear timeout since we got data
          
          const invoiceData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Invoice[];
          
          // Sort manually by createdAt descending
          const sortedInvoices = invoiceData.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
          });
          
          console.log('useInvoices: Sorted invoice data:', sortedInvoices);
          setInvoices(sortedInvoices);
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
          
          // Check for common Firestore setup issues
          if (error.code === 'permission-denied') {
            setError('Permission denied - check Firestore rules');
          } else if (error.code === 'unavailable') {
            setError('Firestore is not available. Please check your internet connection.');
          } else if (error.code === 'failed-precondition') {
            setError('Firestore Database not created yet. Please create it in Firebase Console first.');
          } else if (error.code === 'not-found') {
            setError('Firestore project not found - check Firebase config');
          } else if (error.code === 'resource-exhausted') {
            setError('Firestore quota exceeded. Please try again later.');
          } else {
            setError(`Database error (${error.code}): ${error.message}`);
          }
          
          setLoading(false);
        }
      );

      // Cleanup function
      return () => {
        console.log('🧹 useInvoices: Cleaning up subscription');
        clearTimeout(loadingTimeout);
        unsubscribe();
      };
      
    } catch (error: any) {
      console.error('❌ useInvoices: Error setting up subscription:', error);
      clearTimeout(loadingTimeout);
      setError(`Failed to connect to database: ${error.message}`);
      setLoading(false);
    }
  }, [currentUser, authLoading]); // Add authLoading to dependencies

  // Create new invoice
  const createInvoice = async (data: CreateInvoiceData): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      console.log('🔥 Creating invoice with data:', data);
      console.log('🔥 Current user:', currentUser);
      console.log('🔥 Firebase db instance:', db);
      console.log('🔥 Firebase app instance:', db.app);
      console.log('🔥 Project ID from app:', db.app.options.projectId);
      
      const invoiceNumber = await generateInvoiceNumber();
      console.log('🔥 Generated invoice number:', invoiceNumber);
      
      const invoiceData = {
        number: invoiceNumber,
        description: data.description,
        amount: data.amount,
        clientEmail: data.clientEmail,
        clientName: data.clientName || '',
        status: 'pending' as const,
        createdAt: Timestamp.now(),
        dueDate: Timestamp.fromDate(data.dueDate),
        userId: currentUser.uid,
        notes: data.notes || '',
        paymentLink: `${window.location.origin}/pay/${invoiceNumber}`
      };

      console.log('🔥 Invoice data to save:', invoiceData);
      console.log('🔥 Trying to access collection...');
      
      const collectionRef = collection(db, 'invoices');
      console.log('🔥 Collection ref created:', collectionRef);
      
      const docRef = await addDoc(collectionRef, invoiceData);
      console.log('🔥 Invoice created successfully with ID:', docRef.id);
      
      return docRef.id;
    } catch (error: any) {
      console.error('🚨 Full error creating invoice:', error);
      console.error('🚨 Error code:', error.code);
      console.error('🚨 Error message:', error.message);
      console.error('🚨 Error stack:', error.stack);
      
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
  const sendInvoiceEmail = async (invoiceId: string): Promise<void> => {
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
    await updateInvoice(invoiceId, { status: 'paid' });
  };

  // Mark invoice as overdue
  const markAsOverdue = async (invoiceId: string): Promise<void> => {
    await updateInvoice(invoiceId, { status: 'overdue' });
  };

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoiceEmail,
    markAsPaid,
    markAsOverdue
  };
}; 