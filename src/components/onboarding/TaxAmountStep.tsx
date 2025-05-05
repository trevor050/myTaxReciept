
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Loader2, Zap } from 'lucide-react'; // Added Zap icon
import { useToast } from '@/hooks/use-toast';

const AVERAGE_FEDERAL_TAX = 10000; // Consistent average value


interface TaxAmountStepProps {
  onSubmit: (amount: number | null) => void; // Allow null for average case
  isLoading: boolean;
}

export default function TaxAmountStep({ onSubmit, isLoading }: TaxAmountStepProps) {
  const [taxAmount, setTaxAmount] = useState('');
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = parseFloat(taxAmount.replace(/[^0-9.]/g, '')); // Sanitize input

    if (isNaN(amount) || amount <= 0) {
       toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive tax amount.',
        variant: 'destructive',
      });
      return;
    }
    onSubmit(amount);
  };

   const handleUseAverage = () => {
      // Submit null to indicate using the average/median value
      onSubmit(null);
      toast({
         title: 'Using Average',
         description: `Calculating breakdown based on the U.S. average federal tax of $${AVERAGE_FEDERAL_TAX.toLocaleString()}.`,
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
          <Label htmlFor="taxAmount" className="sr-only">Estimated Annual Income Tax Paid</Label> {/* Screen reader only */}
           <div className="relative">
             <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" /> {/* Slightly larger icon */}
              <Input
                id="taxAmount"
                type="text" // Use text to allow formatting, validate on submit
                inputMode="decimal" // Hint for mobile keyboards
                placeholder="Enter Amount (e.g., 5000)"
                value={taxAmount}
                onChange={handleInputChange}
                className="pl-10 h-12 text-lg sm:text-xl text-center" // Larger input, centered
                aria-label="Estimated annual income tax paid"
              />
           </div>
        </div>
        <Button type="submit" className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02]" size="lg" disabled={isLoading || !taxAmount}> {/* Larger button, disable if no amount */}
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

       {/* Use Average Button */}
        <div className="text-center space-y-2">
             <Button
                variant="ghost"
                onClick={handleUseAverage}
                disabled={isLoading}
                className="text-primary hover:text-primary/80 transition-colors w-full sm:w-auto text-base" // Larger text
                size="lg" // Larger button
            >
                <Zap className="mr-2 h-4 w-4" /> Skip & Use U.S. Average
            </Button>
            <p className="text-xs text-muted-foreground">
                 Uses an estimated average federal income tax of ${AVERAGE_FEDERAL_TAX.toLocaleString()}.
            </p>
       </div>

    </div>
  );
}
