import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Share2, Download, Copy, CheckCircle } from 'lucide-react';
import { Invoice } from '../hooks/useInvoices';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ 
  invoice, 
  onClose 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (invoice.paymentLink) {
      navigator.clipboard.writeText(invoice.paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = () => {
    console.log('Sending email for invoice:', invoice.id);
  };

  const handleDownload = () => {
    console.log('Downloading invoice:', invoice.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/40">
            <h2 className="text-2xl font-bold text-zinc-900">Invoice Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-white/40 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">{invoice.description}</h3>
                  <p className="text-zinc-600">Invoice #{invoice.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-zinc-900">${invoice.amount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                    invoice.status === 'paid' 
                      ? 'bg-emerald-100/80 text-emerald-700'
                      : invoice.status === 'overdue'
                      ? 'bg-red-100/80 text-red-700'
                      : 'bg-amber-100/80 text-amber-700'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700">Client</label>
                    <p className="text-zinc-900 font-medium">{invoice.clientName || 'No name provided'}</p>
                    <p className="text-zinc-600 text-sm">{invoice.clientEmail}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-zinc-700">Due Date</label>
                    <p className="text-zinc-900">{invoice.dueDate.toDate().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700">Created</label>
                    <p className="text-zinc-900">{invoice.createdAt.toDate().toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-zinc-700">Description</label>
                    <p className="text-zinc-900">{invoice.description}</p>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="p-4 bg-gradient-to-r from-zinc-50/80 to-slate-50/80 rounded-xl backdrop-blur-sm border border-white/40">
                  <label className="text-sm font-medium text-zinc-700 block mb-2">Notes</label>
                  <p className="text-zinc-900 text-sm">{invoice.notes}</p>
                </div>
              )}

              {invoice.paymentLink && (
                <div className="p-4 bg-gradient-to-r from-zinc-50/80 to-slate-50/80 rounded-xl backdrop-blur-sm border border-white/40">
                  <label className="text-sm font-medium text-zinc-700 block mb-2">Payment Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={invoice.paymentLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white/60 border border-white/40 rounded-lg text-zinc-900 text-sm backdrop-blur-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-gradient-to-r from-zinc-700 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-zinc-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/40 bg-gradient-to-r from-white/30 to-slate-50/30 backdrop-blur-sm">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-white/40 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-white/40 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>
            
            <button
              onClick={handleCopyLink}
              className="px-6 py-2 bg-gradient-to-r from-zinc-900 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-zinc-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 