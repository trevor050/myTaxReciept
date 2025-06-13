'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingEmailButtonProps {
  isVisible: boolean;
  count: number;
  onClick: () => void;
}

export default function FloatingEmailButton({ isVisible, count, onClick }: FloatingEmailButtonProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-out",
        "transform",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-16 scale-95 pointer-events-none"
      )}
    >
      {/* Epic floating button with personality */}
      <div className="relative group">
        {/* Animated glow ring */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300 animate-pulse"></div>
        
        {/* Main button container */}
        <Button
          variant="default"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "relative group overflow-hidden rounded-2xl text-white font-bold",
            "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700",
            "hover:from-blue-700 hover:via-purple-700 hover:to-blue-800",
            "shadow-2xl border-2 border-white/20",
            "transition-all duration-300 ease-out",
            "transform hover:scale-105 active:scale-95",
            "focus:ring-4 focus:ring-purple-500/50 focus:outline-none",
            // Mobile responsive
            "h-14 px-4 sm:h-16 sm:px-6",
            "min-w-[200px] sm:min-w-[240px]"
          )}
          aria-label={`Take action on ${count} selected budget items`}
          tabIndex={isVisible ? 0 : -1}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Main content */}
          <div className="relative flex items-center justify-between w-full">
            {/* Left side: Icon + text */}
            <div className="flex items-center gap-3">
              {/* Icon with animation */}
              <div className="relative">
                <div className={cn(
                  "p-2 rounded-xl bg-white/20 backdrop-blur-sm transition-all duration-300",
                  isHovered && "bg-white/30 scale-110"
                )}>
                  <Mail className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300",
                    isHovered && "rotate-12"
                  )} />
                </div>
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-bounce"></div>
              </div>
              
              {/* Text content */}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-bold leading-tight">Contact Officials</span>
                  <ArrowRight className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isHovered && "translate-x-1"
                  )} />
                </div>
                <div className="flex items-center gap-1 text-xs opacity-90">
                  <Users className="h-3 w-3" />
                  <span>{count} issue{count !== 1 ? 's' : ''} selected</span>
                </div>
              </div>
            </div>
            
            {/* Right side: Count badge */}
            <div className={cn(
              "flex items-center justify-center rounded-xl font-bold transition-all duration-300",
              "bg-white/20 backdrop-blur-sm border border-white/30",
              "h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base",
              isHovered && "bg-white/30 scale-110"
            )}>
              {count}
            </div>
          </div>
          
          {/* Animated shine effect */}
          <div className={cn(
            "absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "transition-transform duration-1000 ease-out",
            isHovered ? "translate-x-full" : "-translate-x-full"
          )}></div>
        </Button>
        
        {/* Call to action text */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-xs text-center font-medium text-muted-foreground animate-pulse">
            Make your voice heard 📢
          </p>
        </div>
      </div>
    </div>
  );
}
