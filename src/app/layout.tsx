
"use client";

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LegalChatbotWidget } from '@/components/lexiguide/legal-chatbot-widget';
import { SplashScreen } from '@/components/lexiguide/splash-screen';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Animation duration

    return () => clearTimeout(timer);
  }, []);


  return (
    <html lang="en" className="h-full" style={{"--animation-delay": "0ms"} as React.CSSProperties}>
      <head>
          <title>LexiGuide</title>
          <meta name="description" content="Your AI-powered legal document assistant." />
      </head>
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        {isLoading && <SplashScreen />}
        <div className={isLoading ? 'hidden' : ''}>
          {children}
          <LegalChatbotWidget />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
