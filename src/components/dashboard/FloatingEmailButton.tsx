
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingEmailButtonProps {
  isVisible: boolean;
  count: number;
  onClick: () => void;
}

export default function FloatingEmailButton({ isVisible, count, onClick }: FloatingEmailButtonProps) {
  // Use mount state to prevent hydration errors with conditional rendering/animation
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Don't render on the server or before hydration
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out", // Adjusted bottom margin for mobile
        "transform", // Ensure transform is enabled for transitions
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none" // Slide-up/fade-in animation
      )}
      aria-hidden={!isVisible} // Hide from assistive tech when not visible
    >
      <Button
        variant="default" // Use default variant for primary action
        size="lg"
        onClick={onClick}
        className={cn(
          "shadow-2xl rounded-full text-xs sm:text-sm md:text-base px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3", // Adjusted padding and font size for mobile
          // Gradient background (adjust colors as needed)
          "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700",
          // Dark mode gradient
          "dark:bg-gradient-to-r dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800",
          // Glow effect
          "animate-glow",
          // Ensure text is readable on gradient
          "text-primary-foreground", // Use primary-foreground for contrast
          // Icon and layout
          "flex items-center gap-1.5 sm:gap-2", // Adjusted gap for mobile
          // Add subtle ring and hover/active states
          "ring-2 ring-primary/30 ring-offset-2 ring-offset-background transition-transform hover:scale-105 active:scale-95"
        )}
        aria-label={`Email officials about ${count} item(s)`}
        tabIndex={isVisible ? 0 : -1} // Make focusable only when visible
      >
        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" /> {/* Adjusted icon size for mobile */}
        Email Officials ({count})
      </Button>
    </div>
  );
}

