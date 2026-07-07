"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Sparkles({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const colors = ["#db9b71", "#F0C9B3", "#ffffff", "#fef3c7"];
    
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      y: Math.random() * 100, // vh
      size: Math.random() * 4 + 2, // 2px to 6px
      duration: Math.random() * 3 + 2, // 2s to 5s
      delay: Math.random() * 3, // 0s to 3s
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setParticles(newParticles);
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          initial={{ opacity: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [-20, 20],
            x: [-10, 10],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
