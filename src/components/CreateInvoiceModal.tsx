import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Mail, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import { CreateInvoiceData } from '../hooks/useInvoices';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (data: CreateInvoiceData) => Promise<string>;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onCreateInvoice
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    clientEmail: '',
    clientName: '',
    dueDate: '',
    notes: ''
  });

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
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!formData.clientEmail.trim()) {
        throw new Error('Client email is required');
      }
      if (!formData.dueDate) {
        throw new Error('Due date is required');
      }

      const invoiceData: CreateInvoiceData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        clientEmail: formData.clientEmail.trim(),
        clientName: formData.clientName.trim(),
        dueDate: new Date(formData.dueDate),
        notes: formData.notes.trim()
      };

      await onCreateInvoice(invoiceData);
      
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
        description: '',
        amount: '',
        clientEmail: '',
        clientName: '',
        dueDate: '',
        notes: ''
      });
      setError('');
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      
      setFormData({
        description: '',
        amount: '',
        clientEmail: '',
        clientName: '',
        dueDate: defaultDueDate.toISOString().split('T')[0],
        notes: ''
      });
      setError('');
    }
  }, [isOpen]);

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
              className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">Create Invoice</h2>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-white/40 rounded-lg transition-all duration-200 disabled:opacity-50"
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

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Service Description *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Math Tutoring Session"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm text-zinc-900 placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm text-zinc-900 placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Client Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      required
                      placeholder="client@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm text-zinc-900 placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Client Name <span className="text-zinc-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Client's full name"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm text-zinc-900 placeholder-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Due Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm text-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Notes <span className="text-zinc-400">(Optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional notes or terms..."
                    className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent backdrop-blur-sm resize-none text-zinc-900 placeholder-zinc-400"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-zinc-600 hover:text-zinc-900 hover:bg-white/40 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-zinc-900 to-slate-800 text-white font-medium rounded-lg shadow-xl hover:shadow-2xl hover:from-slate-800 hover:to-zinc-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Create Invoice'
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