import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  //Banknote, 
  ArrowRight, 
  Shield, 
  X,
  Sparkles,
  CheckCircle,
  Building
} from 'lucide-react';

interface PaymentGatewayBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const PaymentGatewayBanner: React.FC<PaymentGatewayBannerProps> = ({ 
  isVisible, 
  onDismiss 
}) => {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [modalTop, setModalTop] = useState(0);

  const handleSetupClick = () => {
    setShowSetupModal(true);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setSetupComplete(true);
      setTimeout(() => {
        setShowSetupModal(false);
        onDismiss();
      }, 2000);
    }
  };

  const handleCloseModal = () => {
    setShowSetupModal(false);
    setCurrentStep(1);
    setSetupComplete(false);
  };

  // Center modal in current viewport when it opens
  React.useEffect(() => {
    if (showSetupModal) {
      // Capture the current scroll position when modal opens
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Center the modal in the current viewport
      setModalTop(currentScrollY + (viewportHeight * 0.15)); // 15% from top of current view
      
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
  }, [showSetupModal]);

  if (!isVisible) return null;

  return (
    <>
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white py-4 px-4 shadow-xl shadow-brand-500/25 z-30"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/95 via-brand-700/95 to-brand-800/95" />
        <motion.div
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ backgroundSize: '200% 100%' }}
        />

        <div className="relative max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Animated icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm"
            >
              <CreditCard className="w-5 h-5" />
            </motion.div>

            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ready to accept payments?
              </h3>
              <p className="text-white/90 text-sm">
                Demo setup your payment gateway and start getting paid directly to your bank account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleSetupClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-white text-brand-700 rounded-lg font-semibold hover:bg-brand-50 hover:text-brand-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Building className="w-4 h-4" />
              Demo Setup
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-white/60 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`
            }}
          />
        ))}
      </motion.div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={handleCloseModal}
            />
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md px-4"
              style={{ 
                top: `${modalTop}px`,
                zIndex: 51
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
              {!setupComplete ? (
                <>
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Demo Payment Setup</h3>
                      <button
                        onClick={handleCloseModal}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="flex gap-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            step <= currentStep 
                              ? 'bg-white' 
                              : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-white/90 text-sm mt-2">
                      Step {currentStep} of 3
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {currentStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Building className="w-8 h-8 text-brand-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Connect Your Bank Account
                        </h4>
                        <p className="text-gray-600 mb-4">
                          In a real setup, you'd securely connect your bank account to receive payments directly.
                        </p>
                        <div className="p-3 bg-brand-50 rounded-lg text-sm text-brand-800">
                          <strong>Demo Mode:</strong> No actual bank connection required
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Security Verification
                        </h4>
                        <p className="text-gray-600 mb-4">
                          We'd verify your identity and business information for secure transactions.
                        </p>
                        <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                          <strong>Demo Mode:</strong> All security checks passed ✓
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-8 h-8 text-brand-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Configure Payment Methods
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Choose which payment methods your customers can use to pay you.
                        </p>
                        <div className="space-y-2 text-left">
                          {['Credit/Debit Cards', 'Bank Transfers', 'Digital Wallets'].map((method, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-700">{method}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <motion.button
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200"
                    >
                      {currentStep === 3 ? 'Complete Setup' : 'Continue'}
                    </motion.button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    Payment Gateway Ready!
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Your demo payment gateway is now configured. In production, you'd be ready to accept real payments directly to your bank account.
                  </p>
                  
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-brand-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      <strong>What's Next:</strong> Send invoices with payment links and watch money flow directly to your account!
                    </p>
                  </div>
                </motion.div>
              )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}; 