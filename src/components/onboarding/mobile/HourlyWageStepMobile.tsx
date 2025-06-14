'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HourlyWageStepMobileProps {
  onSubmit: (wage: number | null) => void;
  isLoading: boolean;
}

export default function HourlyWageStepMobile({ onSubmit, isLoading }: HourlyWageStepMobileProps) {
  const [wage, setWage] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value.split('.').length <= 2) {
      setWage(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numWage = parseFloat(wage);
    if (isNaN(numWage) || numWage <= 0) {
      toast({ title: 'Please enter a valid wage', variant: 'destructive' });
      return;
    }
    onSubmit(numWage);
  };

  const skipStep = () => {
    onSubmit(null);
    toast({ title: 'Skipped wage input' });
  };

  return (
    <div className="px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold text-foreground">What's your hourly wage?</h2>
        <p className="text-muted-foreground text-sm">
          This helps us show how your work time translates to tax spending
        </p>
      </div>

      {/* Main input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
          <Input
            ref={inputRef}
            placeholder="25.00"
            value={wage}
            onChange={handleChange}
            className="pl-10 h-12 text-base text-right pr-4"
            inputMode="decimal"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!wage || isLoading} 
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

      {/* Skip option */}
      <div className="text-center">
        <Button 
          variant="ghost" 
          onClick={skipStep} 
          disabled={isLoading}
          className="h-12 text-base text-muted-foreground border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/20"
        >
          <Clock className="h-4 w-4 mr-2 opacity-60" />
          Skip this step
        </Button>
      </div>
    </div>
  );
} 