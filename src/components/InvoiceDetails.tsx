import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Share2, Copy, CheckCircle, Repeat, ChevronDown, Bell, FileText } from 'lucide-react';
import { Invoice } from '../hooks/useInvoices';
import { pdfService } from '../services/pdfService';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
  onSendEmail?: (invoice: Invoice) => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ 
  invoice, 
  onClose,
  onSendEmail
}) => {
  const [copied, setCopied] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [modalTop, setModalTop] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 10);
      }
    };

    checkScrollable();
    
    const handleScroll = () => checkScrollable();
    const contentElement = contentRef.current;
    
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [invoice]);

  // Prevent body scroll and calculate modal position based on current viewport
  useEffect(() => {
    // Capture the current scroll position when modal opens
    const currentScrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // Center the modal in the current viewport
    setModalTop(currentScrollY + (viewportHeight * 0.1)); // 10% from top of current view
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup: restore body scroll when modal is closed
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleCopyLink = () => {
    if (invoice.paymentLink) {
      navigator.clipboard.writeText(invoice.paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail(invoice);
    }
  };

  const handleDownload = async () => {
    try {
      console.log('Downloading PDF for invoice:', invoice.id);
      await pdfService.downloadInvoicePDF(
        invoice,
        'Billr User', // You can get this from auth context
        'contact@billr.biz', // You can get this from auth context
        'Billr'
      );
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleSendReminder = () => {
    console.log('Sending reminder for invoice:', invoice.id);
  };

  // Determine if invoice is overdue
  const isOverdue = () => {
    if (invoice.status === 'paid') return false;
    const now = new Date();
    const dueDate = invoice.dueDate.toDate();
    return dueDate < now;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4"
          style={{ 
            top: `${modalTop}px`,
            zIndex: 51
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-h-[80vh] flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-brand-200/40 flex-shrink-0">
            <h2 className="text-2xl font-bold text-brand-900">Invoice Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-100/40 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div 
            ref={contentRef}
            className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-300 scrollbar-track-brand-100 relative"
            style={{ maxHeight: 'calc(90vh - 140px)', scrollBehavior: 'smooth' }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-brand-900">{invoice.description}</h3>
                  <p className="text-brand-600">Invoice #{invoice.number}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-brand-900">${invoice.amount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                    invoice.status === 'paid' 
                      ? 'bg-emerald-100/80 text-emerald-700'
                      : isOverdue()
                      ? 'bg-red-100/80 text-red-700'
                      : 'bg-amber-100/80 text-amber-700'
                  }`}>
                    {invoice.status === 'paid' ? 'Paid' : isOverdue() ? 'Overdue' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-brand-700">Client</label>
                    <p className="text-brand-900 font-medium">{invoice.clientName || 'No name provided'}</p>
                    <p className="text-brand-600 text-sm">{invoice.clientEmail}</p>
                    {invoice.clientPhone && (
                      <p className="text-brand-600 text-sm">{invoice.clientPhone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-brand-700">Due Date</label>
                    <p className="text-brand-900">{invoice.dueDate.toDate().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-brand-700">Created</label>
                    <p className="text-brand-900">{invoice.createdAt.toDate().toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-brand-700">Issue Date</label>
                    <p className="text-brand-900">
                      {invoice.issueDate ? invoice.issueDate.toDate().toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  {invoice.paidAt && (
                    <div>
                      <label className="text-sm font-medium text-brand-700">Paid Date</label>
                      <p className="text-brand-900">{invoice.paidAt.toDate().toLocaleDateString()}</p>
                      {invoice.paidMethod && (
                        <p className="text-brand-600 text-sm">via {invoice.paidMethod}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {invoice.notes && (
                <div className="p-4 bg-gradient-to-r from-brand-50/80 to-brand-100/80 rounded-xl backdrop-blur-sm border border-brand-200/40">
                  <label className="text-sm font-medium text-brand-700 block mb-2">Notes</label>
                  <p className="text-brand-900 text-sm">{invoice.notes}</p>
                </div>
              )}

              {/* Recurring Information */}
              {invoice.isRecurring && (
                <div className="p-4 bg-gradient-to-r from-blue-50/80 to-brand-50/80 rounded-xl backdrop-blur-sm border border-brand-200/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat className="w-4 h-4 text-brand-600" />
                    <label className="text-sm font-medium text-brand-700">Recurring Invoice Information</label>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-600">Type:</span>
                      <span className="text-brand-900 font-medium">Recurring Invoice</span>
                    </div>
                    {invoice.recurringFrequency && (
                      <div className="flex justify-between">
                        <span className="text-brand-600">Frequency:</span>
                        <span className="text-brand-900 capitalize">{invoice.recurringFrequency}</span>
                      </div>
                    )}
                    {invoice.recurringEndDate && (
                      <div className="flex justify-between">
                        <span className="text-brand-600">End Date:</span>
                        <span className="text-brand-900">
                          {invoice.recurringEndDate.toDate().toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-brand-600">Status:</span>
                      <span className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full">
                        Active Recurring
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Line Items */}
              {invoice.lineItems && invoice.lineItems.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-brand-50/80 to-brand-100/80 rounded-xl backdrop-blur-sm border border-brand-200/40">
                  <label className="text-sm font-medium text-brand-700 block mb-3">Line Items</label>
                  <div className="space-y-2">
                    {invoice.lineItems.map((item, index) => (
                      <div key={item.id || index} className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                        <div className="flex-1">
                          <p className="text-brand-900 font-medium">{item.description}</p>
                          <p className="text-brand-600 text-sm">
                            {item.quantity} × ${item.unitPrice.toFixed(2)}
                            {item.tax && ` (${item.tax}% tax)`}
                          </p>
                        </div>
                        <div className="text-brand-900 font-semibold">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                    
                    {/* Totals */}
                    <div className="border-t border-brand-200/40 pt-2 mt-3">
                      <div className="flex justify-between text-sm text-brand-600 mb-1">
                        <span>Subtotal:</span>
                        <span>${(invoice.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {invoice.taxTotal && invoice.taxTotal > 0 && (
                        <div className="flex justify-between text-sm text-brand-600 mb-1">
                          <span>Tax:</span>
                          <span>${invoice.taxTotal.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-brand-900 font-semibold">
                        <span>Total:</span>
                        <span>${(invoice.total || invoice.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {invoice.paymentLink && (
                <div className="p-4 bg-gradient-to-r from-brand-50/80 to-brand-100/80 rounded-xl backdrop-blur-sm border border-brand-200/40">
                  <label className="text-sm font-medium text-brand-700 block mb-2">Payment Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={invoice.paymentLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white/60 border border-brand-200/40 rounded-lg text-brand-900 text-sm backdrop-blur-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-500 transition-all duration-300 flex items-center gap-2 shadow-lg"
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

          {/* Scroll Indicator - Fixed at bottom of modal */}
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-brand-500 text-xs bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full border border-brand-200/40 shadow-lg z-10"
            >
              <span>Scroll for more</span>
              <motion.div
                animate={{ y: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-3 h-3" />
              </motion.div>
            </motion.div>
          )}

          {/* Fixed Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-brand-200/40 bg-gradient-to-r from-brand-50/30 to-brand-100/30 backdrop-blur-sm flex-shrink-0">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-brand-600 hover:text-brand-900 hover:bg-brand-100/40 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </button>
            
            {invoice.status !== 'paid' && onSendEmail && (
              <button
                onClick={handleSendEmail}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  invoice.emailSent 
                    ? 'text-green-600 hover:text-green-800 hover:bg-green-100/40' 
                    : 'text-brand-600 hover:text-brand-900 hover:bg-brand-100/40'
                }`}
              >
                <Mail className="w-4 h-4" />
                {invoice.emailSent ? 'Email Sent - Send Again' : 'Send Email'}
              </button>
            )}

            {isOverdue() && (
              <button
                onClick={handleSendReminder}
                className="px-4 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-100/40 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Send Reminder
              </button>
            )}
            
            <button
              onClick={handleCopyLink}
              className="px-6 py-2 bg-gradient-to-r from-brand-900 to-brand-800 text-white rounded-lg hover:from-brand-800 hover:to-brand-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
          </div>
        </motion.div>
      </div>
    </div>
    </AnimatePresence>
      );
  }; 