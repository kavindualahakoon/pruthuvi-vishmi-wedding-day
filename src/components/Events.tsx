/* eslint-disable */
"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import { useContent } from "@/context/ContentContext";

export default function Events() {
  const { content } = useContent();
  const eventsData = content?.weddingEvents?.en?.events || content?.weddingEvents?.en || content?.weddingEvents || [];
  const eventsToDisplay = Array.isArray(eventsData) ? eventsData : [];

  return (
    <section className="py-20 md:py-32 bg-brand-surface text-foreground relative overflow-hidden" id="events">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-sm uppercase tracking-[0.4em] text-primary mb-4 font-semibold">Join Us</h2>
          <h2 className="text-4xl md:text-6xl font-playfair text-gradient-gold mb-6 drop-shadow-md">Wedding Events</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-8 opacity-50"></div>
          <p className="text-gray-400 font-light tracking-wide max-w-2xl mx-auto">
            We are so excited to celebrate with you. Here are the details of our special events.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {eventsToDisplay.map((event: any, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="glass-panel rounded-3xl border border-primary/20 overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 group shadow-xl hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] bg-brand-dark/50"
            >
              {/* Event Header */}
              <div className="bg-brand-dark p-8 border-b border-primary/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <h3 className="text-3xl font-playfair text-primary relative z-10">{event.title}</h3>
              </div>
              
              {/* Event Details */}
              <div className="p-8 md:p-10 flex-grow flex flex-col relative z-10">
                <div className="space-y-8 flex-grow">
                  <div className="flex items-start gap-5">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Date</h4>
                      <p className="text-lg text-gray-200 font-playfair">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-5">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Time</h4>
                      <p className="text-lg text-gray-200 font-playfair">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-5">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Location</h4>
                      <p className="text-lg text-gray-200 font-playfair">{event.location}</p>
                    </div>
                  </div>
                </div>

                {/* Event Timeline */}
                {event.timeline && event.timeline.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-primary/10">
                    <h4 className="text-center font-playfair text-2xl text-gradient-gold mb-8">Timeline</h4>
                    <div className="relative border-l border-primary/30 ml-4 space-y-8">
                      {event.timeline.map((item: any, i: number) => (
                        <div key={i} className="relative pl-8 group/item">
                          <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-surface border border-primary group-hover/item:bg-primary transition-colors"></div>
                          <p className="text-xs font-bold tracking-[0.2em] text-primary mb-1">{item.time}</p>
                          <p className="text-gray-300 font-light">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-10 pt-8 border-t border-primary/10">
                  <p className="text-gray-400 font-light italic mb-10 leading-relaxed text-center">
                    &quot;{event.description}&quot;
                  </p>
                  
                  <a 
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-4 border border-primary/40 text-primary hover:bg-primary/10 transition-all duration-300 uppercase tracking-[0.3em] text-xs font-bold rounded-full"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative Radial Overlay */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none z-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
    </section>
  );
}

