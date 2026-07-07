"use client";

import { useContent } from "@/context/ContentContext";

export default function Footer() {
  const { content } = useContent();
  
  const heroContent = content?.hero?.en || content?.hero || { 
    brideName: "Bride", 
    groomName: "Groom"
  };

  return (
    <footer className="w-full bg-brand-dark py-16 border-t border-primary/20 relative z-20 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Monogram or Initials */}
        <div className="mb-8 font-script text-5xl md:text-6xl text-gradient-gold drop-shadow-md">
          {heroContent?.brideName?.charAt(0) || "B"} & {heroContent?.groomName?.charAt(0) || "G"}
        </div>
        
        <p className="text-gray-300 font-light tracking-wide text-lg md:text-xl italic mb-4 max-w-md">
          Thank you for being a part of our special day.
        </p>
        
        <div className="w-24 h-px bg-primary/30 my-8"></div>
        
        <div className="flex flex-col items-center space-y-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary/80 font-bold">
            &copy; {new Date().getFullYear()} {heroContent.brideName} & {heroContent.groomName}.
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600">
            All rights reserved. Designed with love.
          </p>
        </div>
      </div>
    </footer>
  );
}
