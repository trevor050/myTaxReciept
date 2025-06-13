
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Loader2, SkipForward, CornerDownLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface HourlyWageStepProps {
  onSubmit: (amount: number | null) => void; // Allow null for skipping
  isLoading: boolean;
}

export default function HourlyWageStep({ onSubmit, isLoading }: HourlyWageStepProps) {
  const [hourlyWage, setHourlyWage] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering

  useEffect(() => {
    setIsClient(true); // Set client to true on mount
    // Focus input on mount
    if (typeof window !== 'undefined') { // Ensure inputRef.current is accessed only on client
        inputRef.current?.focus();
    }


    // Add keydown listener for Enter key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        // Prevent form submission if input is focused and has value
        if (document.activeElement === inputRef.current && hourlyWage.trim()) {
          event.preventDefault();
          handleSubmit(event as unknown as React.FormEvent);
        } else if (document.activeElement === inputRef.current && !hourlyWage.trim()) {
          // If input is focused and empty, trigger skip
          event.preventDefault();
          handleSkip();
        }
        // Allow Enter for button clicks
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hourlyWage, onSubmit, toast]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const wageString = hourlyWage.replace(/[^0-9.]/g, ''); // Sanitize input
    const wage = parseFloat(wageString);

    if (isNaN(wage) || wage <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive hourly wage.',
        variant: 'destructive',
      });
      inputRef.current?.focus();
      return;
    }
    onSubmit(wage);
  };

  const handleSkip = () => {
    onSubmit(null); // Submit null to indicate skipping
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') { // Allow digits and up to 2 decimal places
      setHourlyWage(value);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6"> {/* Adjusted spacing for mobile */}
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4"> {/* Adjusted spacing for mobile */}
        <div className="space-y-1 sm:space-y-2"> {/* Adjusted spacing for mobile */}
          <Label htmlFor="hourlyWage" className="sr-only">Approximate Hourly Wage (or press Enter to skip)</Label>
          <div className="relative">
            <DollarSign className={cn(
              "absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground/70 pointer-events-none transition-colors duration-200",
              isClient && inputRef.current === document.activeElement && "text-primary" // Highlight icon on focus (client only)
            )} />
            <Input
              ref={inputRef}
              id="hourlyWage"
              type="text"
              inputMode="decimal"
              placeholder="Enter Hourly Wage (e.g., 25.50)"
              value={hourlyWage}
              onChange={handleInputChange}
              className="pl-9 sm:pl-10 pr-12 sm:pr-16 h-11 sm:h-12 text-base sm:text-lg text-center" // Adjusted padding, height, and font for mobile
              aria-label="Approximate hourly wage or press Enter to skip"
              aria-describedby="wage-skip-hint"
            />
            <div id="wage-skip-hint" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground/70 pointer-events-none">
              Skip <CornerDownLeft className="h-3 w-3" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1 text-center">
            Enter your approximate hourly wage or press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-sm dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Enter</kbd> to skip this step.
          </p>
        </div>
        <Button type="submit" className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02] text-sm sm:text-base" size="lg" disabled={isLoading || !hourlyWage}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'View My Tax Receipt'
          )}
        </Button>
      </form>

      {/* Separator */}
      <div className="relative my-2 sm:my-4"> {/* Adjusted margin for mobile */}
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground/80">
            Or
          </span>
        </div>
      </div>

      {/* Skip Button */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isLoading}
          className="transition-colors w-full sm:w-auto text-sm sm:text-base border-primary/50 text-primary hover:bg-primary/5" // Adjusted styling to match TaxAmountStep
          size="lg"
        >
          <SkipForward className="mr-2 h-4 w-4" /> Skip This Step
        </Button>
      </div>
    </div>
  );
}

