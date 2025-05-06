
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Loader2, Zap, CornerDownLeft } from 'lucide-react'; // Added CornerDownLeft
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TaxAmountStepProps {
  onSubmit: (amount: number | null) => void; // Allow null for average case
  isLoading: boolean;
  medianTax: number; // Accept median tax as prop
}

export default function TaxAmountStep({ onSubmit, isLoading, medianTax }: TaxAmountStepProps) {
  const [taxAmount, setTaxAmount] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();

    // Add keydown listener for Enter key
     const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Enter') {
             // Prevent form submission if input is focused and has value
             if (document.activeElement === inputRef.current && taxAmount.trim()) {
                event.preventDefault(); // Stop default form submission via Enter
                handleSubmit(event as unknown as React.FormEvent); // Trigger validation and submit
             } else if (document.activeElement === inputRef.current && !taxAmount.trim()) {
                 // If input is focused and empty, trigger skip
                 event.preventDefault();
                 handleUseMedian();
             }
             // Allow Enter for button clicks
         }
     };

     window.addEventListener('keydown', handleKeyDown);
     return () => {
         window.removeEventListener('keydown', handleKeyDown);
     };
   }, [taxAmount, onSubmit, toast, medianTax]); // Add medianTax to dependencies


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const amountString = taxAmount.replace(/[^0-9.]/g, ''); // Sanitize input
    const amount = parseFloat(amountString);

    if (isNaN(amount) || amount <= 0) {
       toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive tax amount.',
        variant: 'destructive',
      });
      // Keep focus on input if validation fails
      inputRef.current?.focus();
      return;
    }
    onSubmit(amount);
  };

   const handleUseMedian = () => {
      // Submit null to indicate using the median value
      onSubmit(null);
      toast({
         title: 'Using Median',
          description: `Calculating breakdown based on the estimated median federal tax for your area: $${medianTax.toLocaleString()}.`, // Use prop
      });
   };


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     // Allow only numbers and a single decimal point
     const value = event.target.value;
     // Basic filtering - allows digits and one decimal point. More robust validation can be added.
     if (/^\d*\.?\d*$/.test(value) || value === '') { // Allow empty string for clearing input
        setTaxAmount(value);
     }
  }

  return (
    <div className="space-y-6">
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="taxAmount" className="sr-only">Estimated Annual Income Tax Paid or press Enter to skip</Label> {/* Updated sr-only label */}
           <div className="relative">
             <DollarSign className={cn(
                "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70 pointer-events-none transition-colors duration-200",
                 typeof document !== 'undefined' && inputRef.current === document.activeElement && "text-primary" // Highlight icon on focus (client only)
             )} />
              <Input
                ref={inputRef}
                id="taxAmount"
                type="text" // Use text to allow formatting, validate on submit
                inputMode="decimal" // Hint for mobile keyboards
                placeholder="Enter Amount (e.g., 5000)"
                value={taxAmount}
                onChange={handleInputChange}
                className="pl-10 pr-16 h-12 text-lg sm:text-xl text-center" // Added right padding
                aria-label="Estimated annual income tax paid or press Enter to skip"
                aria-describedby="tax-skip-hint"
              />
              {/* Skip Hint */}
                <div id="tax-skip-hint" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground/70 pointer-events-none">
                   Skip <CornerDownLeft className="h-3 w-3"/>
                </div>
           </div>
            <p className="text-xs text-muted-foreground pt-1 text-center">Enter your estimate or press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-sm dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Enter</kbd> to use the estimated median for your area.</p>
        </div>
        <Button type="submit" className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02]" size="lg" disabled={isLoading || !taxAmount}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'See My Tax Breakdown'
          )}
        </Button>
      </form>

        {/* Separator */}
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground/80">
                Or
            </span>
            </div>
        </div>

       {/* Use Median Button */}
        <div className="text-center space-y-2">
             <Button
                variant="outline" // Changed variant for better distinction
                onClick={handleUseMedian}
                disabled={isLoading}
                 className="transition-colors w-full sm:w-auto text-base border-primary/50 text-primary hover:bg-primary/5" // Adjusted styling
                size="lg"
            >
                <Zap className="mr-2 h-4 w-4" /> Use Area Median ($ {medianTax.toLocaleString()}) {/* Use prop */}
            </Button>
            {/* Removed redundant text */}
       </div>

    </div>
  );
}
