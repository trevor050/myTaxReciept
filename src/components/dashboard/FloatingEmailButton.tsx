'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send } from 'lucide-react';
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
      {/* Refined floating button */}
      <div className="relative group">
        {/* Subtle glow on hover only */}
        <div className="absolute -inset-1 bg-primary/30 rounded-full opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-300"></div>
        
        {/* Main button */}
        <Button
          variant="default"
          size="lg"
          onClick={onClick}
          className={cn(
            "relative shadow-lg rounded-xl text-sm sm:text-base font-semibold px-6 py-3 sm:px-8 sm:py-4",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "flex items-center gap-3 min-w-[180px] justify-between",
            "transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
            "focus:ring-2 focus:ring-primary/50 focus:outline-none border border-primary/20"
          )}
          aria-label={`Email officials about ${count} item(s)`}
          tabIndex={isVisible ? 0 : -1}
        >
          {/* Left side: Icon and text */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary-foreground/20">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm sm:text-base leading-tight">Email Officials</span>
              <span className="text-xs opacity-90 leading-tight">
                {count} selected
              </span>
            </div>
          </div>
          
          {/* Right side: Count badge */}
          <div className="bg-primary-foreground/20 text-primary-foreground rounded-lg h-8 w-8 flex items-center justify-center text-sm font-bold">
            {count}
          </div>
        </Button>
      </div>
    </div>
  );
}
