import React from 'react';
import { motion } from 'framer-motion';

export const FloatingElements: React.FC = () => {
  const elements = [
    { 
      id: 1, 
      size: 100, 
      x: '10%', 
      y: '20%', 
      delay: 0,
      duration: 8,
      gradient: 'from-blue-400/10 to-purple-500/10'
    },
    { 
      id: 2, 
      size: 60, 
      x: '80%', 
      y: '10%', 
      delay: 1,
      duration: 6,
      gradient: 'from-pink-400/10 to-red-500/10'
    },
    { 
      id: 3, 
      size: 80, 
      x: '70%', 
      y: '70%', 
      delay: 2,
      duration: 10,
      gradient: 'from-green-400/10 to-blue-500/10'
    },
    { 
      id: 4, 
      size: 40, 
      x: '20%', 
      y: '80%', 
      delay: 0.5,
      duration: 7,
      gradient: 'from-yellow-400/10 to-orange-500/10'
    },
    { 
      id: 5, 
      size: 120, 
      x: '90%', 
      y: '50%', 
      delay: 1.5,
      duration: 9,
      gradient: 'from-indigo-400/10 to-cyan-500/10'
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute rounded-full bg-gradient-to-br ${element.gradient} blur-xl`}
          style={{
            width: element.size,
            height: element.size,
            left: element.x,
            top: element.y,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Additional geometric shapes */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-16 h-16 border border-purple-300/30 rotate-45"
        animate={{
          rotate: [45, 225, 45],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full"
        animate={{
          y: [0, -40, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}; 