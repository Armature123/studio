
"use client";

import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LegalChatbotWidget } from '@/components/lexiguide/legal-chatbot-widget';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" style={{"--animation-delay": "0ms"} as React.CSSProperties}>
      <head>
          <title>LexiGuide</title>
          <meta name="description" content="Your AI-powered legal document assistant." />
      </head>
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        {children}
        <LegalChatbotWidget />
        <Toaster />
      </body>
    </html>
  );
}
