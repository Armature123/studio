
"use client";

import { Landmark } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-fade-out-splash">
      <div className="relative">
        <h1 className="text-5xl font-bold text-primary animate-bounce-in">
          LexiGuide
        </h1>
        <div className="absolute -right-10 -top-8 animate-logo-fade">
             <Landmark className="h-12 w-12 text-accent" />
        </div>
      </div>
    </div>
  );
}
