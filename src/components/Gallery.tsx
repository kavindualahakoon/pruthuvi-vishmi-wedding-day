/* eslint-disable */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";



import { useContent } from "@/context/ContentContext";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { content } = useContent();

  const galleryPhotos = content?.gallery?.filter((photo: any) => photo.visible !== false) || [];

  if (galleryPhotos.length === 0) {
    return null; // Don't render section if there are no visible photos
  }

  return (
    <section className="pt-20 pb-10 md:pt-32 md:pb-16 bg-brand-dark text-foreground relative overflow-hidden" id="gallery">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16 w-full px-4 sm:px-6"
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary mb-4 font-semibold break-words">Memories</h2>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-playfair text-gradient-gold mb-6 drop-shadow-md break-words">Capturing Moments</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-6 md:mb-8 opacity-50"></div>
          <p className="text-gray-400 font-light tracking-wide max-w-[280px] sm:max-w-md md:max-w-lg mx-auto text-sm md:text-base leading-relaxed break-words">
            A collection of beautiful memories leading up to our special day.
          </p>
        </motion.div>

        {/* Inline styles for marquee animation */}
        <style>{`
          @keyframes scrollGallery {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scrollGallery 40s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Infinite Slideshow Carousel */}
        <div className="relative w-full overflow-hidden py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-6 animate-scroll">
            {[...galleryPhotos, ...galleryPhotos].map((photo: any, index: number) => (
              <div
                key={`${photo.id}-${index}`}
                className="relative overflow-hidden rounded-xl group cursor-pointer shrink-0 w-[75vw] sm:w-[40vw] md:w-[350px] lg:w-[450px] h-[300px] sm:h-[400px] lg:h-[550px] shadow-lg"
                onClick={() => setSelectedImage(photo.src)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={photo.src} 
                  alt={photo.alt} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 w-12 h-12 drop-shadow-md" />
                </div>
                
                {/* Elegant Border Frame */}
                <div className="absolute inset-4 border border-white/0 group-hover:border-primary/50 transition-colors duration-500 pointer-events-none rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[200] bg-white/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 text-gray-800 hover:text-primary transition-colors p-2"
          >
            <X className="w-8 h-8" />
          </button>
          
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            src={selectedImage} 
            alt="Enlarged" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(224,156,118,0.15)] border border-primary/20"
          />
        </div>
      )}
    </section>
  );
}

