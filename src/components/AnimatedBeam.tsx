import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBeamProps {
  className?: string;
  duration?: number;
  delay?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className = "",
  duration = 2,
  delay = 0
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}; 