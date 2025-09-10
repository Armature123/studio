
"use client";

import React, { useState } from 'react';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LegalChatbotWidget } from "@/components/lexiguide/legal-chatbot-widget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [documentDataUri, setDocumentDataUri] = useState<string | null>(null);
  
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { setDocumentDataUri });
    }
    return child;
  });

  return (
    <html lang="en" className="h-full">
      <head>
          <title>LexiGuide</title>
          <meta name="description" content="Your AI-powered legal document assistant." />
      </head>
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        {childrenWithProps}
        <Toaster />
        <LegalChatbotWidget documentDataUri={documentDataUri} />
      </body>
    </html>
  );
}
