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
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-bg opacity-20" />
          
          <motion.div
            animate={{ 
              y: [0, -20, 0], 
              x: [0, 15, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-32 left-32 w-48 h-48 bg-gradient-to-br from-brand-300/30 to-brand-400/20 rounded-full blur-2xl"
          />
          
          <motion.div
            animate={{ 
              y: [0, 20, 0], 
              x: [0, -20, 0],
              scale: [1, 0.95, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-32 right-32 w-64 h-64 bg-gradient-to-br from-brand-200/40 to-brand-300/30 rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative p-10 rounded-3xl bg-white/80 backdrop-blur-xl border border-brand-200/60 shadow-2xl max-w-sm mx-auto overflow-hidden">
            {/* Subtle shine effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 2
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700">
                Billr
              </h1>
            </motion.div>
            
            {/* Loading spinner */}
            <div className="relative mb-6 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-3 border-brand-200/30 rounded-full"
              />
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-12 h-12 border-3 border-transparent border-t-brand-600 border-r-brand-600 rounded-full"
              />
              
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute w-3 h-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full"
            />
            </div>
            
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-brand-700 font-medium"
            >
              Authenticating...
            </motion.p>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-300/60 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-300/60 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-300/60 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-300/60 rounded-br-3xl" />
          </div>
        </motion.div>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/auth" replace />;
}; 