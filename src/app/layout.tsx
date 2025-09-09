import type {Metadata} from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LegalChatbotWidget } from '@/components/lexiguide/legal-chatbot-widget';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'LexiGuide',
  description: 'Your AI-powered legal document assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        {children}
        <LegalChatbotWidget />
        <Toaster />
      </body>
    </html>
  );
}
