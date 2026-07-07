"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate loading time (e.g., for fonts, 3D assets, images)
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Allow time for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-bg"
        >
          {/* Lotus Bloom SVG Animation */}
          <motion.div 
            className="relative flex flex-col items-center justify-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.svg
              width="120"
              height="120"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]"
            >
              {/* Outer Left Petal */}
              <motion.path
                d="M50 80 C 20 80, 10 50, 10 40 C 30 50, 45 65, 50 80"
                stroke="#D4AF37"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Outer Right Petal */}
              <motion.path
                d="M50 80 C 80 80, 90 50, 90 40 C 70 50, 55 65, 50 80"
                stroke="#D4AF37"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Inner Left Petal */}
              <motion.path
                d="M50 80 C 30 75, 25 45, 25 30 C 40 45, 45 60, 50 80"
                stroke="#F3E5AB"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
              />
              {/* Inner Right Petal */}
              <motion.path
                d="M50 80 C 70 75, 75 45, 75 30 C 60 45, 55 60, 50 80"
                stroke="#F3E5AB"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
              />
              {/* Center Petal */}
              <motion.path
                d="M50 80 C 40 65, 40 30, 50 15 C 60 30, 60 65, 50 80"
                stroke="#AA8C2C"
                strokeWidth="2"
                fill="rgba(212, 175, 55, 0.1)"
                initial={{ pathLength: 0, opacity: 0, fill: "rgba(212, 175, 55, 0)" }}
                animate={{ pathLength: 1, opacity: 1, fill: "rgba(212, 175, 55, 0.2)" }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
              />
            </motion.svg>
            
            {/* Monogram Text */}
            <div className="text-3xl font-playfair text-gradient-gold tracking-widest flex items-center gap-2">
              <span>A</span>
              <span className="text-xl text-primary/70">&</span>
              <span>K</span>
            </div>
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-xs tracking-[0.4em] text-primary uppercase mb-2">
              The Royal Wedding
            </span>
            
            {/* Loading Bar */}
            <div className="w-48 h-[1px] bg-gray-800 relative overflow-hidden mt-4">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
