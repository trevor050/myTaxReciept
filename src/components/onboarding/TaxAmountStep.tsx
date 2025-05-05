'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface TaxAmountStepProps {
  onSubmit: (amount: number) => void;
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     // Allow only numbers and a single decimal point
     const value = event.target.value;
     // Basic filtering - allows digits and one decimal point. More robust validation can be added.
     if (/^\d*\.?\d*$/.test(value)) {
        setTaxAmount(value);
     }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Enter Your Estimated Tax</h2>
      <p className="text-center text-muted-foreground">
        Enter the approximate amount of income tax you paid last year.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="taxAmount">Estimated Annual Income Tax Paid</Label>
           <div className="relative">
             <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="taxAmount"
                type="text" // Use text to allow formatting, validate on submit
                inputMode="decimal" // Hint for mobile keyboards
                placeholder="e.g., 5000"
                value={taxAmount}
                onChange={handleInputChange}
                className="pl-10"
                aria-label="Estimated annual income tax paid"
                required
              />
           </div>
           <p className="text-xs text-muted-foreground pt-1">
             This helps personalize the breakdown. An estimate is fine.
           </p>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
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
    </div>
  );
}
