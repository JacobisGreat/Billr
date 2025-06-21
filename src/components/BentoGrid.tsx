import React from 'react';
import { motion } from 'framer-motion';
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

export const BentoGrid: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-6 grid-rows-4 gap-4 h-[500px]">
        {/* Large card - "I'll Venmo you later" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-3 row-span-3 p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 group-hover:from-red-500/10 group-hover:to-orange-500/10 transition-all duration-300" />
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-brand-800 mb-3 leading-tight">
                "I'll Venmo you later"
              </h3>
              <p className="text-brand-700/80 text-base leading-relaxed">
                Famous last words that never turn into actual payments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Medium card 1 - Forgotten IOUs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="col-span-3 row-span-2 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 group-hover:from-amber-500/10 group-hover:to-yellow-500/10 transition-all duration-300" />
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-brand-800 mb-2 leading-tight">
                Forgotten IOUs
              </h3>
              <p className="text-brand-700/80 text-sm leading-relaxed">
                Sticky notes everywhere, but still no money
              </p>
            </div>
          </div>
        </motion.div>

        {/* Medium card 2 - Payment Guessing Game */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-3 row-span-2 p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-brand-800 mb-2 leading-tight">
                Payment Guessing Game
              </h3>
              <p className="text-brand-700/80 text-sm leading-relaxed">
                Was it $45 or $50? Did they already pay?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Small card 1 - Awkward Money Talks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="col-span-3 row-span-1 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden flex items-center gap-4"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-300" />
          
          <div className="relative z-10 flex items-center gap-4 w-full">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md flex-shrink-0">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-brand-800 mb-1 leading-tight">
                Awkward Money Talks
              </h3>
              <p className="text-brand-700/80 text-xs leading-tight">
                The dreaded "hey, remember that money?" conversation
              </p>
            </div>
          </div>
        </motion.div>

        {/* Small card 2 - The Waiting Game */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="col-span-3 row-span-1 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-brand-200/40 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden flex items-center gap-4"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
          
          <div className="relative z-10 flex items-center gap-4 w-full">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md flex-shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-brand-800 mb-1 leading-tight">
                The Waiting Game
              </h3>
              <p className="text-brand-700/80 text-xs leading-tight">
                Weeks pass, your time was free apparently
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 