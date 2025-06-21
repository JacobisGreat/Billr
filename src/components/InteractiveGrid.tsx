import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GridSquareProps {
  index: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
}

const GridSquare: React.FC<GridSquareProps> = ({ index, isHovered, onHover }) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setIsActive(true), Math.random() * 200);
      return () => clearTimeout(timer);
    } else {
      setIsActive(false);
    }
  }, [isHovered]);

  return (
    <motion.div
      className="w-8 h-8 border border-indigo-200/30 relative cursor-pointer"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-500/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.8,
        }}
        transition={{ 
          duration: 0.3,
          ease: "easeOut"
        }}
      />
      
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-indigo-400/10 rounded-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export const InteractiveGrid: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [rippleOrigin, setRippleOrigin] = useState<{ x: number; y: number } | null>(null);
  
  const gridSize = 12;
  const totalSquares = gridSize * gridSize;

  const handleHover = (index: number | null) => {
    setHoveredIndex(index);
    if (index !== null) {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      setRippleOrigin({ x: col, y: row });
    } else {
      setRippleOrigin(null);
    }
  };

  const getDistance = (index: number, origin: { x: number; y: number }) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return Math.sqrt(Math.pow(col - origin.x, 2) + Math.pow(row - origin.y, 2));
  };

  const isNearHovered = (index: number) => {
    if (hoveredIndex === null || rippleOrigin === null) return false;
    const distance = getDistance(index, rippleOrigin);
    return distance <= 3;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <motion.div 
          className="grid grid-cols-12 gap-1 p-8 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {Array.from({ length: totalSquares }, (_, index) => (
            <GridSquare
              key={index}
              index={index}
              isHovered={isNearHovered(index)}
              onHover={handleHover}
            />
          ))}
        </motion.div>
        
        <motion.p 
          className="text-center mt-4 text-sm text-slate-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredIndex !== null ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        >
          {hoveredIndex !== null 
            ? "✨ Hover the small squares to see the background effect" 
            : "Hover to interact"}
        </motion.p>
      </div>
    </div>
  );
}; 