import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, AlertCircle, Save, UserPlus, DollarSign, Users } from 'lucide-react';
import { CreateInvoiceData, LineItem, Invoice } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (data: CreateInvoiceData) => Promise<string>;
  onEditInvoice?: (invoiceId: string, data: CreateInvoiceData) => Promise<void>;
  onCreateCustomer?: (data: CreateInvoiceData) => Promise<string>;
  editingInvoice?: Invoice | null;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onCreateInvoice,
  onEditInvoice,
  onCreateCustomer,
  editingInvoice
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalTop, setModalTop] = useState(0);
  const { customers } = useCustomers();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lineItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }] as LineItem[],
    clientEmail: '',
    clientName: '',
    clientPhone: '',
    dueDate: '',
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    recurringEndDate: '',
    sendImmediately: false,
    markAsPaid: false,
    saveAsContact: false,
    paidMethod: 'Cash/E-transfer',
    templateName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleCustomerSelect = (customerEmail: string) => {
    const customer = customers.find(c => c.email === customerEmail);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        clientEmail: customer.email,
        clientName: customer.name,
        clientPhone: customer.phone || ''
      }));
    }
  };

  const handleSaveAsContact = async () => {
    if (!onCreateCustomer) return;
    
    try {
      if (!formData.clientEmail.trim()) {
        throw new Error('Client email is required to save as contact');
      }
      
      const totalAmount = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
      
      const invoiceData: CreateInvoiceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        lineItems: formData.lineItems,
        amount: totalAmount,
        clientEmail: formData.clientEmail.trim(),
        clientName: formData.clientName.trim(),
        clientPhone: formData.clientPhone.trim(),
        dueDate: new Date(formData.dueDate),
        markAsPaid: formData.markAsPaid
      };

      await onCreateCustomer(invoiceData);
      setFormData(prev => ({ ...prev, saveAsContact: false }));
      // You could show a success message here
    } catch (error: any) {
      setError(error.message || 'Failed to save contact');
    }
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
        clientPhone: formData.clientPhone.trim(),
        dueDate: new Date(formData.dueDate),
        notes: formData.notes.trim(),
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.recurringFrequency,
        recurringEndDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
        templateName: formData.isRecurring ? (formData.templateName.trim() || `${formData.description.trim()} (${formData.recurringFrequency})`) : undefined,
        sendImmediately: formData.sendImmediately,
        markAsPaid: formData.markAsPaid,
        paidMethod: formData.markAsPaid ? (formData.paidMethod || 'Cash/E-transfer') : undefined
      };

      console.log('🚀 Submitting invoice data:', invoiceData);
      console.log('🔄 Is recurring?', formData.isRecurring);
      console.log('📋 Template name:', formData.templateName);

      if (onEditInvoice && editingInvoice) {
        console.log('✏️ Editing existing invoice:', editingInvoice.id);
        await onEditInvoice(editingInvoice.id, invoiceData);
      } else {
        console.log('✨ Creating new invoice');
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
        clientPhone: '',
        dueDate: '',
        notes: '',
        isRecurring: false,
        recurringFrequency: 'monthly',
        recurringEndDate: '',
        sendImmediately: false,
        markAsPaid: false,
        saveAsContact: false,
        paidMethod: 'Cash/E-transfer',
        templateName: ''
      });
      setError('');
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Capture the current scroll position when modal opens
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Center the modal in the current viewport
      setModalTop(currentScrollY + (viewportHeight * 0.1)); // 10% from top of current view
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
          clientPhone: editingInvoice.clientPhone || '',
          dueDate: editingInvoice.dueDate.toDate().toISOString().split('T')[0],
          notes: editingInvoice.notes || '',
          isRecurring: editingInvoice.isRecurring || false,
          recurringFrequency: editingInvoice.recurringFrequency || 'monthly',
          recurringEndDate: editingInvoice.recurringEndDate 
            ? editingInvoice.recurringEndDate.toDate().toISOString().split('T')[0] 
            : '',
          sendImmediately: (editingInvoice as any).sendImmediately || false,
          markAsPaid: editingInvoice.status === 'paid' || false,
          saveAsContact: false,
          paidMethod: editingInvoice.paidMethod || 'Cash/E-transfer',
          templateName: editingInvoice.templateName || ''
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
          clientPhone: '',
        dueDate: defaultDueDate.toISOString().split('T')[0],
          notes: '',
          isRecurring: false,
          recurringFrequency: 'monthly',
          recurringEndDate: '',
          sendImmediately: false,
          markAsPaid: false,
          saveAsContact: false,
          paidMethod: 'Cash/E-transfer',
          templateName: ''
        });
      }
      setError('');
    }
  }, [isOpen, editingInvoice]);

  // Auto-uncheck recurring when marking as paid (cash payments can't be recurring)
  React.useEffect(() => {
    if (formData.markAsPaid && formData.isRecurring) {
      setFormData(prev => ({ ...prev, isRecurring: false }));
    }
  }, [formData.markAsPaid]);

  const totalAmount = formData.lineItems.reduce((sum, item) => sum + item.total, 0);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4"
            style={{ 
              top: `${modalTop}px`,
              zIndex: 51
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-h-[85vh] bg-white/90 backdrop-blur-xl border border-brand-200/60 rounded-2xl shadow-brand overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
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

                <form id="invoice-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                  <div className="px-6 py-6 space-y-6">
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

                    {/* Title and Due Date */}
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

                    {/* Client Information */}
                    <div className="border border-brand-200/60 rounded-xl p-4 bg-gradient-to-r from-brand-50/40 to-brand-100/40">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-brand-600" />
                        <h3 className="text-lg font-semibold text-brand-800">Client Information</h3>
                      </div>

                      {/* Customer Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-brand-700 mb-2">
                          Quick Select Customer
                        </label>
                        <select
                          onChange={(e) => handleCustomerSelect(e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 text-brand-800 rounded-lg border border-brand-200/60 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                          <option value="">Choose existing customer...</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.email}>
                              {customer.name} • {customer.email} {customer.phone && `• ${customer.phone}`}
                            </option>
                          ))}
                        </select>
                </div>

                      {/* Manual Entry */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                          <label className="block text-sm font-medium text-brand-700 mb-2">
                            Email Address *
                  </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      required
                      placeholder="client@example.com"
                            className="w-full px-4 py-3 bg-white/80 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                </div>

                <div>
                          <label className="block text-sm font-medium text-brand-700 mb-2">
                            Full Name
                  </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-white/80 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-brand-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="clientPhone"
                            value={formData.clientPhone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            className="w-full px-4 py-3 bg-white/80 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                          />
                        </div>
                      </div>

                      {/* Contact Summary and Save Button */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex-1">
                          {(formData.clientEmail || formData.clientName) && (
                            <div className="p-3 bg-brand-100/60 rounded-lg border border-brand-200/40">
                              <div className="text-xs font-medium text-brand-600 mb-1">Invoice will be sent to:</div>
                              <div className="text-sm text-brand-800">
                                <span className="font-semibold">{formData.clientName || 'Unnamed Client'}</span>
                                {formData.clientEmail && <span className="text-brand-600"> • {formData.clientEmail}</span>}
                                {formData.clientPhone && <span className="text-brand-600"> • {formData.clientPhone}</span>}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleSaveAsContact}
                          disabled={!formData.clientEmail || !formData.clientName}
                          className="ml-4 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          <UserPlus className="w-4 h-4" />
                          Save as Contact
                        </button>
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
                                value={item.quantity === 1 ? '' : item.quantity}
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
                                value={item.unitPrice === 0 ? '' : item.unitPrice}
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

                    {/* Payment & Recurring Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Payment Status */}
                      <div className="border border-brand-200/60 rounded-xl p-4 bg-gradient-to-r from-green-50/40 to-emerald-50/40">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            id="markAsPaid"
                            checked={formData.markAsPaid}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              markAsPaid: e.target.checked 
                            }))}
                            className="w-4 h-4 text-brand-600 bg-white border-brand-300 rounded focus:ring-brand-500"
                          />
                          <label htmlFor="markAsPaid" className="text-sm font-medium text-brand-700 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Mark as paid
                          </label>
                        </div>

                        {formData.markAsPaid && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <div>
                              <label className="block text-sm font-medium text-brand-700 mb-2">
                                Payment Method
                              </label>
                              <select
                                name="paidMethod"
                                value={formData.paidMethod}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800"
                              >
                                <option value="Cash/E-transfer">Cash/E-transfer</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Check">Check</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Recurring Options */}
                      <div className="border border-brand-200/60 rounded-xl p-4 bg-gradient-to-r from-blue-50/40 to-indigo-50/40">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            id="isRecurring"
                            checked={formData.isRecurring}
                            disabled={formData.markAsPaid}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              isRecurring: e.target.checked 
                            }))}
                            className="w-4 h-4 text-brand-600 bg-white border-brand-300 rounded focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <label htmlFor="isRecurring" className={`text-sm font-medium ${formData.markAsPaid ? 'text-brand-400' : 'text-brand-700'}`}>
                            Make recurring
                          </label>
                          {formData.markAsPaid && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              Not available for immediate payments
                            </span>
                          )}
                        </div>

                        {formData.isRecurring && !formData.markAsPaid && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4"
                          >
                            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/40">
                              <div className="text-xs text-blue-800 mb-1">
                                <strong>Creates this invoice + sets up automatic recurring</strong>
                              </div>
                              <div className="text-xs text-blue-700">
                                You'll get an immediate invoice plus automatic future invoices based on your schedule.
                  </div>
                </div>

                <div>
                              <label className="block text-sm font-medium text-brand-700 mb-2">
                                Template Name
                  </label>
                    <input
                                type="text"
                                name="templateName"
                                value={formData.templateName || ''}
                      onChange={handleInputChange}
                                placeholder={`${formData.description.trim()} (${formData.recurringFrequency})`}
                                className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800 placeholder-brand-400"
                    />
                  </div>

                            <div className="grid grid-cols-2 gap-3">
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
                                  value={formData.recurringEndDate}
                                  onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    recurringEndDate: e.target.value
                                  }))}
                                  className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm text-brand-800"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Notes and Send Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-brand-700 mb-2">
                          Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                          rows={2}
                          placeholder="Additional notes for this invoice..."
                          className="w-full px-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent backdrop-blur-sm resize-none text-brand-800 placeholder-brand-400"
                  />
                </div>

                      <div className="flex items-end">
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
                            Send immediately
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="px-6 py-4 border-t border-brand-200/40 flex gap-3 bg-white/90">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-white border border-brand-300 text-brand-700 rounded-lg hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="invoice-form"
                    disabled={loading || formData.lineItems.length === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                        {editingInvoice ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                      </>
                    )}
                  </button>
                </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}; 