'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Loader2, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaxAmountStepMobileProps {
  onSubmit: (amount: number | null) => void;
  isLoading: boolean;
  medianTax: number;
}

export default function TaxAmountStepMobile({ onSubmit, isLoading, medianTax }: TaxAmountStepMobileProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    onSubmit(numAmount);
  };

  const useMedian = () => {
    onSubmit(medianTax);
    toast({ title: 'Using median estimate', description: `$${medianTax.toLocaleString()}` });
  };

  const formatAmount = (num: number) => num.toLocaleString();

  return (
    <div className="px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold text-foreground">How much did you pay in federal taxes?</h2>
        <p className="text-muted-foreground text-sm">
          Enter your total federal tax amount from last year
        </p>
      </div>

      {/* Main input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
          <Input
            ref={inputRef}
            placeholder="0"
            value={amount}
            onChange={handleChange}
            className="pl-10 h-12 text-base text-right pr-4"
            inputMode="numeric"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!amount || isLoading} 
          className="w-full h-12 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </form>

      {/* Quick option */}
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Not sure? Use the median estimate for your area:
          </p>
          <Button 
            variant="outline" 
            onClick={useMedian} 
            disabled={isLoading}
            className="h-12 text-base px-6"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Use ${formatAmount(medianTax)}
          </Button>
        </div>
      </div>
    </div>
  );
} 