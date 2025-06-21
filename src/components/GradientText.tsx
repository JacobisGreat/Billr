import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  text: string;
  gradient?: string;
  className?: string;
  animate?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  gradient = "from-indigo-600 via-purple-600 to-pink-600",
  className = "",
  animate = true
}) => {
  const words = text.split(' ');

  if (!animate) {
    return (
      <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient} ${className}`}>
        {text}
      </span>
    );
  }

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            ease: "easeOut"
          }}
          whileHover={{
            scale: 1.05,
            textShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
          }}
        >
          {word}
          {index < words.length - 1 && ' '}
        </motion.span>
      ))}
    </span>
  );
}; 