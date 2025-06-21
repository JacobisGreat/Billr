import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-medium flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-8 rounded-2xl bg-white/90 backdrop-blur-sm border border-brand-medium/20 shadow-lg shadow-brand-medium/10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-brand-medium/30 border-t-brand-dark rounded-full mx-auto mb-4"
            />
            <p className="text-brand-dark/80 font-medium">Loading...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/auth" replace />;
}; 