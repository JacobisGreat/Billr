import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  showCursor?: boolean;
  startDelay?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  className = "",
  speed = 100,
  showCursor = true,
  startDelay = 0
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showBlinkingCursor, setShowBlinkingCursor] = useState(true);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTyping(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!isTyping) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      // Typing complete, stop cursor blinking after a delay
      const cursorTimer = setTimeout(() => {
        setShowBlinkingCursor(false);
      }, 1000);

      return () => clearTimeout(cursorTimer);
    }
  }, [currentIndex, text, speed, isTyping]);

  return (
    <div className={`inline-block ${className}`}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {displayedText}
      </motion.span>
      
      <AnimatePresence>
        {showCursor && showBlinkingCursor && (
          <motion.span
            className="inline-block w-1 bg-current ml-1"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            |
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}; 