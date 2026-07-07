/* eslint-disable */
"use client";

import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";

export default function OurStory() {
  const { content } = useContent();
  const timelineEventsData = content?.ourStory?.en?.events || content?.ourStory?.events || [];
  const timelineEvents = Array.isArray(timelineEventsData) ? timelineEventsData : [];
  const eventsToDisplay = timelineEvents;

  return (
    <section className="py-20 md:py-32 text-foreground relative h-full bg-brand-dark overflow-hidden" id="story">
      {/* Subtle Lotus Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-[800px] h-[800px] text-primary fill-current">
          <path d="M50 10 C 30 30 10 50 50 90 C 90 50 70 30 50 10 Z" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm uppercase tracking-[0.4em] text-primary mb-4 font-semibold">The Beginning</h2>
          <h3 className="text-4xl md:text-6xl font-playfair text-gradient-gold mb-6 drop-shadow-md">Our Journey</h3>
          <div className="w-12 h-px bg-primary mx-auto mb-6 opacity-50"></div>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[1.15rem] top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>

          {eventsToDisplay.map((event: any, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative flex items-start mb-16 pl-12 md:pl-16 group cursor-default"
            >
              {/* Center Dot */}
              <div className="absolute left-[0.55rem] top-8 w-5 h-5 bg-brand-dark border border-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)] z-10 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.8)] transition-all duration-500">
                 <div className="absolute inset-1 bg-primary rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Content Card */}
              <div className="w-full">
                <div className="glass-panel p-8 md:p-10 rounded-2xl border border-primary/20 shadow-2xl hover:border-primary/40 transition-all duration-700 relative overflow-hidden bg-brand-surface/40 backdrop-blur-md">
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-1000"></div>
                  
                  {/* Giant Year Watermark */}
                  <div className="absolute -bottom-4 right-4 text-7xl md:text-8xl font-playfair font-bold text-primary opacity-[0.03] select-none transition-all duration-1000 group-hover:scale-105 group-hover:opacity-[0.06] group-hover:-translate-y-2">
                    {event.year}
                  </div>

                  {/* Year Badge */}
                  <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
                    {event.year}
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-playfair text-gray-100 mb-4 relative z-10 group-hover:text-primary transition-colors duration-500 drop-shadow-sm">
                    {event.title}
                  </h3>
                  
                  <div className="w-8 h-px bg-primary/30 mb-5 transition-all duration-500 group-hover:w-16"></div>

                  <p className="text-gray-400 font-light leading-relaxed relative z-10 text-sm md:text-base tracking-wide">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

