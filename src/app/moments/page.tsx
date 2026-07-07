"use client";

import GuestPhotos from "@/components/GuestPhotos";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function MomentsPage() {
  return (
    <main className="min-h-screen bg-dark-bg flex flex-col">
      <div className="absolute top-6 left-6 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors bg-dark-surface/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium uppercase tracking-wider">Back to Home</span>
        </Link>
      </div>
      
      <div className="flex-1">
        <GuestPhotos />
      </div>
      
      <Footer />
    </main>
  );
}
