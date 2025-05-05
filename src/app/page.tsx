'use client';

import * as React from 'react';
import { useState } from 'react';
import type { Location, TaxSpending } from '@/services/tax-spending';
import { getTaxSpending } from '@/services/tax-spending';
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives';
import { suggestRepresentatives } from '@/ai/flows/suggest-representatives';

import LocationStep from '@/components/onboarding/LocationStep';
import TaxAmountStep from '@/components/onboarding/TaxAmountStep';
import TaxBreakdownDashboard from '@/components/dashboard/TaxBreakdownDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AppStep = 'location' | 'tax' | 'dashboard';

export default function Home() {
  const [step, setStep] = useState<AppStep>('location');
  const [location, setLocation] = useState<Location | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [taxSpending, setTaxSpending] = useState<TaxSpending[]>([]);
  const [representativeSuggestion, setRepresentativeSuggestion] =
    useState<SuggestRepresentativesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLocationSubmit = (loc: Location) => {
    setLocation(loc);
    setStep('tax');
  };

  const handleTaxAmountSubmit = async (amount: number) => {
    setTaxAmount(amount);
    setIsLoading(true);
    if (!location) {
      // Should not happen, but handle defensively
      toast({
        title: 'Error',
        description: 'Location not set. Please go back and set your location.',
        variant: 'destructive',
      });
      setIsLoading(false);
      setStep('location');
      return;
    }
    try {
      const spendingData = await getTaxSpending(location, amount);
      setTaxSpending(spendingData);

      // Call AI suggestion flow
      const suggestionInput = { taxSpending: spendingData };
      const suggestionResult = await suggestRepresentatives(suggestionInput);
      setRepresentativeSuggestion(suggestionResult);

      setStep('dashboard');
    } catch (error) {
      console.error('Error fetching tax spending or AI suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tax data or suggestions. Please try again.',
        variant: 'destructive',
      });
      // Optionally reset state or allow retry
      setStep('tax'); // Go back to tax step on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'tax') {
      setStep('location');
    } else if (step === 'dashboard') {
      setStep('tax');
      // Reset dashboard specific state if needed
      setTaxSpending([]);
      setRepresentativeSuggestion(null);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'location':
        return <LocationStep onSubmit={handleLocationSubmit} />;
      case 'tax':
        return (
          <TaxAmountStep onSubmit={handleTaxAmountSubmit} isLoading={isLoading} />
        );
      case 'dashboard':
        return (
          <TaxBreakdownDashboard
            taxAmount={taxAmount!}
            taxSpending={taxSpending}
            representativeSuggestion={representativeSuggestion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        {step !== 'location' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4 text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Card className="w-full shadow-lg rounded-lg animate-fadeIn">
           <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                WhereIsMyTaxMoneyGoing.org
              </CardTitle>
           </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="animate-slideInUp">
             {renderStep()}
            </div>
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-muted-foreground text-sm">
            Powered by Firebase & Google AI
        </footer>
       </div>
    </main>
  );
}
