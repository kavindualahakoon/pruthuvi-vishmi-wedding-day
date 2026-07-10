/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Lock, Users, FileText, Download, Utensils, CalendarDays, Search, Edit2, Trash2, X, Save, Video, Type, CheckSquare, ZoomIn, Clock, Volume2, Camera, Upload } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-backup";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  guestCount: number;
  foodPreference: string;
  specialNotes?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"guests" | "content" | "photos">("guests");
  const editingLang = "en";
  
  // Guest state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isSavingGuest, setIsSavingGuest] = useState(false);

  // Guest Photos state
  const [guestPhotos, setGuestPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Content state
  const { content, setContent, loading: loadingContent, refreshContent } = useContent();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingContent, setEditingContent] = useState<any>(null);
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const proxyUpload = async (file: File, pathPrefix: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!uploadRes.ok) throw new Error("Failed to upload file");
    const data = await uploadRes.json();
    return data.url;
  };
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingCardImage, setUploadingCardImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const cardImageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const defaultHero = { brideName: "", groomName: "", weddingDate: "", countdownTarget: "", bgUrl: "" };
    const defaultOurStory = {
      events: []
    };
    const defaultPreShoot = { title: "", description: "", videoUrl: "" };
    const defaultWeddingEvents: any[] = [];

    const defaultContent = {
      hero: { en: defaultHero, si: defaultHero, ta: defaultHero },
      ourStory: { en: defaultOurStory, si: defaultOurStory, ta: defaultOurStory },
      preShoot: { en: defaultPreShoot, si: defaultPreShoot, ta: defaultPreShoot },
      weddingEvents: { en: defaultWeddingEvents, si: defaultWeddingEvents, ta: defaultWeddingEvents },
      gallery: [],
      weddingCard: { imageUrl: "" },
      visibility: {}
    };

    if (content && !editingContent) {
      // Ensure all languages and structures exist even if the database is missing them
      const safeContent = JSON.parse(JSON.stringify(content));
      const langs = ["en", "si", "ta"];
      
      if (!safeContent.hero) safeContent.hero = {};
      if (!safeContent.ourStory) safeContent.ourStory = {};
      if (!safeContent.preShoot) safeContent.preShoot = {};
      if (!safeContent.weddingEvents) safeContent.weddingEvents = {};
      if (!safeContent.gallery) safeContent.gallery = [];
      if (!safeContent.weddingCard) safeContent.weddingCard = { imageUrl: "" };
      if (!safeContent.visibility) safeContent.visibility = {};

      langs.forEach(l => {
        if (!safeContent.hero[l]) safeContent.hero[l] = defaultHero;
        if (!safeContent.ourStory[l]) safeContent.ourStory[l] = defaultOurStory;
        if (!safeContent.preShoot[l]) safeContent.preShoot[l] = defaultPreShoot;
        if (!safeContent.weddingEvents[l]) safeContent.weddingEvents[l] = defaultWeddingEvents;
      });

      setEditingContent(safeContent);
    } else if (!loadingContent && !content && !editingContent) {
      // Fallback if API fails to load content
      setEditingContent(defaultContent);
    }
  }, [content, editingContent, loadingContent]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Game9805@.com") {
      setIsAuthenticated(true);
      setError("");
      fetchGuests();
      fetchGuestPhotos();
    } else {
      setError("Incorrect password");
    }
  };

  const fetchGuests = async () => {
    setLoadingGuests(true);
    try {
      const res = await fetch('/api/rsvps');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const rsvps = await res.json();
      if (Array.isArray(rsvps)) {
        setGuests(rsvps);
      } else {
        console.error("Fetched RSVPs is not an array:", rsvps);
        setGuests([]);
      }
    } catch (err) {
      console.error("Failed to fetch RSVPs", err);
      setGuests([]);
    } finally {
      setLoadingGuests(false);
    }
  };

  const fetchGuestPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const res = await fetch('/api/photos');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const fetchedPhotos = await res.json();
      if (Array.isArray(fetchedPhotos)) {
        setGuestPhotos(fetchedPhotos);
      } else {
        console.error("Fetched guest photos is not an array:", fetchedPhotos);
        setGuestPhotos([]);
      }
    } catch (err) {
      console.error("Failed to fetch guest photos", err);
      setGuestPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleApprovePhoto = async (id: string) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      });
      fetchGuestPhotos();
    } catch (err) {
      console.error("Error approving photo", err);
    }
  };

  const handleDeletePhoto = async (id: string, url: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      try {
        await fetch(`/api/photos/${id}`, { method: 'DELETE' });
        fetchGuestPhotos();
      } catch (err) {
        console.error("Error deleting photo", err);
      }
    }
  };

  const handleDownloadPhoto = (url: string, originalName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = originalName || "guest-photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGuestDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to completely remove ${name} from the guest list?`)) {
      try {
        await fetch(`/api/rsvps/${id}`, { method: 'DELETE' });
        setGuests(guests.filter(g => g.id !== id));
      } catch (err) {
        console.error("Failed to delete guest", err);
      }
    }
  };

  const handleGuestUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    setIsSavingGuest(true);
    try {
      await fetch(`/api/rsvps/${editingGuest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGuest)
      });
      setGuests(guests.map(g => g.id === editingGuest.id ? editingGuest : g));
      setEditingGuest(null);
    } catch (err) {
      console.error("Failed to update guest", err);
    } finally {
      setIsSavingGuest(false);
    }
  };

  const handleVisibilityToggle = async (key: keyof typeof editingContent.visibility, checked: boolean) => {
    if (!editingContent) return;
    
    const newEditingContent = {
      ...editingContent,
      visibility: {
        ...editingContent.visibility,
        [key]: checked
      }
    };
    
    setEditingContent(newEditingContent);
    setContent(newEditingContent); 

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEditingContent)
      });
    } catch (err) {
      console.error("Failed to save visibility toggle", err);
    }
  };

  const handleContentUpdate = async () => {
    setIsSavingContent(true);
    if (editingContent) {
      setContent(editingContent);
    }
    
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContent)
      });
      alert("Content saved successfully to database!");
    } catch (err) {
      console.warn("Backend save failed.", err);
      alert("Content saved locally for preview! (Database connection failed)");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const videoUrl = await proxyUpload(file, "content");

      const newPreShoot = { ...editingContent.preShoot };
      ["en", "si", "ta"].forEach(l => {
        if (newPreShoot[l]) {
          newPreShoot[l] = { ...newPreShoot[l], videoUrl };
        }
      });

      const newEditingContent = {
        ...editingContent,
        preShoot: newPreShoot
      };
      
      setEditingContent(newEditingContent);
      setContent(newEditingContent);
      
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEditingContent)
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }

      alert("Video uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await proxyUpload(file, "content");
      
      const newPhoto = {
        id: Date.now().toString(),
        src: imageUrl,
        alt: "Gallery Photo",
        height: ["h-64", "h-80", "h-96"][Math.floor(Math.random() * 3)],
        visible: true
      };

      const newGallery = [...(editingContent.gallery || []), newPhoto];
      const newEditingContent = {
        ...editingContent,
        gallery: newGallery
      };
      
      setEditingContent(newEditingContent);
      setContent(newEditingContent);
      
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEditingContent)
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
      
      alert("Image uploaded and added to gallery!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeroImage(true);
    try {
      const imageUrl = await proxyUpload(file, "content");
      
      const newHero = { ...editingContent.hero };
      ["en", "si", "ta"].forEach(l => {
        if (newHero[l]) {
          newHero[l] = { ...newHero[l], bgUrl: imageUrl };
        }
      });

      const newEditingContent = {
        ...editingContent,
        hero: newHero
      };
      
      setEditingContent(newEditingContent);
      setContent(newEditingContent);
      
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEditingContent)
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
      
      alert("Hero Background uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    try {
      const audioUrl = await proxyUpload(file, "content");
      
      const newHero = { ...editingContent.hero };
      ["en", "si", "ta"].forEach(l => {
        if (newHero[l]) {
          newHero[l] = { ...newHero[l], audioUrl };
        }
      });

      const newEditingContent = {
        ...editingContent,
        hero: newHero
      };
      
      setEditingContent(newEditingContent);
      setContent(newEditingContent);
      
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEditingContent)
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
      
      alert("Background Audio uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload audio");
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCardImage(true);
    try {
      const imageUrl = await proxyUpload(file, "content");
      
      const newEditingContent = {
        ...editingContent,
        weddingCard: { imageUrl }
      };
      
      setEditingContent(newEditingContent);
      setContent(newEditingContent);
      
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEditingContent)
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
      
      alert("Wedding Card uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image");
    } finally {
      setUploadingCardImage(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const imageUrl = await proxyUpload(file, "content");
      
      const newEditingContent = {
        ...editingContent,
        faviconUrl: imageUrl
      };
      
      setEditingContent(newEditingContent);
      setContent(newEditingContent);
      
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEditingContent)
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
      
      alert("Favicon uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload favicon");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const exportToCSV = () => {
    if (guests.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Guest Count", "Food Preference", "Special Notes", "Date Submitted"];
    const rows = guests.map(g => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.email}"`,
      `"${g.phone}"`,
      g.guestCount,
      `"${g.foodPreference}"`,
      `"${(g.specialNotes || "").replace(/"/g, '""')}"`,
      `"${new Date(g.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "wedding_rsvps.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackup = async () => {
    if (!window.confirm("Are you sure you want to backup the database to Firebase? This will overwrite the backup collections.")) return;
    
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert("Backup to Firebase completed successfully!");
      } else {
        alert("Backup failed: " + data.error);
      }
    } catch (err) {
      console.error("Backup failed", err);
      alert("Failed to run backup.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-primary/30 text-center shadow-2xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-playfair text-primary mb-2">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input 
              type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-surface border border-primary/30 rounded-lg p-3 text-light-bg focus:border-primary focus:outline-none transition-colors"
            />
            {error && <p className="text-red-400 text-sm text-left">{error}</p>}
            <button type="submit" className="w-full py-3 border border-primary text-primary bg-transparent hover:bg-dark-surface hover:text-primary transition-all duration-300 rounded-lg font-semibold tracking-widest uppercase text-sm">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderGuestList = () => {
    const totalGuests = guests.reduce((sum, g) => sum + g.guestCount, 0);
    const totalRSVPs = guests.length;
    const vegetarians = guests.reduce((sum, g) => sum + (g.foodPreference?.toLowerCase() === 'vegetarian' ? g.guestCount : 0), 0);
    const filteredGuests = guests.filter(g => (g.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (g.email || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-playfair text-gradient-gold mb-2">Guest List</h1>
            <p className="text-gray-400 font-light">Manage your RSVPs</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleBackup} className="flex items-center justify-center gap-2 px-6 py-3 border border-green-500 text-green-500 bg-transparent hover:bg-dark-surface transition-all duration-300 rounded-lg font-semibold tracking-widest uppercase text-xs">
              <Upload className="w-4 h-4" /> Firebase Backup
            </button>
            <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary bg-transparent hover:bg-dark-surface transition-all duration-300 rounded-lg font-semibold tracking-widest uppercase text-xs">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-primary/20 flex items-center gap-4 shadow-lg">
            <div className="p-4 bg-primary/10 rounded-lg text-primary"><FileText className="w-8 h-8" /></div>
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Total RSVPs</p>
              <p className="text-3xl font-playfair text-white">{totalRSVPs}</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-primary/20 flex items-center gap-4 shadow-lg">
            <div className="p-4 bg-primary/10 rounded-lg text-primary"><Users className="w-8 h-8" /></div>
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Total Guests</p>
              <p className="text-3xl font-playfair text-white">{totalGuests}</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-primary/20 flex items-center gap-4 shadow-lg">
            <div className="p-4 bg-primary/10 rounded-lg text-primary"><Utensils className="w-8 h-8" /></div>
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Vegetarians</p>
              <p className="text-3xl font-playfair text-white">{vegetarians}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-primary/20 overflow-hidden flex flex-col shadow-xl">
          <div className="p-6 border-b border-primary/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search guests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-dark-surface/50 border border-primary/20 rounded-lg pl-9 pr-4 py-2 text-sm text-light-bg focus:border-primary focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-surface/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium text-center">Count</th>
                  <th className="p-4 font-medium">Food</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {loadingGuests ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading guests...</td></tr>
                ) : filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 font-medium text-white">{guest.name}</td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300">{guest.email}</div>
                        <div className="text-xs text-gray-500">{guest.phone}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">{guest.guestCount}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-300 capitalize">{guest.foodPreference}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingGuest({...guest})} className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleGuestDelete(guest.id, guest.name)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderGuestPhotos = () => {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-playfair text-gradient-gold mb-2">Guest Photos</h1>
            <p className="text-gray-400 font-light">Approve and manage uploaded photos</p>
          </div>
        </div>

        {loadingPhotos ? (
          <div className="text-center p-12 text-primary">Loading Photos...</div>
        ) : guestPhotos.length === 0 ? (
          <div className="text-center p-12 text-gray-400 glass-panel rounded-xl border border-primary/20">No photos uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {guestPhotos.map((photo) => (
              <div key={photo.id} className="glass-panel rounded-xl border border-primary/20 overflow-hidden flex flex-col shadow-xl">
                <div className="aspect-square relative bg-dark-bg">
                  <img src={photo.url} alt="Guest Upload" className="w-full h-full object-cover" />
                  {!photo.approved && (
                    <div className="absolute top-2 left-2 bg-yellow-500/90 text-dark-bg text-xs font-bold px-2 py-1 rounded shadow-md">
                      Pending
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                  <div className="text-sm text-gray-300 truncate font-medium">By: {photo.uploaderName || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500">{new Date(photo.createdAt).toLocaleString()}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {!photo.approved && (
                      <button onClick={() => handleApprovePhoto(photo.id)} className="flex-1 py-2 bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleDeletePhoto(photo.id, photo.url)} className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                      Delete
                    </button>
                    <button onClick={() => handleDownloadPhoto(photo.url, photo.originalName)} className="w-full py-2 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 rounded text-xs font-bold uppercase tracking-wider transition-colors flex justify-center items-center gap-1">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContentEditor = () => {
    if (loadingContent || !editingContent) {
      return <div className="text-center p-12 text-primary">Loading Content...</div>;
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="flex gap-2 bg-dark-surface p-1 rounded-lg border border-primary/20 invisible">
            {/* Language tabs removed */}
          </div>
          <div>
            <h1 className="text-4xl font-playfair text-gradient-gold mb-2">Website Content</h1>
            <p className="text-gray-400 font-light">Edit text, dates, and media on your live site.</p>
          </div>
          <button onClick={handleContentUpdate} disabled={isSavingContent} className="flex items-center gap-2 px-6 py-3 bg-primary text-dark-bg hover:bg-gold-300 transition-all rounded-lg font-bold tracking-widest uppercase text-xs">
            <Save className="w-4 h-4" /> {isSavingContent ? "Saving..." : "Save Changes"}
          </button>
        </div>



        {/* Global Settings */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><ZoomIn className="w-5 h-5"/> Global Settings</h2>
          </div>
          <div className="pt-2">
            <label className="block text-xs uppercase text-gray-400 mb-1">Website Favicon</label>
            <input type="file" accept="image/x-icon,image/png,image/jpeg" ref={faviconInputRef} className="hidden" onChange={handleFaviconUpload} />
            <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
              <button onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon} className="px-6 py-3 border border-primary border-dashed text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg w-full md:w-auto flex items-center justify-center gap-2 h-fit">
                <ZoomIn className="w-4 h-4" /> {uploadingFavicon ? "Uploading..." : "Upload New Favicon"}
              </button>
              {editingContent.faviconUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-primary/30 bg-dark-surface flex-shrink-0 flex items-center justify-center p-2">
                  <img
                    src={editingContent.faviconUrl}
                    alt="Favicon Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Upload a small square image (e.g. 32x32) to use as the site's tab icon.</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><Type className="w-5 h-5"/> Hero Section</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.hero !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('hero', editingContent.visibility.hero === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.hero !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.hero !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Bride Name</label>
              <input type="text" value={editingContent.hero[editingLang].brideName} onChange={(e) => setEditingContent({...editingContent, hero: {...editingContent.hero, [editingLang]: {...editingContent.hero[editingLang], brideName: e.target.value}}})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Groom Name</label>
              <input type="text" value={editingContent.hero[editingLang].groomName} onChange={(e) => setEditingContent({...editingContent, hero: {...editingContent.hero, [editingLang]: {...editingContent.hero[editingLang], groomName: e.target.value}}})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Wedding Date Text</label>
              <input type="text" value={editingContent.hero[editingLang].weddingDate} onChange={(e) => setEditingContent({...editingContent, hero: {...editingContent.hero, [editingLang]: {...editingContent.hero[editingLang], weddingDate: e.target.value}}})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="pt-4 border-t border-primary/20">
            <label className="block text-xs uppercase text-gray-400 mb-1">Hero Background Image</label>
            <input type="file" accept="image/*" ref={heroImageInputRef} className="hidden" onChange={handleHeroImageUpload} />
            <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
              <button onClick={() => heroImageInputRef.current?.click()} disabled={uploadingHeroImage} className="px-6 py-3 border border-primary border-dashed text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg w-full md:w-auto flex items-center justify-center gap-2 h-fit">
                <ZoomIn className="w-4 h-4" /> {uploadingHeroImage ? "Uploading..." : "Upload New Background"}
              </button>
              {editingContent.hero[editingLang].bgUrl && (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-primary/30 bg-dark-surface flex-shrink-0">
                  <img
                    src={editingContent.hero[editingLang].bgUrl}
                    alt="Hero Background Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-primary/20">
            <label className="block text-xs uppercase text-gray-400 mb-1">Hero Background Music</label>
            <input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={handleAudioUpload} />
            <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
              <button onClick={() => audioInputRef.current?.click()} disabled={uploadingAudio} className="px-6 py-3 border border-primary border-dashed text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg w-full md:w-auto flex items-center justify-center gap-2 h-fit">
                <Volume2 className="w-4 h-4" /> {uploadingAudio ? "Uploading..." : "Upload Background Music"}
              </button>
              {editingContent.hero[editingLang].audioUrl && (
                <div className="flex items-center gap-3 bg-dark-surface p-3 rounded-lg border border-primary/30 text-sm text-gray-300">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span>Custom Music Uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Countdown Section */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><Clock className="w-5 h-5"/> Countdown Section</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.countdown !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('countdown', editingContent.visibility.countdown === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.countdown !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.countdown !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="pt-2">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Countdown Target (Date & Time)</label>
              <div className="flex gap-4">
                <input 
                  type="datetime-local" 
                  value={editingContent.hero[editingLang].countdownTarget ? editingContent.hero[editingLang].countdownTarget.slice(0, 16) : ''} 
                  onChange={(e) => {
                    const newHero = { ...editingContent.hero };
                    ["en", "si", "ta"].forEach(l => {
                      if (newHero[l]) {
                        newHero[l] = { ...newHero[l], countdownTarget: e.target.value };
                      }
                    });
                    setEditingContent({...editingContent, hero: newHero});
                  }} 
                  className="flex-1 bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none [color-scheme:dark]" 
                />
                <button 
                  onClick={async () => {
                    setContent(editingContent);
                    try {
                      await setDoc(doc(db, "settings", "content"), editingContent);
                      alert("Countdown target saved successfully!");
                    } catch (err) {
                      console.error("Save failed", err);
                      alert("Failed to save countdown target");
                    }
                  }}
                  className="px-6 py-3 bg-primary text-dark-bg font-semibold rounded-lg hover:bg-gold-400 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Date
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">The countdown will be visible immediately after saving the date.</p>
            </div>
          </div>
        </div>

        {/* Wedding Card */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><ZoomIn className="w-5 h-5"/> Wedding Card</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.weddingCard !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('weddingCard', editingContent.visibility.weddingCard === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.weddingCard !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.weddingCard !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Upload Wedding Card (Portrait Image)</label>
              <input type="file" accept="image/*" ref={cardImageInputRef} className="hidden" onChange={handleCardImageUpload} />
              <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
                <button onClick={() => cardImageInputRef.current?.click()} disabled={uploadingCardImage} className="px-6 py-3 border border-primary border-dashed text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg w-full md:w-auto flex items-center justify-center gap-2 h-fit">
                  <ZoomIn className="w-4 h-4" /> {uploadingCardImage ? "Uploading..." : "Upload Card Image"}
                </button>
                {editingContent.weddingCard?.imageUrl && (
                  <div className="relative w-32 aspect-[3/4] rounded-lg overflow-hidden border border-primary/30 bg-dark-surface flex-shrink-0">
                    <img
                      src={editingContent.weddingCard.imageUrl}
                      alt="Wedding Card Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Shoot Video */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><Video className="w-5 h-5"/> Pre-Shoot Video</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.preShootVideo !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('preShootVideo', editingContent.visibility.preShootVideo === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.preShootVideo !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.preShootVideo !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Upload New Video (Portrait 9:16)</label>
              <input type="file" accept="video/mp4,video/webm" ref={fileInputRef} className="hidden" onChange={handleVideoUpload} />
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingVideo} className="px-6 py-3 border border-primary border-dashed text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-lg w-full md:w-auto flex items-center justify-center gap-2 h-fit">
                  <Video className="w-4 h-4" /> {uploadingVideo ? "Uploading..." : "Select Video File"}
                </button>
                {editingContent.preShoot[editingLang].videoUrl && (
                  <div className="relative w-32 aspect-[9/16] rounded-lg overflow-hidden border border-primary/30 bg-dark-surface flex-shrink-0">
                    <video
                      key={editingContent.preShoot[editingLang].videoUrl}
                      src={editingContent.preShoot[editingLang].videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Section Title</label>
                <input type="text" value={editingContent.preShoot[editingLang].title} onChange={(e) => setEditingContent({...editingContent, preShoot: {...editingContent.preShoot, [editingLang]: {...editingContent.preShoot[editingLang], title: e.target.value}}})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Description</label>
                <textarea rows={3} value={editingContent.preShoot[editingLang].description} onChange={(e) => setEditingContent({...editingContent, preShoot: {...editingContent.preShoot, [editingLang]: {...editingContent.preShoot[editingLang], description: e.target.value}}})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary">Our Story Timeline</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.ourStory !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('ourStory', editingContent.visibility.ourStory === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.ourStory !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.ourStory !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="space-y-6 pt-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {editingContent.ourStory[editingLang]?.events?.map((event: any, index: number) => (
              <div key={event.id} className="p-4 border border-primary/10 rounded-lg bg-dark-bg/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Title</label>
                    <input type="text" value={event.title} onChange={(e) => {
                      const newEvents = [...editingContent.ourStory[editingLang].events];
                      newEvents[index].title = e.target.value;
                      setEditingContent({...editingContent, ourStory: { ...editingContent.ourStory, [editingLang]: { events: newEvents } }});
                    }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Year/Date</label>
                    <input type="text" value={event.year} onChange={(e) => {
                      const newEvents = [...editingContent.ourStory[editingLang].events];
                      newEvents[index].year = e.target.value;
                      setEditingContent({...editingContent, ourStory: { ...editingContent.ourStory, [editingLang]: { events: newEvents } }});
                    }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Description</label>
                  <textarea rows={3} value={event.description} onChange={(e) => {
                    const newEvents = [...editingContent.ourStory[editingLang].events];
                    newEvents[index].description = e.target.value;
                    setEditingContent({...editingContent, ourStory: { ...editingContent.ourStory, [editingLang]: { events: newEvents } }});
                  }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none resize-none" />
                </div>
                <button type="button" onClick={() => {
                  const newEvents = [...editingContent.ourStory[editingLang].events];
                  newEvents.splice(index, 1);
                  setEditingContent({...editingContent, ourStory: { ...editingContent.ourStory, [editingLang]: { events: newEvents } }});
                }} className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-semibold flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove Story Event
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const newEvents = [...(editingContent.ourStory[editingLang]?.events || [])];
              newEvents.push({ id: Date.now().toString(), title: '', year: '', description: '' });
              setEditingContent({...editingContent, ourStory: { ...editingContent.ourStory, [editingLang]: { events: newEvents } }});
            }} className="w-full py-3 border border-primary/30 border-dashed rounded-lg text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
              + Add Story Event
            </button>
          </div>
        </div>

        {/* Wedding Events */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><CalendarDays className="w-5 h-5"/> Wedding Events</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.events !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('events', editingContent.visibility.events === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.events !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.events !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="space-y-6 pt-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {editingContent.weddingEvents[editingLang]?.map((event: any, index: number) => (
              <div key={event.id} className="p-4 border border-primary/10 rounded-lg bg-dark-bg/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Event Title</label>
                    <input type="text" value={event.title} onChange={(e) => {
                      const newEvents = [...editingContent.weddingEvents[editingLang]];
                      newEvents[index].title = e.target.value;
                      setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                    }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Date</label>
                    <input type="text" value={event.date} onChange={(e) => {
                      const newEvents = [...editingContent.weddingEvents[editingLang]];
                      newEvents[index].date = e.target.value;
                      setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                    }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Time</label>
                    <input type="text" value={event.time} onChange={(e) => {
                      const newEvents = [...editingContent.weddingEvents[editingLang]];
                      newEvents[index].time = e.target.value;
                      setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                    }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Location</label>
                    <input type="text" value={event.location} onChange={(e) => {
                      const newEvents = [...editingContent.weddingEvents[editingLang]];
                      newEvents[index].location = e.target.value;
                      setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                    }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs uppercase text-gray-400 mb-1">Google Maps URL</label>
                  <input type="text" value={event.mapUrl || ''} onChange={(e) => {
                    const newEvents = [...editingContent.weddingEvents[editingLang]];
                    newEvents[index].mapUrl = e.target.value;
                    setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                  }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                </div>
                <div className="mt-4">
                  <label className="block text-xs uppercase text-gray-400 mb-1">Description</label>
                  <textarea rows={2} value={event.description} onChange={(e) => {
                    const newEvents = [...editingContent.weddingEvents[editingLang]];
                    newEvents[index].description = e.target.value;
                    setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                  }} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none resize-none" />
                </div>
                
                {/* Timeline Editor */}
                <div className="mt-6 border-t border-primary/20 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs uppercase text-gray-400">Event Timeline</label>
                    <button type="button" onClick={() => {
                      const newEvents = [...editingContent.weddingEvents[editingLang]];
                      if (!newEvents[index].timeline) newEvents[index].timeline = [];
                      newEvents[index].timeline.push({ time: '', label: '' });
                      setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                    }} className="text-xs text-primary hover:text-primary/70 uppercase tracking-widest font-semibold flex items-center gap-1">
                      + Add Step
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {event.timeline?.map((step: any, stepIndex: number) => (
                      <div key={stepIndex} className="flex gap-2 items-start">
                        <div className="w-1/3">
                          <input type="text" placeholder="Time (e.g. 07:30 PM)" value={step.time} onChange={(e) => {
                            const newEvents = [...editingContent.weddingEvents[editingLang]];
                            newEvents[index].timeline[stepIndex].time = e.target.value;
                            setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                          }} className="w-full bg-dark-bg/50 border border-primary/20 rounded-lg p-2 text-sm focus:border-primary focus:outline-none" />
                        </div>
                        <div className="w-full relative">
                          <input type="text" placeholder="Label (e.g. Welcome & Drinks)" value={step.label} onChange={(e) => {
                            const newEvents = [...editingContent.weddingEvents[editingLang]];
                            newEvents[index].timeline[stepIndex].label = e.target.value;
                            setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                          }} className="w-full bg-dark-bg/50 border border-primary/20 rounded-lg p-2 text-sm focus:border-primary focus:outline-none pr-8" />
                          <button type="button" onClick={() => {
                            const newEvents = [...editingContent.weddingEvents[editingLang]];
                            newEvents[index].timeline.splice(stepIndex, 1);
                            setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                          }} className="absolute right-2 top-2.5 text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!event.timeline || event.timeline.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No timeline steps added yet.</p>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => {
                  const newEvents = [...editingContent.weddingEvents[editingLang]];
                  newEvents.splice(index, 1);
                  setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
                }} className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-semibold flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Remove Wedding Event
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const newEvents = [...(editingContent.weddingEvents[editingLang] || [])];
              newEvents.push({ id: Date.now().toString(), title: '', time: '', location: '', description: '', mapUrl: '', timeline: [] });
              setEditingContent({...editingContent, weddingEvents: { ...editingContent.weddingEvents, [editingLang]: newEvents }});
            }} className="w-full py-3 border border-primary/30 border-dashed rounded-lg text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
              + Add Wedding Event
            </button>
          </div>
        </div>

        {/* Capturing Moments (Gallery) */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-primary/20 pb-4">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><ZoomIn className="w-5 h-5"/> Capturing Moments (Gallery)</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.gallery !== false ? 'Section Visible' : 'Section Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('gallery', editingContent.visibility.gallery === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.gallery !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.gallery !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex flex-col md:flex-row items-center gap-4 border border-primary/20 border-dashed rounded-lg p-6 bg-dark-bg/30 justify-center">
              <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={handleImageUpload} />
              <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="px-6 py-3 bg-primary text-dark-bg hover:bg-gold-300 transition-colors rounded-lg flex items-center gap-2 font-bold uppercase text-xs tracking-wider shadow-lg">
                <ZoomIn className="w-4 h-4" /> {uploadingImage ? "Uploading..." : "Browse Photos"}
              </button>
              <p className="text-xs text-gray-400 text-center">Upload high-quality images for your masonry gallery.</p>
            </div>

            {editingContent.gallery && editingContent.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {editingContent.gallery.map((photo: any, index: number) => (
                  <div key={photo.id || index} className={`relative rounded-lg overflow-hidden border ${photo.visible !== false ? 'border-primary/50 opacity-100' : 'border-gray-600 opacity-50 grayscale'} group transition-all`}>
                    <img src={photo.src} alt={photo.alt} className="w-full h-32 object-cover" />
                    
                    {/* Controls Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <button 
                        onClick={() => {
                          const newGallery = [...editingContent.gallery];
                          newGallery[index].visible = photo.visible === false ? true : false;
                          setEditingContent({ ...editingContent, gallery: newGallery });
                        }}
                        className={`text-xs px-3 py-1 rounded-full ${photo.visible !== false ? 'bg-gray-600 text-white' : 'bg-primary text-dark-bg font-bold'}`}
                      >
                        {photo.visible !== false ? 'Hide Image' : 'Show Image'}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Delete this photo permanently?")) {
                            const newGallery = editingContent.gallery.filter((_: any, i: number) => i !== index);
                            setEditingContent({ ...editingContent, gallery: newGallery });
                          }
                        }}
                        className="text-xs px-3 py-1 rounded-full bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 text-sm">No photos uploaded to the gallery yet.</div>
            )}
          </div>
        </div>

        {/* RSVP Form */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><CheckSquare className="w-5 h-5"/> RSVP Form</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.rsvpForm !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('rsvpForm', editingContent.visibility.rsvpForm === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.rsvpForm !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.rsvpForm !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400">Toggle whether guests can see the RSVP form on the live site.</p>
        </div>

        {/* Guest Photos */}
        <div className="glass-panel p-6 rounded-xl border border-primary/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-playfair text-primary flex items-center gap-2"><Camera className="w-5 h-5"/> Guest Photos</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{editingContent.visibility.guestPhotos !== false ? 'Visible' : 'Hidden'}</span>
              <button
                type="button"
                onClick={() => handleVisibilityToggle('guestPhotos', editingContent.visibility.guestPhotos === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingContent.visibility.guestPhotos !== false ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editingContent.visibility.guestPhotos !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400">Toggle whether guests can see the Guest Photos section on the live site.</p>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4 pb-8">
          <button onClick={handleContentUpdate} disabled={isSavingContent} className="flex items-center gap-2 px-8 py-4 bg-primary text-dark-bg hover:bg-gold-300 transition-all rounded-lg font-bold tracking-widest uppercase text-sm shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]">
            <Save className="w-5 h-5" /> {isSavingContent ? "Saving..." : "Save All Changes"}
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg text-light-bg flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-dark-surface border-b md:border-r md:border-b-0 border-primary/20 p-6 flex flex-col gap-4">
        <h2 className="text-xl font-playfair text-primary mb-4 text-center md:text-left">Admin Panel</h2>
        <button 
          onClick={() => setActiveTab("guests")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "guests" ? "bg-primary text-dark-bg font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          <Users className="w-5 h-5" /> Guest List
        </button>
        <button 
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "content" ? "bg-primary text-dark-bg font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          <Edit2 className="w-5 h-5" /> Content Editor
        </button>
        <button 
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "photos" ? "bg-primary text-dark-bg font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          <Camera className="w-5 h-5" /> Guest Photos
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {activeTab === "guests" ? renderGuestList() : activeTab === "photos" ? renderGuestPhotos() : renderContentEditor()}
      </div>

      {/* Guest Edit Modal Overlay */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-surface border border-primary/30 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-primary/20">
              <h3 className="text-2xl font-playfair text-primary">Edit Guest</h3>
              <button onClick={() => setEditingGuest(null)} className="text-gray-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleGuestUpdate} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Full Name</label>
                <input type="text" required value={editingGuest.name} onChange={(e) => setEditingGuest({...editingGuest, name: e.target.value})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Guest Count</label>
                  <input type="number" min="1" max="10" required value={editingGuest.guestCount} onChange={(e) => setEditingGuest({...editingGuest, guestCount: parseInt(e.target.value) || 1})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-1">Food</label>
                  <select value={editingGuest.foodPreference} onChange={(e) => setEditingGuest({...editingGuest, foodPreference: e.target.value})} className="w-full bg-dark-bg border border-primary/30 rounded-lg p-3 focus:border-primary focus:outline-none">
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-primary/20">
                <button type="button" onClick={() => setEditingGuest(null)} className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={isSavingGuest} className="flex items-center gap-2 px-6 py-2 bg-primary text-dark-bg font-bold rounded-lg hover:bg-gold-300 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" /> {isSavingGuest ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


