/* eslint-disable */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
      // Append timestamp to prevent browser from caching the polling requests
      const res = await axios.get(`/api/content?t=${new Date().getTime()}`);
      setContent(res.data);
    } catch (err) {
      console.error("Failed to fetch content", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
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


