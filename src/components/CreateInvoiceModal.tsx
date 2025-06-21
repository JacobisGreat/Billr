import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, AlertCircle, Save } from 'lucide-react';
import { CreateInvoiceData, LineItem, Invoice } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (data: CreateInvoiceData) => Promise<string>;
  onEditInvoice?: (invoiceId: string, data: CreateInvoiceData) => Promise<void>;
  editingInvoice?: Invoice | null;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onCreateInvoice,
  onEditInvoice,
  editingInvoice
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { customers } = useCustomers();
  
  const [formData, setFormData] = useState({
    title: editingInvoice?.title || '',
    description: editingInvoice?.description || '',
    lineItems: editingInvoice?.lineItems || [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }] as LineItem[],
    clientEmail: editingInvoice?.clientEmail || '',
    clientName: editingInvoice?.clientName || '',
    dueDate: editingInvoice ? editingInvoice.dueDate.toISOString().split('T')[0] : '',
    notes: editingInvoice?.notes || '',
    isRecurring: editingInvoice?.isRecurring || false,
    recurringFrequency: editingInvoice?.recurringFrequency || 'monthly',
    recurringEndDate: editingInvoice?.recurringEndDate 
      ? editingInvoice.recurringEndDate.toDate().toISOString().split('T')[0] 
      : undefined,
    sendImmediately: editingInvoice?.sendImmediately || false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value
    };
    
    // Recalculate total for this line item
    if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
      const item = newLineItems[index];
      const subtotal = item.quantity * item.unitPrice;
      const taxAmount = item.tax ? subtotal * (item.tax / 100) : 0;
      item.total = subtotal + taxAmount;
    }
    
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (formData.lineItems.length === 0) {
        throw new Error('At least one line item is required');
      }
      if (!formData.clientEmail.trim()) {
        throw new Error('Client email is required');
      }
      if (!formData.dueDate) {
        throw new Error('Due date is required');
      }

      // Validate that all line items have descriptions and amounts
      for (let i = 0; i < formData.lineItems.length; i++) {
        const item = formData.lineItems[i];
        if (!item.description.trim()) {
          throw new Error(`Line item ${i + 1} description is required`);
        }
        if (item.unitPrice <= 0) {
          throw new Error(`Line item ${i + 1} price must be greater than 0`);
        }
      }

      const totalAmount = formData.lineItems.reduce((sum, item) => sum + item.total, 0);

      const invoiceData: CreateInvoiceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        lineItems: formData.lineItems,
        amount: totalAmount,
        clientEmail: formData.clientEmail.trim(),
        clientName: formData.clientName.trim(),
        dueDate: new Date(formData.dueDate),
        notes: formData.notes.trim(),
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.recurringFrequency,
        recurringEndDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
        sendImmediately: formData.sendImmediately
      };

      if (onEditInvoice) {
        await onEditInvoice(editingInvoice!.id, invoiceData);
      } else {
        await onCreateInvoice(invoiceData);
      }
      
      // Form will be reset by handleClose
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setFormData({
        title: '',
        description: '',
        lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
        clientEmail: '',
        clientName: '',
        dueDate: '',
        notes: '',
        isRecurring: false,
        recurringFrequency: 'monthly',
        recurringEndDate: undefined,
        sendImmediately: false
      });
      setError('');
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      if (editingInvoice) {
        // Pre-populate form for editing
        setFormData({
          title: editingInvoice.description, // Use description as title for editing
          description: editingInvoice.description,
          lineItems: editingInvoice.lineItems && editingInvoice.lineItems.length > 0 
            ? editingInvoice.lineItems 
            : [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
          clientEmail: editingInvoice.clientEmail,
          clientName: editingInvoice.clientName || '',
          dueDate: editingInvoice.dueDate.toDate().toISOString().split('T')[0],
          notes: editingInvoice.notes || '',
          isRecurring: editingInvoice.isRecurring || false,
          recurringFrequency: editingInvoice.recurringFrequency || 'monthly',
          recurringEndDate: editingInvoice.recurringEndDate 
            ? editingInvoice.recurringEndDate.toDate().toISOString().split('T')[0] 
            : undefined,
          sendImmediately: false
        });
      } else {
        // Reset form for new invoice
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        
        setFormData({
          title: '',
          description: '',
          lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
          clientEmail: '',
          clientName: '',
          dueDate: defaultDueDate.toISOString().split('T')[0],
          notes: '',
          isRecurring: false,
          recurringFrequency: 'monthly',
          recurringEndDate: undefined,
          sendImmediately: false
        });
      }
      setError('');
    }
  }, [isOpen, editingInvoice]);

  const totalAmount = formData.lineItems.reduce((sum, item) => sum + item.total, 0);

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
              className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl border border-brand-200/60 rounded-2xl shadow-brand"
            >
              <div className="px-6 py-4 border-b border-brand-200/40 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-brand-900">
                  {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-100/40 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
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

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Invoice title/name"
                      className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    placeholder="Invoice description"
                    className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm resize-none text-brand-800 placeholder-brand-400"
                  />
                </div>

                {/* Client Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Client Email *
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      required
                      placeholder="client@example.com"
                      list="customers"
                      className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                    <datalist id="customers">
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.email}>
                          {customer.name}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Client's full name"
                      className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-brand-700">
                      Line Items *
                    </label>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-200 transition-colors text-sm flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </button>
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 px-4 mb-2">
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-brand-600">Description</label>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-brand-600">Quantity</label>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-brand-600">Unit Price</label>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-brand-600">Tax %</label>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-brand-600">Total</label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {formData.lineItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-brand-50/60 rounded-lg border border-brand-200/40"
                      >
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-white/60 border border-brand-200/60 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="1"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-white/60 border border-brand-200/60 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white/60 border border-brand-200/60 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.tax || ''}
                            onChange={(e) => handleLineItemChange(index, 'tax', parseFloat(e.target.value) || undefined)}
                            className="w-full px-3 py-2 bg-white/60 border border-brand-200/60 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-brand-800">
                            ${item.total.toFixed(2)}
                          </span>
                          {formData.lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-brand-100/60 rounded-lg border border-brand-200/40">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-brand-800">Total Amount:</span>
                      <span className="text-xl font-bold text-brand-800">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Recurring Options */}
                <div className="border-t border-brand-200/40 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        isRecurring: e.target.checked 
                      }))}
                      className="w-4 h-4 text-brand-600 bg-white border-brand-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-brand-700">
                      Make this a recurring invoice
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-brand-700 mb-2">
                          Frequency
                        </label>
                        <select
                          name="recurringFrequency"
                          value={formData.recurringFrequency}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            recurringFrequency: e.target.value as 'weekly' | 'monthly' | 'quarterly' | 'yearly'
                          }))}
                          className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-brand-700 mb-2">
                          End Date (Optional)
                        </label>
                        <input
                          type="date"
                          name="recurringEndDate"
                          value={formData.recurringEndDate ? formData.recurringEndDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            recurringEndDate: e.target.value ? new Date(e.target.value) : undefined
                          }))}
                          min={formData.dueDate}
                          className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Send Options */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendImmediately"
                    checked={formData.sendImmediately}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      sendImmediately: e.target.checked 
                    }))}
                    className="w-4 h-4 text-brand-600 bg-white border-brand-300 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="sendImmediately" className="text-sm font-medium text-brand-700">
                    Send invoice immediately upon creation
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional notes for this invoice..."
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
                        {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
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