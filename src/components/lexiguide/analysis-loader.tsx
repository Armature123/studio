
"use client";

import { useState, useEffect } from 'react';
import { Bot, FileScan, ShieldAlert, CheckSquare, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const analysisSteps = [
  { text: 'Preparing secure analysis environment...', icon: Bot },
  { text: 'Parsing document content...', icon: FileScan },
  { text: 'Scanning for risks and red flags...', icon: ShieldAlert },
  { text: 'Extracting key obligations and action items...', icon: CheckSquare },
  { text: 'Generating actionable summary...', icon: BrainCircuit },
];

export function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 15000; // Simulate a 15-second analysis
    const stepDuration = totalDuration / analysisSteps.length;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, stepDuration);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { // Stop just before 100 to feel more realistic
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 1;
      });
    }, totalDuration / 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto">
        <div className="relative mb-6">
            <BrainCircuit className="h-16 w-16 text-primary animate-pulse"/>
        </div>
      <h2 className="text-2xl font-semibold text-center text-foreground mb-4">
        Analyzing Your Document
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Our AI is reading your document, identifying key details, and preparing your report. This may take a moment.
      </p>

      <div className="w-full space-y-4 mb-8">
        {analysisSteps.map((step, index) => {
          const isActive = index <= currentStep;
          const Icon = step.icon;
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-4 transition-all duration-500',
                isActive ? 'opacity-100' : 'opacity-40'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
      
      <Progress value={progress} className="w-full h-2" />

    </div>
  );
}
