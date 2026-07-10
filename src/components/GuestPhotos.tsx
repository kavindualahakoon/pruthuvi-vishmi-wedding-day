"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, ZoomIn, Upload, Image as ImageIcon, Lock, Check, Trash2, Download } from "lucide-react";
import { useContent } from "@/context/ContentContext";
interface GuestPhoto {
  id: string;
  url: string;
  uploaderName: string;
  approved?: boolean;
  originalName?: string;
  createdAt?: string;
}

export default function GuestPhotos() {
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { content } = useContent();

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos", error);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [isAdmin]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Enforce images only
        if (!file.type.startsWith('image/')) {
          throw new Error("Only photos are allowed.");
        }

        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error("Failed to upload file");
        const { url: downloadUrl } = await uploadRes.json();
        
        await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: downloadUrl,
            originalName: file.name,
            uploaderName: uploaderName || 'Anonymous',
          })
        });
      });

      await Promise.all(uploadPromises);
      
      setUploadSuccess(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadSuccess(false), 5000);
      
      if (isAdmin) fetchPhotos();
    } catch (err: any) {
      console.error("Failed to upload photos", err);
      alert(`Failed to upload photos: ${err.message || err}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Royal2026") {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("Incorrect password");
    }
  };

  const handleApprovePhoto = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      });
      setPhotos(photos.map(p => p.id === id ? { ...p, approved: true } : p));
    } catch (err) {
      console.error("Failed to approve photo", err);
    }
  };

  const handleDeletePhoto = async (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        await fetch(`/api/photos/${id}`, { method: 'DELETE' });
        setPhotos(photos.filter(p => p.id !== id));
      } catch (err) {
        console.error("Failed to delete photo", err);
      }
    }
  };

  const handleDownloadPhoto = (url: string, originalName: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = url;
    link.download = originalName || "guest-photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (content?.visibility?.guestPhotos === false) {
    return null;
  }

  const visiblePhotos = photos.filter(p => isAdmin || p.approved);

  return (
    <section className="pt-20 pb-10 md:pt-32 md:pb-16 bg-dark-bg text-foreground relative overflow-hidden" id="guest-photos">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16 w-full px-4 sm:px-6"
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary mb-4 font-semibold break-words">Moments</h2>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-playfair text-gradient-gold mb-6 drop-shadow-md break-words">Guest Photos</h2>
          <div className="w-12 h-px bg-primary mx-auto mb-6 md:mb-8 opacity-50"></div>
          <p className="text-gray-400 font-light tracking-wide max-w-[280px] sm:max-w-md md:max-w-lg mx-auto text-sm md:text-base leading-relaxed break-words mb-8">
            Share your favorite moments from our special day! Upload your photos here.
          </p>

          <div className="max-w-md mx-auto glass-panel p-6 rounded-xl border border-primary/20 shadow-xl mb-16">
            <h3 className="text-xl font-playfair text-primary mb-4 flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" /> Upload a Photo
            </h3>
            
            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Name (Optional)" 
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full bg-dark-surface/50 border border-primary/20 rounded-lg p-3 text-sm text-light-bg focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                multiple
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleUpload} 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className="w-full px-6 py-3 bg-primary text-dark-bg hover:bg-gold-300 transition-all rounded-lg font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2"
              >
                {isUploading ? "Uploading..." : <><ImageIcon className="w-4 h-4" /> Choose Photos</>}
              </button>
              
              {uploadSuccess && (
                <p className="text-green-400 text-sm mt-2">Photos uploaded successfully! They will appear here once approved.</p>
              )}
            </div>
          </div>
        </motion.div>

        {visiblePhotos.length > 0 && (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {visiblePhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-xl group cursor-pointer break-inside-avoid shadow-lg border border-primary/10"
                onClick={() => setSelectedImage(photo.url)}
              >
                <img 
                  src={photo.url} 
                  alt="Guest Photo" 
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {isAdmin && !photo.approved && (
                  <div className="absolute top-2 left-2 bg-yellow-500/90 text-dark-bg text-xs font-bold px-2 py-1 rounded shadow-md z-10 pointer-events-none">
                    Pending
                  </div>
                )}
                
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 flex flex-col justify-end p-3 sm:p-4 z-10 ${isAdmin ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <p className="text-white text-xs sm:text-sm font-light mb-2">By {photo.uploaderName}</p>
                  
                  {isAdmin && (
                    <div className="flex flex-col gap-2 mt-1 w-full">
                      <div className="flex gap-2 w-full">
                        {!photo.approved && (
                          <button onClick={(e) => handleApprovePhoto(photo.id, e)} className="flex-1 py-2 sm:py-1.5 bg-green-500 text-white hover:bg-green-600 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Approve</span>
                          </button>
                        )}
                        <button onClick={(e) => handleDeletePhoto(photo.id, photo.url, e)} className="flex-1 py-2 sm:py-1.5 bg-red-500 text-white hover:bg-red-600 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                      <button onClick={(e) => handleDownloadPhoto(photo.url, photo.originalName, e)} className="w-full py-2 sm:py-1.5 bg-primary text-dark-bg hover:bg-gold-300 rounded text-xs font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-1 shadow-sm">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" /> Download
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 w-12 h-12 drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Login Toggle */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 mt-12 flex justify-end">
        {!isAdmin ? (
          <button 
            onClick={() => setShowLogin(!showLogin)} 
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-xs uppercase tracking-widest"
          >
            <Lock className="w-3 h-3" /> Bride/Groom Login
          </button>
        ) : (
          <button 
            onClick={() => setIsAdmin(false)} 
            className="flex items-center gap-2 text-primary hover:text-gold-300 transition-colors text-xs uppercase tracking-widest"
          >
            <Lock className="w-3 h-3" /> Logout
          </button>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && !isAdmin && (
        <div className="fixed inset-0 z-[200] bg-dark-bg/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-dark-surface p-8 rounded-2xl max-w-sm w-full border border-primary/30 text-center shadow-2xl relative">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-playfair text-primary mb-6">Manage Photos</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 text-light-bg focus:border-primary focus:outline-none transition-colors"
              />
              {loginError && <p className="text-red-400 text-xs text-left">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-primary text-dark-bg hover:bg-gold-300 transition-all duration-300 rounded-lg font-bold tracking-widest uppercase text-xs">
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[200] bg-dark-bg/95 flex items-center justify-center p-4 backdrop-blur-md">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 text-white hover:text-primary transition-colors p-2 z-10 bg-black/20 rounded-full"
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
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-primary/20"
          />
        </div>
      )}
    </section>
  );
}
