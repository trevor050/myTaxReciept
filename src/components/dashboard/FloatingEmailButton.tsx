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
      {/* Enhanced floating button with modern styling */}
      <div className="relative group">
        {/* Background glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-chart-1 to-primary rounded-full opacity-60 group-hover:opacity-80 blur-lg animate-pulse-glow"></div>
        
        {/* Main button */}
        <Button
          variant="default"
          size="lg"
          onClick={onClick}
          className={cn(
            "relative shadow-2xl rounded-full text-sm sm:text-base font-semibold px-6 py-3 sm:px-8 sm:py-4",
            "bg-gradient-to-r from-primary via-chart-1 to-primary text-primary-foreground",
            "hover:from-primary/90 hover:via-chart-1/90 hover:to-primary/90",
            "dark:from-purple-600 dark:via-purple-500 dark:to-purple-600", 
            "dark:hover:from-purple-700 dark:hover:via-purple-600 dark:hover:to-purple-700",
            "flex items-center gap-3 min-w-[200px] justify-center",
            "border-2 border-white/20 backdrop-blur-sm",
            "transition-all duration-300 transform hover:scale-105 active:scale-95",
            "animate-float",
            // Enhanced focus states
            "focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
          )}
          aria-label={`Email officials about ${count} item(s)`}
          tabIndex={isVisible ? 0 : -1}
        >
          {/* Icon with animation */}
          <div className="relative">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:scale-110" />
            {/* Animated send icon overlay */}
            <Send className="absolute inset-0 h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
          </div>
          
          {/* Text content */}
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm sm:text-base">Email Officials</span>
            <span className="text-xs sm:text-sm opacity-90 font-medium">
              {count} {count === 1 ? 'concern' : 'concerns'} selected
            </span>
          </div>
          
          {/* Count badge */}
          <div className="absolute -top-2 -right-2 bg-chart-3 text-white rounded-full h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-white/30 animate-bounce">
            {count}
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
          </div>
        </Button>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 bg-primary/60 rounded-full animate-float",
                i === 0 && "top-2 left-4 animation-delay-0",
                i === 1 && "top-6 right-6 animation-delay-200",
                i === 2 && "bottom-3 left-8 animation-delay-400"
              )}
              style={{
                animationDelay: `${i * 200}ms`,
                animationDuration: `${3 + i}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
