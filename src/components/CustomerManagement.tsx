import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { useCustomers, Customer, CreateCustomerData } from '../hooks/useCustomers';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: (data: CreateCustomerData) => Promise<void>;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customer, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateCustomerData>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    notes: customer?.notes || ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
        notes: customer?.notes || ''
      });
      setError('');
    }
  }, [isOpen, customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Customer name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Customer email is required');
      }

      await onSave({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim(),
        address: formData.address?.trim(),
        notes: formData.notes?.trim()
      });
      
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-brand-200/60 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-brand-200/40 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-800">
                  {customer ? 'Edit Customer' : 'Add Customer'}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-100/40 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50/80 border border-red-200/60 rounded-lg flex items-center gap-2 text-red-700 backdrop-blur-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-brand-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Customer's full name"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-brand-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="customer@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-brand-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-brand-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address, city, state"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional notes about this customer..."
                    className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm resize-none text-brand-800 placeholder-brand-400"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-medium rounded-lg shadow-brand hover:shadow-brand-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {customer ? 'Update' : 'Add'} Customer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const { 
    customers, 
    loading, 
    error, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer, 
    searchCustomers 
  } = useCustomers();

  const filteredCustomers = searchCustomers(searchTerm);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (data: CreateCustomerData) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, data);
    } else {
      await createCustomer(data);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-brand-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50/80 border border-red-200/60 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-800">Customers</h2>
          <p className="text-brand-600">Manage your customer contacts and view their history</p>
        </div>
        
        <button
          onClick={handleAddCustomer}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 flex items-center gap-2 shadow-brand hover:shadow-brand-lg"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-xl text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm"
        />
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-brand-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-700 mb-2">
            {searchTerm ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-brand-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Add your first customer to get started'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddCustomer}
              className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-300 shadow-brand hover:shadow-brand-lg"
            >
              Add Your First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white/80 backdrop-blur-xl border border-brand-200/60 rounded-xl shadow-brand hover:shadow-brand-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-800 mb-1">
                    {customer.name}
                  </h3>
                  <p className="text-brand-600 text-sm break-all">
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="text-brand-600 text-sm mt-1">
                      {customer.phone}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(customer.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100/40 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {customer.address && (
                <div className="flex items-center gap-2 text-sm text-brand-600 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-2">{customer.address}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-200/40">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-brand-600 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Invoices</span>
                  </div>
                  <p className="text-lg font-semibold text-brand-800">
                    {customer.totalInvoicesSent}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-brand-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Total</span>
                  </div>
                  <p className="text-lg font-semibold text-brand-800">
                    ${customer.totalAmountInvoiced.toFixed(0)}
                  </p>
                </div>
              </div>

              {customer.lastInvoiceDate && (
                <div className="flex items-center gap-2 text-xs text-brand-500 mt-3 pt-3 border-t border-brand-200/40">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Last invoice: {customer.lastInvoiceDate.toDate().toLocaleDateString()}
                  </span>
                </div>
              )}

              {customer.notes && (
                <div className="mt-3 pt-3 border-t border-brand-200/40">
                  <p className="text-sm text-brand-600 line-clamp-2">
                    {customer.notes}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white/90 backdrop-blur-xl border border-brand-200/60 rounded-xl p-6 max-w-sm mx-auto"
            >
              <h3 className="text-lg font-semibold text-brand-800 mb-2">
                Delete Customer
              </h3>
              <p className="text-brand-600 mb-6">
                Are you sure you want to delete this customer? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 text-brand-600 hover:text-brand-800 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCustomer(deleteConfirmId)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}; 