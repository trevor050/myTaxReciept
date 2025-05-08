
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
        "fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out",
        "transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
      aria-hidden={!isVisible}
    >
      <Button
        variant="default"
        size="lg"
        onClick={onClick}
        className={cn(
          "shadow-2xl rounded-full text-xs sm:text-sm md:text-base px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3",
          // Apply gradient, hover will slightly change it
           isVisible // Only apply active colors if visible, otherwise it can cause hydration mismatch if isVisible starts false
            ? "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-primary-foreground animate-glow"
            : "bg-muted text-muted-foreground", // Default non-active state
          "flex items-center gap-1.5 sm:gap-2",
          "ring-2 ring-primary/30 ring-offset-2 ring-offset-background transition-transform hover:scale-105 active:scale-95"
        )}
        aria-label={`Email officials about ${count} item(s)`}
        tabIndex={isVisible ? 0 : -1}
      >
        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        Email Officials ({count})
      </Button>
    </div>
  );
}
