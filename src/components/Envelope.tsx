/* eslint-disable */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useContent } from "@/context/ContentContext";

export default function Envelope({ onComplete }: { onComplete: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { content } = useContent();

  const brideName = content?.hero?.en?.brideName || content?.hero?.brideName || "Vishmi";
  const groomName = content?.hero?.en?.groomName || content?.hero?.groomName || "Pruthuvi";
  const monogram = `${brideName.charAt(0)} & ${groomName.charAt(0)}`;

  useEffect(() => {
    // Simulate initial asset loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    if (!isLoaded || isOpen) return;
    setIsOpen(true);
  };

  const handleLetterClick = (e: React.MouseEvent) => {
    if (!isOpen || isFadingOut) return;
    e.stopPropagation();
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 1500); // Wait for fade out to finish
  };

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          key="envelope-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.2, transition: { duration: 1.5, ease: "easeInOut" } }}
          className="fixed top-0 left-0 w-full h-[100dvh] z-[100] flex flex-col items-center justify-center bg-dark-bg overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-600/30 via-transparent to-transparent" />

          {/* Envelope Container */}
          <motion.div 
            className="relative m-auto w-[300px] h-[200px] sm:w-[340px] sm:h-[220px] md:w-[480px] md:h-[320px] drop-shadow-2xl cursor-pointer group"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            onClick={handleOpen}
          >
            {/* Inner Letter (slides up when opened) */}
            <motion.div 
              className={`absolute inset-2 md:inset-4 bg-[#FFF4E6] rounded-sm shadow-inner flex flex-col items-center justify-center p-6 border-2 border-primary/30 z-10 ${isOpen ? 'cursor-pointer hover:bg-[#fff9f0] transition-colors duration-300' : ''}`}
              initial={{ y: 0 }}
              animate={{ y: isOpen ? -150 : 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              onClick={handleLetterClick}
            >
              <div className="text-light-bg text-center w-full px-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <p className="text-xs tracking-[0.3em] uppercase mb-2 text-[#db9b71] font-bold">You're Invited</p>
                <h1 className="text-3xl md:text-4xl font-script text-[#db9b71] mb-2 break-words leading-tight drop-shadow-sm">{brideName} & {groomName}</h1>
                <p className="text-[10px] tracking-widest text-[#A86A41] uppercase font-semibold">The Royal Wedding</p>
              </div>
            </motion.div>

            {/* Envelope Back (behind the letter) */}
            <div className="absolute inset-0 bg-[#FDF6F4] rounded-lg shadow-xl z-0 border border-primary/20"></div>

            {/* Envelope Front */}
            <div className="absolute inset-0 z-20 overflow-hidden rounded-lg pointer-events-none">
              {/* Left Flap */}
              <div className="absolute inset-0 bg-[#FAF0ED]"
                   style={{ clipPath: "polygon(0 0, 50% 60%, 0 100%)" }}></div>
              {/* Right Flap */}
              <div className="absolute inset-0 bg-[#FFFDFD]"
                   style={{ clipPath: "polygon(100% 0, 50% 60%, 100% 100%)" }}></div>
              {/* Bottom Flap */}
              <div className="absolute inset-0 bg-[#FDF6F4] shadow-[0_-10px_20px_rgba(219,155,113,0.1)] border-t border-primary/10"
                   style={{ clipPath: "polygon(0 100%, 50% 60%, 100% 100%)" }}></div>
            </div>

            {/* Envelope Top Flap (opens) */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-[60%] origin-top"
              initial={{ rotateX: 0, zIndex: 30 }}
              animate={{ 
                rotateX: isOpen ? 180 : 0,
                zIndex: isOpen ? [30, 30, 0] : [0, 30, 30]
              }}
              transition={{ 
                rotateX: { duration: 1, ease: "easeInOut" },
                zIndex: { times: [0, 0.5, 1], duration: 1 }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Flap Graphic (Front) */}
              <div className="absolute inset-0 w-full h-full bg-[#FFFFFF] shadow-[0_5px_15px_rgba(219,155,113,0.15)]" 
                   style={{ 
                     clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                     backfaceVisibility: "hidden"
                   }}>
              </div>
              
              {/* Flap Backside (visible when open) */}
              <div className="absolute inset-0 w-full h-full bg-[#FDF6F4]"
                   style={{ 
                     clipPath: "polygon(0 0, 100% 0, 50% 100%)", 
                     transform: "rotateY(180deg)",
                     backfaceVisibility: "hidden" 
                   }}>
              </div>
            </motion.div>

            {/* Wax Seal */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[10px] md:-translate-y-[20px] z-40 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#F0C9B3] via-[#db9b71] to-[#A86A41] shadow-[0_5px_15px_rgba(219,155,113,0.4),inset_0_2px_4px_rgba(255,255,255,0.6)] flex items-center justify-center cursor-pointer border border-[#A86A41]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isOpen ? 0 : 1, 
                opacity: isOpen ? 0 : 1,
                boxShadow: isLoaded && !isOpen ? ["0_0_0px_rgba(219,155,113,0.5)", "0_0_20px_rgba(219,155,113,0.8)", "0_0_0px_rgba(219,155,113,0.5)"] : "0_5px_15px_rgba(219,155,113,0.4)"
              }}
              transition={{ 
                scale: { duration: 0.5 },
                opacity: { duration: 0.5 },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/40 flex flex-col items-center justify-center text-white">
                {isLoaded ? (
                  <>
                    <span className="font-bold text-lg md:text-xl leading-none drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>{monogram}</span>
                  </>
                ) : (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                )}
              </div>
            </motion.div>
            
            {/* Click to open hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded && !isFadingOut ? 1 : 0 }}
              className="absolute -bottom-12 left-0 w-full text-center z-40 pointer-events-none"
            >
              <p className="text-primary text-xs tracking-widest uppercase animate-pulse">
                {!isOpen ? "Click to open" : "Click invitation to enter"}
              </p>
            </motion.div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

