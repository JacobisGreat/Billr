import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building, 
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

// Professional loading component that matches the site aesthetic
const ProfessionalLoader: React.FC = () => (
  <div className="flex items-center justify-center gap-2">
    <div className="relative">
      {/* Outer ring */}
      <motion.div
        className="w-5 h-5 border-2 border-brand-200/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner rotating element */}
      <motion.div
        className="absolute inset-0 w-5 h-5 border-2 border-transparent border-t-brand-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Center dot */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-1 h-1 bg-brand-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    
    <motion.span
      className="text-sm font-medium text-brand-700"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
      Processing...
    </motion.span>
  </div>
);

export const AuthForms: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    businessName: ''
  });

  const { currentUser, signup, login, loginWithGoogle, resetPassword } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setSuccess('');

    try {
      if (mode === 'signin') {
        await login(formData.email, formData.password);
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signup(formData.email, formData.password, formData.displayName, formData.businessName);
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        setSuccess('Password reset email sent! Check your inbox.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      businessName: ''
    });
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full grid-bg opacity-20" />
        
        {/* Floating elements for enhanced aesthetic */}
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-brand-300/30 to-brand-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br from-brand-200/40 to-brand-300/30 rounded-full blur-2xl"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="backdrop-blur-xl bg-white/80 border border-brand-200/60 rounded-2xl shadow-brand-lg p-8">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="mb-6"
                >
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-700 to-brand-900">
                    Billr
                  </h1>
                </motion.div>
                
                <h2 className="text-2xl font-bold text-brand-800 mb-2">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Reset Password'}
                </h2>
                
                <p className="text-brand-600">
                  {mode === 'signin' && 'Sign in to access your dashboard'}
                  {mode === 'signup' && 'Start getting paid faster today'}
                  {mode === 'reset' && 'Enter your email to reset your password'}
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50/80 border border-red-200/60 rounded-lg flex items-center gap-2 text-red-700 backdrop-blur-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-lg flex items-center gap-2 text-emerald-700 backdrop-blur-sm"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 backdrop-blur-sm transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-400" />
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 backdrop-blur-sm transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Business Name <span className="text-brand-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-400" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 backdrop-blur-sm transition-all"
                        placeholder="Your business name"
                      />
                    </div>
                  </div>
                )}

                {mode !== 'reset' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-12 py-3 bg-white/60 border border-brand-200/60 rounded-lg text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 backdrop-blur-sm transition-all"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/60 border border-brand-200/60 rounded-lg text-brand-800 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400 backdrop-blur-sm transition-all"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white font-semibold rounded-lg shadow-brand-lg hover:shadow-2xl hover:from-brand-700 hover:to-brand-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                      <ProfessionalLoader />
                  ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'reset' && 'Send Reset Email'}
                    </>
                  )}
                  </div>
                </motion.button>
              </form>

              {mode !== 'reset' && (
                <>
                  <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-brand-200/60"></div>
                    <span className="px-4 text-brand-400 text-sm">or</span>
                    <div className="flex-1 border-t border-brand-200/60"></div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-white/60 border border-brand-200/60 text-brand-700 font-medium rounded-lg hover:bg-white/80 hover:border-brand-300/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </motion.button>
                </>
              )}

              <div className="mt-6 text-center space-y-2">
                {mode === 'signin' && (
                  <>
                    <p className="text-brand-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-brand-700 hover:text-brand-800 font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-brand-500 hover:text-brand-700 text-sm transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </>
                )}
                
                {mode === 'signup' && (
                  <p className="text-brand-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-brand-700 hover:text-brand-800 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                
                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-brand-700 hover:text-brand-800 font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}; 