
"use client";

import { Progress } from "@/components/ui/progress";

interface FavorabilityBarProps {
  score: number;
}

export function FavorabilityBar({ score }: FavorabilityBarProps) {
  const getBarColor = (value: number) => {
    if (value < 33) return 'bg-red-500'; // Unfavorable
    if (value < 66) return 'bg-yellow-500'; // Neutral
    return 'bg-green-500'; // Favorable
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium text-muted-foreground">
        <span>Unfavorable</span>
        <span>Favorable</span>
      </div>
      <div className="relative">
        <Progress value={score} className="h-3" indicatorClassName={getBarColor(score)} />
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 bg-white rounded-full border-2 shadow-md"
          style={{ 
            left: `${score}%`,
            borderColor: getBarColor(score).replace('bg-', '') // A bit hacky but works for these colors
          }}
        >
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{color: getBarColor(score).replace('bg-', '')}}>
                {score}
            </div>
        </div>
      </div>
    </div>
  );
}
