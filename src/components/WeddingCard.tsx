/* eslint-disable */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";
import { Image as ImageIcon } from "lucide-react";

export default function WeddingCard() {
  const { content } = useContent();
  const weddingCardContent = content?.weddingCard || {
    imageUrl: ""
  };

  return (
    <section className="py-20 md:py-32 bg-brand-dark text-foreground relative overflow-hidden" id="wedding-card">
      <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.4em] text-primary mb-4 font-semibold">The Details</h2>
          <h2 className="text-4xl md:text-6xl font-playfair text-gradient-gold mb-6 drop-shadow-md">Wedding Invitation</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8 opacity-50"></div>
          <p className="text-gray-400 font-light tracking-wide max-w-2xl mx-auto">
            You are cordially invited to celebrate our special day with us.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 50 }}
          className="relative max-w-lg mx-auto w-full group perspective-1000"
        >
          <div className="p-4 md:p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden bg-brand-surface border border-primary/20 backdrop-blur-md transition-transform duration-700 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_40px_80px_rgba(212,175,55,0.15)] group-hover:-translate-y-2">
            {/* Elegant Inner Border */}
            <div className="absolute inset-4 border border-primary/30 rounded-xl pointer-events-none z-20 mix-blend-overlay"></div>
            
            {/* Aspect Ratio container for Portrait image */}
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-brand-dark bg-brand-dark flex items-center justify-center">
              {weddingCardContent.imageUrl ? (
                <img
                  key={weddingCardContent.imageUrl}
                  src={weddingCardContent.imageUrl}
                  alt="Wedding Card"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary/40 gap-6 p-8 text-center bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-brand-dark/85 backdrop-blur-sm"></div>
                  <div className="w-16 h-16 border border-primary/50 rounded-full flex items-center justify-center relative z-10 mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="relative z-10 font-playfair">
                    <p className="text-xl text-primary mb-2 italic">Invitation coming soon</p>
                    <p className="text-xs uppercase tracking-[0.3em] font-sans text-gray-500">Stay Tuned</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
      
      {/* Decorative Radial Elements Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-brand-dark to-brand-dark" />
    </section>
  );
}

