/* eslint-disable */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";

export default function PreShootVideo() {
  const { content } = useContent();
  const preShootContent = content?.preShoot?.en || content?.preShoot || {
    title: "",
    description: "",
    videoUrl: ""
  };

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = React.useState(true);

  React.useEffect(() => {
    if (videoRef.current) {
      // Explicitly play the video to ensure autoplay works even if dynamically mounted
      videoRef.current.play().catch(e => console.warn("Autoplay blocked by browser:", e));
      videoRef.current.muted = isMuted;
    }
  }, [preShootContent.videoUrl, isMuted]);

  return (
    <section className="py-20 md:py-32 text-foreground relative h-full flex flex-col justify-center bg-brand-dark overflow-hidden" id="preshoot">
      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Top: Text & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.4em] text-primary mb-4 font-semibold">Our Memories</h2>
          <h2 className="text-4xl md:text-6xl font-playfair text-gradient-gold mb-6">{preShootContent.title || 'Cinematic Moments'}</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8 opacity-50"></div>
          <p className="text-gray-400 font-light tracking-wide leading-relaxed mb-10 text-lg max-w-2xl mx-auto">
            {preShootContent.description || 'A glimpse into our love story, captured in motion. Experience the moments that led us to this day.'}
          </p>
          
        </motion.div>

        {/* Bottom: Cinematic Video Player (Portrait Frame) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full max-w-sm md:max-w-md mx-auto"
        >
          {/* Glowing Ambient Light Behind Video */}
          <div className="absolute inset-0 bg-primary/30 blur-[80px] rounded-[3rem] transform scale-95 opacity-50"></div>
          
          <div className="p-2 md:p-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden aspect-[9/16] bg-brand-surface/40 border border-primary/30 backdrop-blur-xl group hover:border-primary/60 transition-all duration-500">
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-black flex items-center justify-center">
              {preShootContent.videoUrl ? (
                <video
                  ref={videoRef}
                  key={preShootContent.videoUrl}
                  src={preShootContent.videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  poster="/images/hero-bg.png"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-primary/40 gap-4 bg-[url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                  <span className="text-sm tracking-[0.4em] uppercase font-semibold relative z-10">Video coming soon</span>
                </div>
              )}

              {/* Custom Audio Toggle Button */}
              {preShootContent.videoUrl && (
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 bg-black/60 hover:bg-primary/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg border border-white/20"
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Skip Button (Now under the video) */}
          <div className="flex justify-center mt-10">
            <button 
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 border border-primary/40 text-primary bg-transparent hover:bg-primary/10 transition-all duration-300 uppercase tracking-[0.3em] text-xs flex items-center gap-3 rounded-full font-bold hover:scale-105"
            >
              Skip Video
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/></svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

