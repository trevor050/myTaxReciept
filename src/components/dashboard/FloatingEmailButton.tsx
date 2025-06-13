'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingEmailButtonProps {
  isVisible: boolean;
  count: number;
  onClick: () => void;
}

export default function FloatingEmailButton({ isVisible, count, onClick }: FloatingEmailButtonProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out",
        "transform",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-16 scale-95 pointer-events-none"
      )}
      aria-hidden={!isVisible}
    >
      {/* Redesigned button to match site aesthetic: solid colors, clean, no gradients */}
      <Button
        variant="ghost" // Start with a basic structure, then layer styles
        size="lg"
        onClick={onClick}
        className={cn(
          "group relative h-auto shadow-xl rounded-2xl text-sm sm:text-base font-semibold px-4 py-3 sm:px-5",
          "bg-card border border-border text-foreground hover:bg-accent/50 hover:border-primary/60",
          "flex items-center gap-4 min-w-[240px] justify-between",
          "transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:outline-none"
        )}
        aria-label={`Email officials about ${count} item(s)`}
        tabIndex={isVisible ? 0 : -1}
      >
        {/* Left side: Icon and text */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex flex-col items-start">
            <span className="font-bold text-base leading-tight">Email Officials</span>
            <span className="text-xs text-muted-foreground leading-tight">
              {count} concern{count !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
        
        {/* Right side: Count badge and arrow */}
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold">
              {count}
          </div>
          <div className="p-1 rounded-full bg-accent -mr-1 group-hover:bg-primary/20 transition-colors duration-200">
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Button>
    </div>
  );
}
