import React from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageSquare, Clock, CreditCard, AlertTriangle, DollarSign } from 'lucide-react';

interface ProblemCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  size: 'large' | 'medium' | 'small';
}

const problems: ProblemCard[] = [
  {
    title: "\"I'll Venmo you later\"",
    description: "Famous last words that never turn into actual payments",
    icon: MessageSquare,
    gradient: "from-red-500 to-orange-500",
    size: 'large'
  },
  {
    title: "Forgotten IOUs",
    description: "Sticky notes everywhere, but still no money",
    icon: AlertTriangle,
    gradient: "from-amber-500 to-yellow-500",
    size: 'medium'
  },
  {
    title: "Payment Guessing Game",
    description: "Was it $45 or $50? Did they already pay?",
    icon: DollarSign,
    gradient: "from-emerald-500 to-teal-500",
    size: 'medium'
  },
  {
    title: "Awkward Money Talks",
    description: "The dreaded 'hey, remember that money?' conversation",
    icon: CreditCard,
    gradient: "from-blue-500 to-indigo-500",
    size: 'small'
  },
  {
    title: "The Waiting Game",
    description: "Weeks pass, your time was free apparently",
    icon: Clock,
    gradient: "from-purple-500 to-pink-500",
    size: 'small'
  }
];

// Enhanced animation variants for dramatic entrance
const containerVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    rotateY: 15
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 60, 
    scale: 0.8,
    rotateX: 45
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }),
  hover: {
    y: -12,
    scale: 1.03,
    rotateX: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const iconVariants = {
  hidden: {
    scale: 0,
    rotate: -180
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      delay: 0.5,
      duration: 0.6,
      type: "spring",
      stiffness: 200
    }
  },
  hover: {
    scale: 1.3,
    rotate: [0, -15, 15, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const textVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.7,
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-6, 6, -6],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.08, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const shimmerVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const BentoGrid: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { 
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <motion.div 
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="grid grid-cols-6 grid-rows-4 gap-4 h-[500px] perspective-1000">
        {/* Large card - "I'll Venmo you later" */}
        <motion.div
          custom={0}
          variants={cardVariants}
          whileHover="hover"
          className="col-span-3 row-span-3 p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden transform-gpu"
        >
          <motion.div 
            variants={floatingVariants}
            animate="animate"
            className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 group-hover:from-red-500/20 group-hover:to-orange-500/20 transition-all duration-500" 
          />
          
          {/* Animated shimmer effect */}
          <motion.div
            variants={shimmerVariants}
            animate="animate"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              backgroundSize: '200% 100%'
            }}
          />
          
          {/* Animated background particles */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <motion.div
              animate={{
                x: [0, 120, 0],
                y: [0, -60, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-4 left-4 w-2 h-2 bg-red-400/40 rounded-full"
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, 80, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
                delay: 1
              }}
              className="absolute bottom-8 right-8 w-1.5 h-1.5 bg-orange-400/50 rounded-full"
            />
            <motion.div
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
                delay: 2
              }}
              className="absolute top-1/2 right-1/4 w-1 h-1 bg-red-300/60 rounded-full"
            />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <motion.div 
              variants={iconVariants}
              className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-red-500/40 group-hover:shadow-xl"
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <motion.h3 
                variants={textVariants}
                className="text-xl font-bold text-brand-800 mb-3 leading-tight group-hover:text-red-600 transition-colors duration-300"
              >
                "I'll Venmo you later"
              </motion.h3>
              <motion.p 
                variants={textVariants}
                className="text-brand-700/80 text-base leading-relaxed group-hover:text-brand-700 transition-colors duration-300"
              >
                Famous last words that never turn into actual payments
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Medium card 1 - Forgotten IOUs */}
        <motion.div
          custom={1}
          variants={cardVariants}
          whileHover="hover"
          className="col-span-3 row-span-2 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden transform-gpu"
        >
          <motion.div 
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 group-hover:from-amber-500/20 group-hover:to-yellow-500/20 transition-all duration-500" 
          />
          
          <div className="relative z-10 h-full flex flex-col">
            <motion.div 
              variants={iconVariants}
              className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-amber-500/40 group-hover:shadow-xl"
            >
              <AlertTriangle className="w-5 h-5 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <motion.h3 
                variants={textVariants}
                className="text-lg font-bold text-brand-800 mb-2 leading-tight group-hover:text-amber-600 transition-colors duration-300"
              >
                Forgotten IOUs
              </motion.h3>
              <motion.p 
                variants={textVariants}
                className="text-brand-700/80 text-sm leading-relaxed group-hover:text-brand-700 transition-colors duration-300"
              >
                Sticky notes everywhere, but still no money
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Medium card 2 - Payment Guessing Game */}
        <motion.div
          custom={2}
          variants={cardVariants}
          whileHover="hover"
          className="col-span-3 row-span-2 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden transform-gpu"
        >
          <motion.div 
            variants={floatingVariants}
            animate="animate"
            className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all duration-500" 
          />
          
          <div className="relative z-10 h-full flex flex-col">
            <motion.div 
              variants={iconVariants}
              className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-emerald-500/40 group-hover:shadow-xl"
            >
              <DollarSign className="w-5 h-5 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <motion.h3 
                variants={textVariants}
                className="text-lg font-bold text-brand-800 mb-2 leading-tight group-hover:text-emerald-600 transition-colors duration-300"
              >
                Payment Guessing Game
              </motion.h3>
              <motion.p 
                variants={textVariants}
                className="text-brand-700/80 text-sm leading-relaxed group-hover:text-brand-700 transition-colors duration-300"
              >
                Was it $45 or $50? Did they already pay?
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Small card 1 - Awkward Money Talks */}
        <motion.div
          custom={3}
          variants={cardVariants}
          whileHover="hover"
          className="col-span-3 row-span-1 p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden flex items-center gap-4 transform-gpu"
        >
          <motion.div 
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-500" 
          />
          
          <div className="relative z-10 flex items-center gap-4 w-full">
            <motion.div 
              variants={iconVariants}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/40 group-hover:shadow-xl flex-shrink-0"
            >
              <CreditCard className="w-4 h-4 text-white" />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h3 
                variants={textVariants}
                className="text-base font-bold text-brand-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors duration-300"
              >
                Awkward Money Talks
              </motion.h3>
              <motion.p 
                variants={textVariants}
                className="text-brand-700/80 text-xs leading-tight group-hover:text-brand-700 transition-colors duration-300"
              >
                The dreaded "hey, remember that money?" conversation
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Small card 2 - The Waiting Game */}
        <motion.div
          custom={4}
          variants={cardVariants}
          whileHover="hover"
          className="col-span-3 row-span-1 p-4 rounded-3xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden flex items-center gap-4 transform-gpu"
        >
          <motion.div 
            variants={floatingVariants}
            animate="animate"
            className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500" 
          />
          
          {/* Enhanced ticking clock animation */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-2 right-2 w-1 h-1 bg-purple-400/60 rounded-full"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-pink-400/70 rounded-full"
            />
          </div>
          
          <div className="relative z-10 flex items-center gap-4 w-full">
            <motion.div 
              variants={iconVariants}
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/40 group-hover:shadow-xl flex-shrink-0"
            >
              <motion.div
                animate={{
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
              <Clock className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h3 
                variants={textVariants}
                className="text-base font-bold text-brand-800 mb-1 leading-tight group-hover:text-purple-600 transition-colors duration-300"
              >
                The Waiting Game
              </motion.h3>
              <motion.p 
                variants={textVariants}
                className="text-brand-700/80 text-xs leading-tight group-hover:text-brand-700 transition-colors duration-300"
              >
                Weeks pass, your time was free apparently
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}; 