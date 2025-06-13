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
            "relative shadow-lg rounded-full text-sm sm:text-base font-semibold px-6 py-3 sm:px-8 sm:py-4",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "flex items-center gap-3 min-w-[200px] justify-center",
            "transition-all duration-200 transform hover:scale-105 active:scale-95",
            "focus:ring-2 focus:ring-primary/50 focus:outline-none"
          )}
          aria-label={`Email officials about ${count} item(s)`}
          tabIndex={isVisible ? 0 : -1}
        >
          {/* Icon with subtle animation */}
          <div className="relative">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 group-hover:scale-110" />
          </div>
          
          {/* Text content */}
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm sm:text-base">Email Officials</span>
            <span className="text-xs sm:text-sm opacity-90">
              {count} {count === 1 ? 'concern' : 'concerns'} selected
            </span>
          </div>
          
          {/* Count badge */}
          <div className="absolute -top-2 -right-2 bg-chart-3 text-white rounded-full h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center text-xs sm:text-sm font-bold">
            {count}
          </div>
        </Button>
      </div>
    </div>
  );
}
