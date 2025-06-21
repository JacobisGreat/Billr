import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Components
import { AnimatedBeam } from './components/AnimatedBeam';
import { InteractiveGrid } from './components/InteractiveGrid';
import { GradientText } from './components/GradientText';
import { TypingAnimation } from './components/TypingAnimation';
import { GlowCard } from './components/GlowCard';
import { BentoGrid } from './components/BentoGrid';
import { FloatingElements } from './components/FloatingElements';
import { GlassmorphismNav } from './components/GlassmorphismNav';
import { ScrollProgress } from './components/ScrollProgress';
import { AuthForms } from './components/AuthForms';
import { Dashboard } from './components/Dashboard';
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthForms />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const LandingPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    window.performance.mark('react-ready');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-neutral-100 relative overflow-hidden">
      <ScrollProgress />
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full grid-bg opacity-20" />
        <FloatingElements />
      </div>

      <GlassmorphismNav isLoaded={isLoaded} />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <SocialProofSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  );
};

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
            <div className="text-6xl lg:text-7xl font-black tracking-tight">
              <TypingAnimation 
                text="Finally, Get Paid"
                className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-slate-800 to-zinc-900"
              />
              <div className="mt-2">
                <GradientText 
                  text="Without the Chase"
                  gradient="from-zinc-700 via-slate-600 to-neutral-700"
                  className="text-6xl lg:text-7xl font-black"
                />
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl text-zinc-600 leading-relaxed max-w-lg"
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-zinc-900 to-slate-800 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden inline-flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Send Your First 5 Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <AnimatedBeam className="absolute bottom-0 left-0 w-full h-0.5" />
              </motion.a>
              
              <button className="px-8 py-4 border-2 border-zinc-200 text-zinc-700 rounded-2xl font-semibold text-lg hover:border-zinc-400 hover:text-zinc-900 transition-all duration-300 backdrop-blur-xl bg-white/40">
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center gap-6 text-sm text-zinc-500"
            >
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
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
            <GlowCard className="p-8 backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-zinc-800">Invoice #001</h3>
                  <span className="px-3 py-1 bg-emerald-100/80 text-emerald-700 rounded-full text-sm font-medium backdrop-blur-sm">
                    PAID ✨
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-zinc-600">Math Tutoring Session</p>
                  <p className="text-3xl font-bold text-zinc-800">$45.00</p>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-zinc-50/80 to-slate-50/80 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-zinc-700 to-slate-600 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-800">Payment received!</p>
                      <p className="text-sm text-zinc-600">2 minutes after sending</p>
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
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section ref={ref} className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-zinc-900">
            Still chasing payments like it's a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              part-time job?
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg text-zinc-600 leading-relaxed">
              You know the drill. Another tutoring session ends. Another "I'll Venmo you later" that never comes. 
              You're stuck sending awkward reminders, losing track of who owes what, and feeling unprofessional 
              asking for your own money.
            </p>
            
            <p className="text-lg text-zinc-600 leading-relaxed">
              Meanwhile, you've got actual work to do—not playing debt collector for money you've already earned.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <BentoGrid />
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
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-zinc-50/80 via-slate-50/80 to-neutral-50/80 relative overflow-hidden backdrop-blur-sm">
      <InteractiveGrid />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-zinc-900">
            Meet Billr: The{' '}
            <GradientText 
              text="Simple Way"
              gradient="from-zinc-800 via-slate-700 to-zinc-800"
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
            <p className="text-lg text-zinc-600 leading-relaxed">
              Billr turns your casual cash jobs into professional transactions. Just create an invoice, 
              send one link, and get paid directly to your account.
            </p>
            
            <p className="text-lg text-zinc-600 leading-relaxed">
              No more "did you get my Venmo request?" No more forgotten payments. Just a clean, 
              professional way to handle money that makes both you and your clients happy.
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
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-zinc-700 to-slate-600 rounded-full flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-zinc-800 mb-1">{item.title}</h4>
                    <p className="text-zinc-600">{item.desc}</p>
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
            <GlowCard className="p-8 backdrop-blur-xl bg-white/60 border border-white/50 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4">
                  <h3 className="text-xl font-semibold text-zinc-800">Your Dashboard</h3>
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
                      className="flex items-center justify-between p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40"
                    >
                      <span className="font-medium text-zinc-800">{item.service}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-800">{item.amount}</span>
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
      gradient: "from-zinc-700 to-slate-600",
    },
    {
      icon: Star,
      title: "Look Professional Without the Hassle", 
      description: "Send polished invoices that make you look established, even if you're just starting out. Your clients will appreciate the clarity.",
      gradient: "from-slate-700 to-zinc-600",
    },
    {
      icon: Zap,
      title: "Get Paid 3x Faster",
      description: "One-click payment links mean clients pay immediately instead of 'later.' No more awkward follow-ups needed.",
      gradient: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-zinc-900">
            Why Thousands Choose{' '}
            <GradientText 
              text="Billr"
              gradient="from-zinc-800 via-slate-700 to-zinc-800"
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
              <GlowCard className="p-8 h-full backdrop-blur-xl bg-white/60 border border-white/40 text-center group hover:scale-105 transition-all duration-300 shadow-xl">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-zinc-800 mb-4">{feature.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
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
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
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
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-slate-50/80 to-zinc-50/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-zinc-900">
            Join thousands who've stopped{' '}
            <GradientText 
              text="chasing payments"
              gradient="from-red-500 via-orange-500 to-amber-500"
            />
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlowCard className="p-8 backdrop-blur-xl bg-white/70 border border-white/50 hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <blockquote className="text-lg text-zinc-700 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-zinc-800">{testimonial.name}</div>
                    <div className="text-sm text-zinc-600">{testimonial.role}</div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
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
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-slate-800 to-zinc-900" />
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Get Paid Without the Chase?
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your first 5 invoices are completely free. See why thousands have ditched the payment awkwardness.
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
      question: "What if my clients don't want another app?",
      answer: "They don't need one! Clients just click your payment link and pay with their preferred method. It's actually easier for them than hunting down your Venmo username."
    }
  ];

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-zinc-900">Common Questions</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlowCard className="backdrop-blur-xl bg-white/60 border border-white/40 overflow-hidden shadow-lg">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/20 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-zinc-800">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="w-5 h-5 text-zinc-600 rotate-90" />
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
                        <p className="text-zinc-600 leading-relaxed">{faq.answer}</p>
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

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <GradientText 
                text="Billr"
                gradient="from-zinc-400 to-slate-400"
              />
            </div>
            <p className="text-zinc-400 mb-4">Finally, get paid without the chase.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <div className="space-y-2 text-zinc-400">
              <a href="#" className="block hover:text-white transition-colors">Features</a>
              <a href="#" className="block hover:text-white transition-colors">Pricing</a>
              <a href="#" className="block hover:text-white transition-colors">Security</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2 text-zinc-400">
              <a href="#" className="block hover:text-white transition-colors">FAQ</a>
              <a href="#" className="block hover:text-white transition-colors">Help Center</a>
              <a href="#" className="block hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2 text-zinc-400">
              <a href="#" className="block hover:text-white transition-colors">Privacy</a>
              <a href="#" className="block hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 text-center text-zinc-400">
          <p>&copy; 2024 Billr. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default App; 