import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, CreditCard, AlertTriangle, DollarSign } from 'lucide-react';

interface BentoProblem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  size: 'small' | 'medium' | 'large';
}

const problems: BentoProblem[] = [
  {
    title: "\"I'll Venmo you later\"",
    description: "Famous last words that never turn into actual payments",
    icon: MessageSquare,
    color: "from-red-500 to-orange-500",
    size: 'large'
  },
  {
    title: "Forgotten IOUs",
    description: "Sticky notes everywhere, but still no money",
    icon: AlertTriangle,
    color: "from-amber-500 to-yellow-500",
    size: 'medium'
  },
  {
    title: "Payment Guessing Game",
    description: "Was it $45 or $50? Did they already pay?",
    icon: DollarSign,
    color: "from-emerald-600 to-teal-600",
    size: 'medium'
  },
  {
    title: "Awkward Money Talks",
    description: "The dreaded 'hey, remember that money?' conversation",
    icon: CreditCard,
    color: "from-blue-500 to-indigo-500",
    size: 'small'
  },
  {
    title: "The Waiting Game",
    description: "Weeks pass, your time was free apparently",
    icon: Clock,
    color: "from-purple-500 to-pink-500",
    size: 'small'
  }
];

export const BentoGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-4 grid-rows-3 gap-4 h-96">
      {problems.map((problem, index) => {
        const gridSizes = {
          large: 'col-span-2 row-span-2',
          medium: 'col-span-2 row-span-1',
          small: 'col-span-1 row-span-1'
        };

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`
              ${gridSizes[problem.size]}
              p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl
              hover:scale-105 transition-all duration-300 group cursor-pointer
              relative overflow-hidden
            `}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${problem.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className={`w-10 h-10 bg-gradient-to-r ${problem.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <problem.icon className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <h3 className="font-bold text-zinc-800 mb-2 text-sm lg:text-base">
                  {problem.title}
                </h3>
                <p className="text-zinc-600 text-xs lg:text-sm leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}; 