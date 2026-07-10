/* eslint-disable */
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data || {});
      }
    } catch (err) {
      console.error("Failed to fetch content", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
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


