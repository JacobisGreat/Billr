import React from 'react';
import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "indigo",
  intensity = "medium"
}) => {
  const getGlowIntensity = () => {
    switch (intensity) {
      case 'low':
        return 'hover:shadow-glow-sm';
      case 'medium':
        return 'hover:shadow-glow';
      case 'high':
        return 'hover:shadow-glow-lg';
      default:
        return 'hover:shadow-glow';
    }
  };

  const getGlowColor = () => {
    switch (glowColor) {
      case 'indigo':
        return 'hover:shadow-indigo-500/25';
      case 'purple':
        return 'hover:shadow-purple-500/25';
      case 'pink':
        return 'hover:shadow-pink-500/25';
      case 'blue':
        return 'hover:shadow-blue-500/25';
      default:
        return 'hover:shadow-indigo-500/25';
    }
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-md
        border border-white/20 shadow-glass
        transition-all duration-500 ease-out
        ${getGlowIntensity()} ${getGlowColor()}
        ${className}
      `}
      whileHover={{
        scale: 1.02,
        rotateX: 2,
        rotateY: 2,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-shimmer bg-[length:200%_100%]"
        initial={{ backgroundPosition: '-200% 0' }}
        animate={{ backgroundPosition: '200% 0' }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Border highlight */}
      <div className="absolute inset-0 rounded-2xl border border-white/30 opacity-0 hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}; 