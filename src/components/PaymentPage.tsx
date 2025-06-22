import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Lock, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  AlertCircle,
  Sparkles,
  //Clock,
  //Italic
} from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlAmount = searchParams.get('amount');
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [realInvoiceUpdated, setRealInvoiceUpdated] = useState(false);
  const [error, setError] = useState('');

  // Fetch invoice or use demo data for public access
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError('No invoice ID provided');
        setLoading(false);
        return;
      }

      // Log URL amount if present
      if (urlAmount) {
        console.log('💰 Found amount in URL:', urlAmount);
      }

      try {
        console.log('🔍 Fetching real invoice:', invoiceId);
        const invoiceRef = doc(db, 'invoices', invoiceId);
        const invoiceSnap = await getDoc(invoiceRef);
        
        if (invoiceSnap.exists()) {
          const invoiceData = { id: invoiceSnap.id, ...invoiceSnap.data() } as any;
          console.log('✅ Found real invoice with amount:', invoiceData.amount, invoiceData);
          setInvoice(invoiceData);
          
          // Check if already paid
          if (invoiceData.status === 'paid') {
            setPaymentComplete(true);
            setRealInvoiceUpdated(true); // Real invoice is already paid
          }
        } else {
          console.log('❌ Invoice not found in database, using demo data');
          // Create demo invoice for public access
          createDemoInvoice();
        }
      } catch (error) {
        console.error('❌ Error fetching invoice, using demo data:', error);
        // If we can't access the database (permissions), create a demo invoice
        createDemoInvoice();
      } finally {
        setLoading(false);
      }
    };

    const createDemoInvoice = () => {
      // Use amount from URL if available, otherwise fallback to demo amount
      const amount = urlAmount ? parseFloat(urlAmount) : 89.99;
      
      // Create demo invoice based on the URL with actual amount from email
      const demoInvoice = {
        id: invoiceId,
        number: invoiceId?.includes('INV-') ? invoiceId : `DEMO-${invoiceId?.slice(-6)}`,
        description: urlAmount ? 'Professional Service - Payment Required' : 'Professional Service - Demo Invoice',
        amount: amount,
        clientName: 'Demo Client',
        clientEmail: 'demo@example.com',
        status: 'pending',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: urlAmount ? 'Payment link from invoice email - amount encoded in URL for reliability.' : 'This is a demo showing how your customers would pay invoices.',
        isDemo: !urlAmount // If amount is in URL, it's probably a real invoice link
      };
      
      console.log('⚠️ Created fallback invoice with amount from URL:', amount, demoInvoice);
      setInvoice(demoInvoice);
    };

    fetchInvoice();
  }, [invoiceId, urlAmount]);

  const handlePayment = async () => {
    if (!invoice) return;
    
    setProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Always try to update the real invoice first (even for demo invoices)
      // This ensures the actual invoice gets marked as paid
      console.log('Attempting to update real invoice:', invoiceId);
      
      const invoiceRef = doc(db, 'invoices', invoiceId!);
      await updateDoc(invoiceRef, {
        status: 'paid',
        paidAt: new Date(),
        paidMethod: 'Demo Payment Gateway'
      });
      
      console.log('✅ Real invoice marked as paid:', invoiceId);
      setRealInvoiceUpdated(true);
      setPaymentComplete(true);
      setProcessing(false);
      
    } catch (error) {
      console.error('Error updating real invoice:', error);
      
      // If updating the real invoice fails, still show success for demo experience
      // This handles cases where:
      // 1. The invoice doesn't exist in database
      // 2. Permission issues prevent the update
      // 3. User is not authenticated
      console.log('📋 Real invoice update failed, proceeding with demo success');
      setRealInvoiceUpdated(false);
      setPaymentComplete(true);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-brand-700">Loading invoice...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Success background effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-green-500 rounded-3xl"
          />
          
          {/* Confetti effect */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0, scale: 0 }}
              animate={{ 
                y: [0, -100, 200], 
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              style={{
                left: `${20 + (i * 7)}%`,
                top: '20%'
              }}
            />
          ))}

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-800 mb-2"
            >
              Payment Successful!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-6"
            >
              Your payment of <strong>${invoice?.amount?.toFixed(2)}</strong> has been processed successfully.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <div className={`p-4 rounded-lg border ${
                realInvoiceUpdated 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  realInvoiceUpdated ? 'text-green-800' : 'text-blue-800'
                }`}>
                  <strong>Invoice #{invoice?.number || invoiceId}</strong>
                  {realInvoiceUpdated && <span className="ml-2">✅ Updated</span>}
                </p>
                <p className={`text-sm ${
                  realInvoiceUpdated ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {invoice?.description}
                </p>
                {realInvoiceUpdated ? (
                  <p className="text-xs text-green-600 mt-2">
                    ✅ The original invoice has been marked as paid in the dashboard
                  </p>
                ) : (
                  <p className="text-xs text-blue-600 mt-2">
                    📋 Demo payment completed (original invoice may require authentication to update)
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {realInvoiceUpdated ? 'Visit Dashboard' : 'Visit Billr'}
              </button>
              
              {realInvoiceUpdated && (
                <p className="text-xs text-green-600 text-center">
                    Thank you!!
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Billr
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Secure Payment</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>256-bit SSL encrypted</span>
          </div>
        </motion.div>

        {/* Payment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200"
        >
          
          {/* Demo Badge */}
          {invoice?.isDemo && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800 font-medium text-sm">
                  Demo Payment Experience
                </span>
              </div>
              <p className="text-purple-700 text-xs mt-1">
                This is a demonstration of how your customers would pay invoices
              </p>
            </div>
          )}

          {/* Invoice Details */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2">Invoice Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice #:</span>
                <span className="font-medium">{invoice?.number || invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-medium">{invoice?.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{invoice?.isDemo ? 'Billr Demo User' : 'Billr Demo'}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="text-gray-800 font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${invoice?.amount?.toFixed(2)}
                  {urlAmount && (
                    <span className="text-xs text-green-600 ml-2 font-normal">✓ from email</span>
                  )}
                </span>
              </div>

            </div>
          </div>

          {/* Demo Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              
              {/* Card Number */}
              <div className="relative">
                <input
                  type="text"
                  value="4242 4242 4242 4242"
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <div className="w-8 h-5 bg-blue-600 rounded-sm"></div>
                  <div className="w-8 h-5 bg-red-500 rounded-sm"></div>
                </div>
              </div>
              
              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input
                  type="text"
                  placeholder="MM / YY"
                  value="12 / 25"
                  disabled
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  value="123"
                  disabled
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Demo Notice */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium">Demo Payment Gateway</p>
                  <p className="text-amber-700">
                    This is a demonstration. No real payment will be processed.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <motion.button
              onClick={handlePayment}
              disabled={processing}
              whileHover={{ scale: processing ? 1 : 1.02 }}
              whileTap={{ scale: processing ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Pay ${invoice?.amount?.toFixed(2)}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>Bank Level Security</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Powered by Billr Demo Payment Gateway
          </p>
        </motion.div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </motion.div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Processing Payment
                </h3>
                <p className="text-gray-600 mb-4">
                  Please wait while we process your payment...
                </p>
                
                <div className="flex items-center justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                      className="w-2 h-2 bg-blue-600 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 