import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Lazy load heavy components for better performance
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const AuthForms = lazy(() => import('./components/AuthForms').then(module => ({ default: module.AuthForms })));
const PaymentPage = lazy(() => import('./components/PaymentPage').then(module => ({ default: module.PaymentPage })));

// Components
import { GradientText } from './components/GradientText';
import { TypingAnimation } from './components/TypingAnimation';
import { GlowCard } from './components/GlowCard';
import { BentoGrid } from './components/BentoGrid';
import { FloatingElements } from './components/FloatingElements';
import { GlassmorphismNav } from './components/GlassmorphismNav';
import { ScrollProgress } from './components/ScrollProgress';
import { ProtectedRoute } from './components/ProtectedRoute';

// Icons
import { 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Star,
  Sparkles,
  CreditCard,
  BarChart3,
  MessageSquare,
  Clock
} from 'lucide-react';

// Optimized animations for better performance
//const fadeInUp = {
//  initial: { opacity: 0, y: 20 },
//  animate: { opacity: 1, y: 0 },
//  transition: { duration: 0.6, ease: "easeOut" }
//};

//const staggerChildren = {
//  animate: {
//    transition: {
//      staggerChildren: 0.1
//    }
//  }
//};

// Loading component for lazy loaded routes
const RouteLoader = React.memo(() => (
  <div className="fixed inset-0 bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center z-50 overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute inset-0 pointer-events-none">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Floating animated orbs */}
      <motion.div
        animate={{ 
          y: [0, -30, 0], 
          x: [0, 20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-brand-300/40 to-brand-400/20 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{ 
          y: [0, 25, 0], 
          x: [0, -25, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-br from-brand-200/30 to-brand-300/20 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{ 
          y: [0, -15, 0], 
          x: [0, 15, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-brand-100/30 to-brand-200/20 rounded-full blur-3xl"
      />
      </div>

    {/* Main loading content */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-10 text-center"
    >
      {/* Glassmorphic container */}
      <div className="relative p-12 rounded-3xl bg-white/80 backdrop-blur-xl border border-brand-200/60 shadow-2xl max-w-md mx-auto overflow-hidden">
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
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700">
            Billr
          </h1>
        </motion.div>

        {/* Advanced loading animation */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-brand-200/30 rounded-full"
          />
          
          {/* Middle ring - counter rotation */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-16 h-16 border-4 border-transparent border-t-brand-500 border-r-brand-500 rounded-full"
          />
          
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute w-12 h-12 border-4 border-transparent border-t-brand-600 rounded-full"
          />
          
          {/* Center animated dot */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute w-4 h-4 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full shadow-lg"
          />
          
          {/* Orbiting dots */}
          {[0, 120, 240].map((_, index) => (
            <motion.div
              key={index}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "linear",
                delay: index * 0.5
              }}
              className="absolute w-20 h-20"
              style={{ transformOrigin: 'center' }}
            >
              <div 
                className="w-2 h-2 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full absolute"
                style={{ 
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
            </motion.div>
          ))}
    </div>

        {/* Loading text with typing effect */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3"
        >
          <motion.h2
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl font-semibold text-brand-800"
          >
            Preparing Your Experience
          </motion.h2>
          
          <div className="h-6 flex items-center justify-center">
            <motion.div
              animate={{ 
                width: ['20%', '100%', '100%', '20%'],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 1
              }}
              className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 rounded-full"
            />
          </div>
          
          <motion.p
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="text-brand-600 text-sm"
          >
            Setting up your dashboard
          </motion.p>
        </motion.div>

        {/* Bottom decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-300/60 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-300/60 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-300/60 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-300/60 rounded-br-3xl" />
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 bg-brand-400/60 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${60 + Math.random() * 30}%`,
          }}
        />
      ))}
    </motion.div>
  </div>
));

// Memoized components for better performance
//const OptimizedAnimatedBeam = React.memo(AnimatedBeam);
//const OptimizedInteractiveGrid = React.memo(InteractiveGrid);
const OptimizedFloatingElements = React.memo(FloatingElements);
const OptimizedGlassmorphismNav = React.memo(GlassmorphismNav);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthForms />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/pay/:invoiceId" element={<PaymentPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

const LandingPage = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { ref: featuresRef, inView: featuresInView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { ref: pricingRef, inView: pricingInView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const { ref: faqRef, inView: faqInView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Memoized navigation handlers
  //const scrollToSection = useCallback((sectionId: string) => {
  //  const element = document.getElementById(sectionId);
  //  if (element) {
  //    element.scrollIntoView({ behavior: 'smooth' });
  //  }
  //}, []);

  // Performance optimizations
  useEffect(() => {
    setIsVisible(true);
    
    // Preload critical resources
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap';
    link.as = 'style';
    document.head.appendChild(link);
    
    // Add performance hints
    const dnsLink = document.createElement('link');
    dnsLink.rel = 'dns-prefetch';
    dnsLink.href = 'https://images.unsplash.com';
    document.head.appendChild(dnsLink);
    
    // Preconnect to critical domains
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = 'https://fonts.googleapis.com';
    preconnectLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectLink);
    
    // Add CSS containment for better performance
    const style = document.createElement('style');
    style.textContent = `
      .performance-optimized {
        contain: layout style paint;
        will-change: transform;
      }
      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      .animate-scroll {
        animation: scroll 20s linear infinite;
      }
      .pause-animation:hover .animate-scroll {
        animation-play-state: paused;
      }
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
    
    // Performance monitoring
    if ('performance' in window) {
      // Measure page load time
      window.addEventListener('load', () => {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
          console.log(`🚀 Page loaded in ${pageLoadTime}ms`);
        }
      });

      // Measure Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`🎯 LCP: ${lastEntry.startTime}ms`);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // Observer not supported, continue silently
        }
      }
    }
    
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(dnsLink)) document.head.removeChild(dnsLink);
      if (document.head.contains(preconnectLink)) document.head.removeChild(preconnectLink);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  if (!isVisible) {
    return <RouteLoader />;
  }

  const sections = (
    <div className="performance-optimized">
      <div ref={heroRef}>
        {heroInView && <HeroSection />}
      </div>
      
      <ProblemSection />
      <SolutionSection />
      
      <div ref={featuresRef} id="features">
        {featuresInView && <FeaturesSection />}
      </div>
      
      <SocialProofSection />
      
      <div ref={pricingRef} id="pricing">
        {pricingInView && <PricingSection />}
      </div>
      
      <div ref={faqRef} id="faq">
        {faqInView && <FAQSection />}
      </div>
      
      <CTASection />
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 relative overflow-hidden gpu-accelerated">
      <ScrollProgress />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full grid-bg opacity-20" />
        <OptimizedFloatingElements />
      </div>

      <OptimizedGlassmorphismNav isLoaded={isVisible} />
      {sections}
    </div>
  );
});

const HeroSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="text-6xl lg:text-7xl font-black tracking-tight font-display">
              <TypingAnimation 
                text="Get Paid"
                className="text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-brand-700 to-brand-900 font-display"
              />
              <div className="mt-2">
                <GradientText 
                  text="Without The Chase"
                  gradient="from-brand-600 via-brand-500 to-brand-700"
                  className="text-6xl lg:text-7xl font-black font-display"
                />
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl text-brand-800 leading-relaxed max-w-lg"
            >
              Send professional invoices in seconds and actually get paid on time. 
              No more lost payments, forgotten IOUs, or uncomfortable money conversations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.a
                href="/auth"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-brand-lg transition-all duration-500 overflow-hidden inline-flex items-center justify-center gap-3 border border-brand-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                    <Sparkles className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold leading-tight">Start Free Today</span>
                    <span className="text-xs text-white/80 font-medium">5 invoices • No credit card</span>
                  </div>
                  
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.a>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-5 border-2 border-brand-300 text-brand-700 rounded-2xl font-semibold text-lg hover:border-brand-400 hover:text-brand-800 hover:bg-white/80 transition-all duration-300 backdrop-blur-xl bg-white/60 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                  Watch Demo
                </div>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center gap-6 text-sm text-brand-600"
            >
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-brand-400" />
                2 minutes to setup
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <GlowCard className="p-8 backdrop-blur-xl bg-white/80 border border-brand-200/60 shadow-brand-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-brand-800">Invoice #001</h3>
                  <span className="px-3 py-1 bg-emerald-100/80 text-emerald-700 rounded-full text-sm font-medium backdrop-blur-sm">
                    PAID ✨
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-brand-700">Math Tutoring Session</p>
                  <p className="text-3xl font-bold text-brand-800">$45.00</p>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-brand-100/80 to-brand-200/80 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-800">Payment received!</p>
                      <p className="text-sm text-brand-700">2 minutes after sending</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/60"
            >
              <div className="text-2xl font-bold text-emerald-500">3x</div>
              <div className="text-sm text-zinc-600">Faster payments</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ProblemSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 0.05, scale: 1 } : {}}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-20 left-20 w-64 h-64 bg-red-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 0.05, scale: 1 } : {}}
          transition={{ duration: 2, delay: 0.8 }}
          className="absolute bottom-20 right-20 w-48 h-48 bg-orange-500 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.8 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100
          }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl font-bold mb-6 text-brand-800 font-display"
          >
            Still chasing payments like it's a{' '}
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ 
                duration: 0.8, 
                delay: 0.6,
                type: "spring",
                stiffness: 200
              }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"
            >
              part-time job?
            </motion.span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -100, rotateY: -45 }}
            animate={inView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ 
              duration: 1.0, 
              delay: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="space-y-8 text-center lg:text-left"
          >
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl text-brand-700 leading-relaxed"
            >
              You know the drill. Another tutoring session ends. Another "I'll Venmo you later" that never comes. 
              You're stuck sending awkward reminders, losing track of who owes what, and feeling unprofessional 
              asking for your own money.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="text-xl text-brand-700 leading-relaxed"
            >
              Meanwhile, you've got actual work to do—not playing debt collector for money you've already earned.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ 
              opacity: 0, 
              x: 100, 
              rotateY: 45,
              scale: 0.7
            }}
            animate={inView ? { 
              opacity: 1, 
              x: 0, 
              rotateY: 0,
              scale: 1
            } : {}}
            transition={{ 
              duration: 1.2, 
              delay: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 80
            }}
            className="flex justify-center"
          >
            {/* Enhanced container for BentoGrid with dramatic entrance */}
            <motion.div
              initial={{ 
                boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
                scale: 0.8
              }}
              animate={inView ? { 
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)",
                scale: 1
              } : {}}
              transition={{ 
                duration: 1.5, 
                delay: 0.8,
                ease: "easeOut"
              }}
              className="relative"
            >
              {/* Magical glow effect around widgets */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={inView ? { opacity: 0.6, scale: 1.2 } : {}}
                transition={{ 
                  duration: 2, 
                  delay: 1.0,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"
              />
              
              {/* Particles floating around widgets */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200,
                      scale: 0
                    }}
                    animate={inView ? {
                      opacity: [0, 0.6, 0],
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                      scale: [0, 1, 0]
                    } : {}}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: 1.2 + i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute w-2 h-2 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`
                    }}
                  />
                ))}
              </div>
              
              <BentoGrid />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SolutionSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-brand-100/60 via-brand-200/60 to-brand-100/80 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-brand-800 font-display">
            Meet Billr: The{' '}
            <GradientText 
              text="Simple Way"
              gradient="from-brand-700 via-brand-600 to-brand-800"
            />{' '}
            to Invoice and Get Paid
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <p className="text-lg text-brand-700 leading-relaxed">
              Transform your side hustle into a professional business. Create invoices in seconds, 
              send one payment link, and watch money flow directly to your account.
            </p>
            
            <p className="text-lg text-brand-700 leading-relaxed">
              Clean transactions, happy clients, and zero awkward money conversations. 
              Built for creators, freelancers, and hustlers who want to get paid like pros.
            </p>

            <div className="space-y-6">
              {[
                { step: 1, title: "Create Invoice", desc: "Add your service and amount in seconds", icon: CreditCard },
                { step: 2, title: "Send Link", desc: "Share via text, email, or any app", icon: MessageSquare },
                { step: 3, title: "Get Paid", desc: "Money hits your account instantly", icon: TrendingUp },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-brand-800 mb-1">{item.title}</h4>
                    <p className="text-brand-700">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <GlowCard className="p-8 backdrop-blur-xl bg-white/80 border border-brand-200/50 shadow-brand-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-brand-300/60 pb-4">
                  <h3 className="text-xl font-semibold text-brand-800">Your Dashboard</h3>
                  <div className="text-2xl font-bold text-emerald-600">$1,247</div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { service: "Math Tutoring", amount: "$45", status: "paid" },
                    { service: "Guitar Lesson", amount: "$60", status: "paid" },
                    { service: "Web Design", amount: "$200", status: "pending" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-brand-200/40"
                    >
                      <span className="font-medium text-brand-800">{item.service}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-brand-800">{item.amount}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const features = [
    {
      icon: BarChart3,
      title: "Track Everything in One Place",
      description: "See all your invoices, payments, and earnings at a glance. Perfect for taxes and knowing exactly what you've earned.",
      gradient: "from-brand-600 to-brand-700",
    },
    {
      icon: Star,
      title: "Look Professional Without the Hassle", 
      description: "Send polished invoices that make you look established, even if you're just starting out. Your clients will appreciate the clarity.",
      gradient: "from-brand-500 to-brand-600",
    },
    {
      icon: Zap,
      title: "Get Paid 3x Faster",
      description: "One-click payment links mean clients pay immediately instead of 'later.' No more awkward follow-ups needed.",
      gradient: "from-emerald-500 to-brand-500",
    },
  ];

  return (
    <section id="features" ref={ref} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-brand-800 font-display">
            Why Thousands Choose{' '}
            <GradientText 
              text="Billr"
              gradient="from-brand-700 via-brand-600 to-brand-800"
            />
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlowCard className="p-8 h-full backdrop-blur-xl bg-white/80 border border-brand-200/40 text-center group hover:scale-105 transition-all duration-300 shadow-brand">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-brand-800 mb-4">{feature.title}</h3>
                <p className="text-brand-700 leading-relaxed">{feature.description}</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SocialProofSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const testimonials = [
    {
      name: "Sarah",
      role: "Tutor", 
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&h=60&q=80",
      quote: "Finally, I don't have to remind people to pay me. They just do it!",
    },
    {
      name: "Mike",
      role: "Personal Trainer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face", 
      quote: "Game changer for my side hustle. I look legit now.",
    },
    {
      name: "Jessica", 
      role: "Freelance Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      quote: "Lost track of who owes me what? Never again.",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-brand-100/60 to-brand-200/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-brand-800 font-display">
            Join thousands who've stopped{' '}
            <GradientText 
              text="chasing payments"
              gradient="from-red-500 via-orange-500 to-amber-500"
            />
          </h2>
        </motion.div>

        <div className="relative overflow-hidden rounded-2xl">
          <div className="flex gap-6 animate-scroll pause-animation py-4">
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: (index % testimonials.length) * 0.1 }}
                className="flex-shrink-0 w-80"
              >
                <div className="p-6 backdrop-blur-xl bg-white/95 border border-brand-200/50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl h-full rounded-xl">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-base text-brand-700 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random&color=fff&size=60`;
                      }}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-200/50"
                    />
                    <div>
                      <div className="font-semibold text-brand-800">{testimonial.name}</div>
                      <div className="text-sm text-brand-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-brand-100/60 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-brand-200/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
};

const CTASection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-800" />
      <div className="absolute inset-0 bg-brand-900/20" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-5xl font-bold text-white mb-6 font-display">
            Ready to Get Paid Without the Chase?
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands who've ditched the payment chase. Start with 5 free invoices.
          </p>
          
          <motion.a
            href="/auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-12 py-6 bg-white text-zinc-800 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 group"
          >
            <Sparkles className="w-6 h-6" />
            Start Getting Paid Today
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.a>
          
          <p className="text-white/80">
            Join 12,000+ freelancers • No credit card required
          </p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6"
          >
            <a 
              href="#faq" 
              className="text-white/80 hover:text-white transition-colors underline underline-offset-4 font-medium"
            >
              Have questions? Check our FAQ →
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const FAQSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is this really free to try?",
      answer: "Yes! Your first 5 invoices are 100% free. No credit card required. See if Billr works for you before paying anything."
    },
    {
      question: "How is this different from just using Venmo?", 
      answer: "Billr gives you a paper trail for taxes, professional invoices that build your credibility, and automatic payment tracking. Plus, clients can pay however they want—you still get paid instantly."
    },
    {
      question: "How fast do I actually get paid?",
      answer: "Most payments process instantly to your bank account. Some payment methods may take 1-2 business days, but you'll see the money much faster than chasing down Venmo requests."
    },
    {
      question: "Can I customize my invoices?",
      answer: "Absolutely! Add your logo, business details, custom notes, and even terms. Make every invoice reflect your brand and look completely professional."
    },
    {
      question: "What happens after my 5 free invoices?",
      answer: "You'll love Billr so much, you'll want to upgrade! Our paid plans start at just $9/month and include unlimited invoices, advanced features, and priority support."
    },
    {
      question: "Do you take a percentage of my payments?",
      answer: "Nope! We don't take any cut of your earnings. You pay a simple monthly fee and keep 100% of what you earn. No surprise fees or hidden percentages."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes! We use bank-level encryption and never store your payment information. All transactions are processed through secure, industry-standard payment processors."
    },
    {
      question: "Do my clients need to download an app or create an account?",
      answer: "Nope. Your client simply receives an email and clicks the payment link – that's it. They can pay via credit card or bank transfer through our secure system. They don't have to sign up for anything, so payment is easy for them too."
    },
    {
      question: "I'm not a \"business.\" Can I use Billr?",
      answer: "Absolutely. Billr is built for individuals who work hard and deserve to get paid smoothly – whether you're a tutor, contractor, dog walker, coach, you name it. You do not need an LLC or any special setup. If you provide a service and need to request payment for it, Billr will work for you, in the US, Canada, or anywhere else in the world. (We're used by everyone from part-time gig workers to full-time freelancers.)"
    }
  ];

  return (
    <section id="faq" ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-brand-800 font-display">Common Questions</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlowCard className="backdrop-blur-xl bg-white/80 border border-brand-200/40 overflow-hidden shadow-brand">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-brand-100/20 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-brand-800">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="w-5 h-5 text-brand-600 rotate-90" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-brand-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingSection: React.FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section id="pricing" ref={ref} className="py-20 px-4 bg-gradient-to-br from-brand-100/60 to-brand-200/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-brand-800 font-display">Simple, Fair Pricing</h2>
          <p className="text-xl text-brand-700 max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, no percentage cuts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GlowCard className="p-8 backdrop-blur-xl bg-white/80 border border-brand-200/40 text-center shadow-brand">
              <h3 className="text-2xl font-bold text-brand-800 mb-4">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-brand-700">Free</span>
              </div>
              <div className="text-left space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">5 invoices per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Professional templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Payment tracking</span>
                </div>
              </div>
              <button className="w-full py-3 px-6 border-2 border-brand-300 text-brand-700 rounded-xl font-semibold hover:bg-brand-100/50 transition-colors">
                Get Started
              </button>
            </GlowCard>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlowCard className="p-8 backdrop-blur-xl bg-white/90 border-2 border-brand-400 text-center shadow-brand-lg relative">
              <h3 className="text-2xl font-bold text-brand-800 mb-4">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-brand-700">$9</span>
                <span className="text-brand-600">/month</span>
              </div>
              <div className="text-left space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Unlimited invoices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Custom branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Auto-reminders</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Analytics dashboard</span>
                </div>
              </div>
              <button className="w-full py-3 px-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-semibold shadow-brand-lg hover:shadow-xl transition-all">
                Start Pro Trial
              </button>
            </GlowCard>
          </motion.div>

          {/* Business Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlowCard className="p-8 backdrop-blur-xl bg-white/80 border border-brand-200/40 text-center shadow-brand">
              <h3 className="text-2xl font-bold text-brand-800 mb-4">Business</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-brand-700">$29</span>
                <span className="text-brand-600">/month</span>
              </div>
              <div className="text-left space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Everything in Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Team collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Advanced reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-brand-700">Priority support</span>
                </div>
              </div>
              <button className="w-full py-3 px-6 border-2 border-brand-300 text-brand-700 rounded-xl font-semibold hover:bg-brand-100/50 transition-colors">
                Contact Sales
              </button>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-800 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <GradientText 
                text="Billr"
                gradient="from-brand-200 to-brand-100"
              />
            </div>
            <p className="text-brand-200 mb-4">Finally, get paid without the chase.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <div className="space-y-2 text-brand-300">
              <a href="#" className="block hover:text-white transition-colors">Features</a>
              <a href="#" className="block hover:text-white transition-colors">Pricing</a>
              <a href="#" className="block hover:text-white transition-colors">Security</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2 text-brand-300">
              <a href="#" className="block hover:text-white transition-colors">FAQ</a>
              <a href="#" className="block hover:text-white transition-colors">Help Center</a>
              <a href="#" className="block hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2 text-brand-300">
              <a href="#" className="block hover:text-white transition-colors">Privacy</a>
              <a href="#" className="block hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-brand-700 pt-8 text-center text-brand-300">
          <p>&copy; 2024 Billr. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default App; 