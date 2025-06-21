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

export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { loading: authLoading } = useAuth();

  // Real-time subscription to user's customers
  useEffect(() => {
    if (authLoading) return;
    
    if (!currentUser) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'customers'),
        where('userId', '==', currentUser.uid),
        orderBy('name', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const customerList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Customer[];
          setCustomers(customerList);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error fetching customers:', error);
          setError(`Failed to load customers: ${error.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error: any) {
      console.error('Error setting up customers subscription:', error);
      setError(`Failed to connect to database: ${error.message}`);
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  // Create new customer
  const createCustomer = async (data: CreateCustomerData): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const customerData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || '',
        address: data.address?.trim() || '',
        notes: data.notes?.trim() || '',
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        totalInvoicesSent: 0,
        totalAmountInvoiced: 0,
        totalAmountPaid: 0
      };

      const docRef = await addDoc(collection(db, 'customers'), customerData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      }
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  };

  // Update customer
  const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<void> => {
    try {
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, updates);
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId: string): Promise<void> => {
    try {
      const customerRef = doc(db, 'customers', customerId);
      await deleteDoc(customerRef);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  };

  // Search customers
  const searchCustomers = (searchTerm: string): Customer[] => {
    if (!searchTerm.trim()) return customers;
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.phone && customer.phone.includes(term))
    );
  };

  // Get customer by email
  const getCustomerByEmail = (email: string): Customer | undefined => {
    return customers.find(customer => 
      customer.email.toLowerCase() === email.toLowerCase()
    );
  };

  // Update customer stats after invoice creation/payment
  const updateCustomerStats = async (
    customerId: string, 
    invoiceAmount: number, 
    isPaid: boolean = false
  ): Promise<void> => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const updates: Partial<Customer> = {
        totalInvoicesSent: customer.totalInvoicesSent + 1,
        totalAmountInvoiced: customer.totalAmountInvoiced + invoiceAmount,
        lastInvoiceDate: Timestamp.now()
      };

      if (isPaid) {
        updates.totalAmountPaid = customer.totalAmountPaid + invoiceAmount;
      }

      await updateCustomer(customerId, updates);
    } catch (error) {
      console.error('Error updating customer stats:', error);
      // Don't throw here as this is not critical for invoice creation
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerByEmail,
    updateCustomerStats
  };
}; 