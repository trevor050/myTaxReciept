
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
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
      setStep('tax');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'tax') {
      setStep('location');
    } else if (step === 'dashboard') {
      setStep('tax');
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
        // Ensure data is available before rendering dashboard
        if (taxAmount === null || taxSpending.length === 0) {
            // Optional: Show a loading state or message here
            return <p>Loading dashboard...</p>;
        }
        return (
          <TaxBreakdownDashboard
            taxAmount={taxAmount}
            taxSpending={taxSpending}
            representativeSuggestion={representativeSuggestion}
          />
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
        case 'location': return 'Find Your Tax Breakdown';
        case 'tax': return 'Estimate Your Contribution';
        case 'dashboard': return 'Your Personalized Tax Receipt';
        default: return 'WhereIsMyTaxMoneyGoing.org';
    }
  };

   const getDescription = () => {
    switch (step) {
        case 'location': return 'Start by telling us where you are.';
        case 'tax': return 'Enter your estimated federal income tax paid.';
        case 'dashboard': return `See how your estimated $${taxAmount?.toLocaleString() || 'tax'} might be allocated.`;
        default: return 'Understand your federal tax spending.';
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-background to-secondary/30">
       <div className="w-full max-w-3xl mx-auto space-y-6">
        {step !== 'location' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Card className="w-full shadow-xl rounded-xl border border-border/50 overflow-hidden animate-fadeIn">
           <CardHeader className="bg-card/95 border-b border-border/50 px-6 py-5 sm:px-8 sm:py-6">
              <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                 {getTitle()}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">{getDescription()}</CardDescription>
           </CardHeader>
          <CardContent className="p-6 sm:p-8 md:p-10 bg-background">
             {/* Apply animations conditionally based on step transition */}
            <div key={step} className="animate-slideInUp duration-500 ease-out">
             {renderStep()}
            </div>
          </CardContent>
        </Card>
        <footer className="mt-6 text-center text-muted-foreground/80 text-xs">
            Powered by Firebase & Google AI. Data is illustrative.
        </footer>
       </div>
    </main>
  );
}
    
    