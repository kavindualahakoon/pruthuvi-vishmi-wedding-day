"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
export default function RSVPForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guestCount: 1,
    foodPreference: "Non-Vegetarian",
    specialNotes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      // Assuming server runs on 5000 and client on 3000
      await axios.post("/api/rsvp", formData);
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        guestCount: 1,
        foodPreference: "Non-Vegetarian",
        specialNotes: "",
      });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <section className="pt-10 pb-20 md:pt-16 md:pb-32 bg-brand-dark text-foreground relative overflow-hidden" id="rsvp">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="flex flex-col lg:flex-row bg-brand-surface/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-primary/20">
          
          {/* Left Side: Decorative Column */}
          <div className="lg:w-5/12 bg-brand-surface p-10 lg:p-16 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-primary/10">
            {/* Elegant Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <h2 className="text-sm uppercase tracking-[0.4em] text-primary mb-4 font-semibold">Be our guest</h2>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-gradient-gold mb-6 leading-tight drop-shadow-md">
                RSVP
              </h2>
              <div className="w-16 h-px bg-primary/50 mb-8"></div>
              <p className="text-gray-300 font-light tracking-wide leading-relaxed text-lg mb-12">
                Will you be joining us?
              </p>
              
              <div className="space-y-4 p-8 border border-primary/20 rounded-2xl bg-brand-dark/40 backdrop-blur-sm shadow-inner">
                <p className="text-xs tracking-[0.3em] uppercase text-primary font-bold">
                  Important Note
                </p>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  Please let us know of your attendance at your earliest convenience so we can finalize our preparations for this magical day.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Form Column */}
          <div className="lg:w-7/12 p-8 lg:p-16 relative">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {status === "success" ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-3xl font-playfair text-primary mb-4">Thank You!</h3>
                  <p className="text-gray-300 font-light text-lg mb-10 tracking-wide">Your RSVP has been beautifully received. We look forward to celebrating with you.</p>
                  <button 
                    onClick={() => setStatus("idle")}
                    className="px-10 py-4 bg-transparent text-primary border border-primary/40 hover:bg-primary/10 transition-all duration-300 uppercase tracking-[0.3em] text-xs font-bold rounded-full shadow-lg"
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2 relative group">
                      <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold absolute -top-2 left-4 bg-brand-surface px-2 z-10 transition-colors group-focus-within:text-primary">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-brand-surface/50 border border-primary/20 focus:border-primary/60 rounded-xl px-5 py-4 text-gray-100 placeholder:text-gray-600 outline-none transition-all shadow-inner font-light"
                        placeholder="Kavindu Bandara"
                      />
                    </div>
                    <div className="space-y-2 relative group">
                      <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold absolute -top-2 left-4 bg-brand-surface px-2 z-10 transition-colors group-focus-within:text-primary">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-brand-surface/50 border border-primary/20 focus:border-primary/60 rounded-xl px-5 py-4 text-gray-100 placeholder:text-gray-600 outline-none transition-all shadow-inner font-light"
                        placeholder="kavindu@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2 relative group">
                      <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold absolute -top-2 left-4 bg-brand-surface px-2 z-10 transition-colors group-focus-within:text-primary">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-brand-surface/50 border border-primary/20 focus:border-primary/60 rounded-xl px-5 py-4 text-gray-100 placeholder:text-gray-600 outline-none transition-all shadow-inner font-light"
                        placeholder="+94 711 123 456"
                      />
                    </div>
                    <div className="space-y-2 relative group">
                      <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold absolute -top-2 left-4 bg-brand-surface px-2 z-10 transition-colors group-focus-within:text-primary">Number of Guests</label>
                      <select 
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleChange}
                        className="w-full bg-brand-surface/50 border border-primary/20 focus:border-primary/60 rounded-xl px-5 py-4 text-gray-100 outline-none transition-all shadow-inner appearance-none cursor-pointer font-light"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num} className="bg-brand-surface text-gray-200">{num} Guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 relative group">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold absolute -top-2 left-4 bg-brand-surface px-2 z-10 transition-colors group-focus-within:text-primary">Food Preference</label>
                    <select 
                      name="foodPreference"
                      value={formData.foodPreference}
                      onChange={handleChange}
                      className="w-full bg-brand-surface/50 border border-primary/20 focus:border-primary/60 rounded-xl px-5 py-4 text-gray-100 outline-none transition-all shadow-inner appearance-none cursor-pointer font-light"
                    >
                      <option value="Non-Vegetarian" className="bg-brand-surface text-gray-200">Non-Vegetarian</option>
                      <option value="Vegetarian" className="bg-brand-surface text-gray-200">Vegetarian</option>
                      <option value="Vegan" className="bg-brand-surface text-gray-200">Vegan</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  <div className="space-y-2 relative group">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold absolute -top-2 left-4 bg-brand-surface px-2 z-10 transition-colors group-focus-within:text-primary">Special Requirements / Notes (Optional)</label>
                    <textarea 
                      name="specialNotes"
                      value={formData.specialNotes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-brand-surface/50 border border-primary/20 focus:border-primary/60 rounded-xl px-5 py-4 text-gray-100 placeholder:text-gray-600 outline-none transition-all shadow-inner resize-none font-light"
                      placeholder="Any dietary restrictions, song requests, or lovely notes for the couple?"
                    ></textarea>
                  </div>

                  {status === "error" && (
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-center gap-3 backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {/* t("rsvp.error") */} Failed to send RSVP. Please try again.
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 bg-transparent text-primary font-bold border border-primary/40 hover:bg-primary/10 transition-all duration-300 uppercase tracking-[0.3em] disabled:opacity-50 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] flex justify-center items-center gap-3"
                  >
                    {status === "loading" ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Sending...
                      </>
                    ) : (
                      "Send RSVP"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

