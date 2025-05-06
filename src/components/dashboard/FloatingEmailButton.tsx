
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingEmailButtonProps {
  selectedCount: number;
  onClick: () => void;
  show: boolean;
}

export default function FloatingEmailButton({ selectedCount, onClick, show }: FloatingEmailButtonProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-6 flex justify-center z-50 transition-all duration-300 ease-out pointer-events-none", // Ensure parent div allows click-through when hidden
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10" // Slide up/down animation
      )}
      // Prevent interaction when hidden
      style={{ pointerEvents: show ? 'auto' : 'none' }}
    >
      <Button
        size="lg"
        className="shadow-2xl rounded-full px-6 py-3 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 dark:bg-gradient-to-r dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-primary-foreground flex items-center gap-2 ring-2 ring-primary/30 ring-offset-2 ring-offset-background animate-glow transition-transform hover:scale-105 active:scale-95 pointer-events-auto" // Ensure button is clickable
        onClick={onClick}
        aria-label={`Email your representative about ${selectedCount} item(s)`}
        aria-hidden={!show} // Hide from accessibility tree when not shown
        tabIndex={show ? 0 : -1} // Prevent tabbing when hidden
      >
        <Mail className="h-5 w-5" />
        Email Officials ({selectedCount})
      </Button>
    </div>
  );
}
