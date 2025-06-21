import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface GlassmorphismNavProps {
  isLoaded: boolean;
}

export const GlassmorphismNav: React.FC<GlassmorphismNavProps> = ({ isLoaded }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleAuthAction = async () => {
    if (currentUser) {
      // User is logged in, show logout option
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Failed to logout:', error);
      }
    } else {
      // User is not logged in, redirect to auth
      navigate('/auth');
    }
  };

  const handleDashboardClick = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Don't render nav on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={isLoaded ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${isScrolled 
          ? 'backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg' 
          : 'backdrop-blur-sm bg-white/40'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Billr
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser && (
              <motion.button
                onClick={handleDashboardClick}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300"
              >
                Dashboard
              </motion.button>
            )}
            
            <motion.button
              onClick={handleAuthAction}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {currentUser ? 'Sign Out' : 'Sign In'}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 hover:text-indigo-600 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-xl bg-white/90 border-t border-white/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
                >
                  {item.name}
                </motion.a>
              ))}
              
              {currentUser && (
                <motion.button
                  onClick={() => {
                    handleDashboardClick();
                    setIsMobileMenuOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="w-full text-left text-slate-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
                >
                  Dashboard
                </motion.button>
              )}
              
              <motion.button
                onClick={() => {
                  handleAuthAction();
                  setIsMobileMenuOpen(false);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="w-full text-left bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 rounded-md text-base font-medium"
              >
                {currentUser ? 'Sign Out' : 'Sign In'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}; 