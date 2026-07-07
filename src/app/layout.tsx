import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Royal Sri Lankan Wedding | Save the Date",
  description: "Join us in celebrating our Royal Sri Lankan Wedding. RSVP, Event Details, and more.",
  keywords: ["Wedding", "Sri Lankan Wedding", "Royal Wedding", "Invitation", "RSVP"],
};

import { Playfair_Display, Inter, Great_Vibes, Noto_Serif_Sinhala, Noto_Serif_Tamil } from "next/font/google";
import { ContentProvider } from "@/context/ContentContext";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script" });
const notoSinhala = Noto_Serif_Sinhala({ subsets: ["sinhala"], variable: "--font-sinhala" });
const notoTamil = Noto_Serif_Tamil({ subsets: ["tamil"], variable: "--font-tamil" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-dark-bg text-light-bg ${playfair.variable} ${inter.variable} ${greatVibes.variable} ${notoSinhala.variable} ${notoTamil.variable}`} style={{
        "--font-playfair": "var(--font-script)"
      } as React.CSSProperties}>
          <ContentProvider>
            {children}
          </ContentProvider>
      </body>
    </html>
  );
}
