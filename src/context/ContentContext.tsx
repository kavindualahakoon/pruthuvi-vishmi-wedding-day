/* eslint-disable */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

interface ContentData {
  [key: string]: any;
}

interface ContentContextType {
  content: ContentData | null;
  setContent: React.Dispatch<React.SetStateAction<ContentData | null>>;
  loading: boolean;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType>({
  content: null,
  setContent: () => {},
  loading: true,
  refreshContent: async () => {}
});

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const docRef = doc(db, "settings", "content");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent(docSnap.data());
      } else {
        // Initialize if not exists
        await setDoc(docRef, {});
        setContent({});
      }
    } catch (err) {
      console.error("Failed to fetch content", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "content"), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (content?.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = content.faviconUrl;
    }
  }, [content?.faviconUrl]);

  return (
    <ContentContext.Provider value={{ content, loading, refreshContent: fetchContent, setContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);


