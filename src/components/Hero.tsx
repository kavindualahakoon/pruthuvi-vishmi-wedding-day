/* eslint-disable */
"use client";

import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useContent } from "@/context/ContentContext";

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { content } = useContent();
  
  // Use English content
  const heroContent = content?.hero?.en || content?.hero || { 
    brideName: "", 
    groomName: "", 
    weddingDate: "", 
    countdownTarget: "" 
  };

  useEffect(() => {
    // Set initial volume lower for background music
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
    }
    
    // Auto-play when mounted (which is after envelope is clicked and user has interacted)
    const playTimer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.log("Audio autoplay prevented by browser:", err));
      }
    }, 1500); // Small delay to sync with envelope transition
    
    return () => clearTimeout(playTimer);
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative w-full min-h-[100dvh] py-20 lg:py-0 overflow-hidden bg-dark-bg flex items-center justify-center">
      {/* Background Audio */}
      <audio ref={audioRef} loop src={heroContent.audioUrl || "/audio/wedding-music.mp3"} preload="auto" />
      {/* Background Image with Slow Zoom */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={heroContent.bgUrl ? { backgroundImage: `url(${heroContent.bgUrl})` } : {}}
        animate={{ scale: [1, 1.1] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        {/* Dark overlay for cinematic effect */}
        <div className="absolute inset-0 bg-brand-dark/70 backdrop-blur-[1px]"></div>
      </motion.div>

      {/* 3D Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        <Canvas style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
          <ambientLight intensity={0.5} />
          <Sparkles count={300} scale={20} size={3} speed={0.1} color="#D4AF37" opacity={0.6} />
        </Canvas>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        <button 
          onClick={toggleAudio}
          className="p-3 rounded-full glass-panel text-primary hover:text-white transition-colors"
        >
          {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        >
          <h2 className="text-sm uppercase tracking-[0.4em] text-primary mb-6 font-semibold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
            Together with their families
          </h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 my-6 w-full"
        >
          <h1 className="text-[16vw] sm:text-[13vw] md:text-[11vw] lg:text-[9vw] font-script text-gradient-gold py-4 px-4 leading-normal text-center break-words w-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            {heroContent.brideName || 'Samadhi'}
          </h1>
          <span className="text-5xl sm:text-6xl md:text-7xl text-brand-gold font-playfair my-2 italic drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">&</span>
          <h1 className="text-[16vw] sm:text-[13vw] md:text-[11vw] lg:text-[9vw] font-script text-gradient-gold py-4 px-4 leading-normal text-center break-words w-full drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            {heroContent.groomName || 'Madhawa'}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="mt-8"
        >
          <p className="text-2xl md:text-3xl text-gray-200 tracking-[0.2em] font-playfair drop-shadow-lg">
            {heroContent.weddingDate || '25 . 12 . 2026'}
          </p>
          <p className="text-sm md:text-base text-gray-400 mt-4 tracking-widest uppercase">
            Colombo, Sri Lanka
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(212, 175, 55, 0.1)", boxShadow: "0px 0px 25px rgba(212, 175, 55, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-16 px-10 py-4 border border-primary/50 text-primary bg-transparent backdrop-blur-sm transition-all duration-300 tracking-[0.3em] uppercase text-xs font-semibold rounded-full"
        >
          Save the Date
        </motion.button>
      </div>

      {/* Decorative Radial Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-60 bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--color-brand-dark)_100%)]" />
    </section>
  );
}

