"use client";

import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import WeddingCard from "@/components/WeddingCard";
import OurStory from "@/components/OurStory";
import PreShootVideo from "@/components/PreShootVideo";
import Events from "@/components/Events";
import Gallery from "@/components/Gallery";
import RSVPForm from "@/components/RSVPForm";
import Footer from "@/components/Footer";
import Envelope from "@/components/Envelope";
import Sparkles from "@/components/Sparkles";
import { useContent } from "@/context/ContentContext";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { content } = useContent();

  useEffect(() => {
    // Prevent scrolling while loading
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isLoading]);

  return (
    <>
      <Envelope onComplete={() => setIsLoading(false)} />
      <Sparkles isActive={!isLoading} />
      
      <main className={`flex min-h-[100dvh] w-full overflow-x-hidden flex-col items-center justify-between transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {content?.visibility?.hero !== false && <Hero />}
        {content?.visibility?.countdown !== false && <Countdown />}
        {content?.visibility?.weddingCard !== false && <WeddingCard />}
        {content?.visibility?.preShootVideo !== false && <PreShootVideo />}
        {content?.visibility?.ourStory !== false && <OurStory />}
        {content?.visibility?.events !== false && <Events />}
        {content?.visibility?.guestPhotos !== false && (
          <section className="py-12 bg-dark-bg text-center">
            <h2 className="text-3xl md:text-4xl font-playfair text-gradient-gold mb-6">Guest Photos</h2>
            <p className="text-gray-400 mb-6 font-light max-w-md mx-auto">Share your favorite moments from our special day or view the gallery!</p>
            <a href="/moments" className="inline-block px-8 py-3 bg-primary text-dark-bg font-bold tracking-widest uppercase text-sm rounded-lg hover:bg-gold-300 transition-colors">
              View & Upload Photos
            </a>
          </section>
        )}
        {content?.visibility?.gallery !== false && <Gallery />}
        {content?.visibility?.rsvpForm !== false && <RSVPForm />}
        <Footer />
      </main>
    </>
  );
}
