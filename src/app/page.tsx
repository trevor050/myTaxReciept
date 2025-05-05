
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
      // Simulate network delay for smoother transition feel
      await new Promise(resolve => setTimeout(resolve, 300));

      const spendingData = await getTaxSpending(location, amount);
      setTaxSpending(spendingData);

      // Fetch AI suggestion in parallel (or slightly delayed)
      const suggestionPromise = suggestRepresentatives({ taxSpending: spendingData });

      // Wait for both if necessary, or just the suggestion here
      const suggestionResult = await suggestionPromise;
      setRepresentativeSuggestion(suggestionResult);

      setStep('dashboard');
    } catch (error) {
      console.error('Error fetching tax spending or AI suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tax data or suggestions. Please try again.',
        variant: 'destructive',
      });
       // Go back to tax step on error, don't clear amount yet
       // setStep('tax');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'tax') {
      setStep('location');
    } else if (step === 'dashboard') {
      setStep('tax');
      // Keep taxAmount, clear spending data for re-fetch if needed, or allow caching
      // setTaxSpending([]); // Decide if recalculation is needed on back
      // setRepresentativeSuggestion(null);
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
        if (isLoading || taxAmount === null || taxSpending.length === 0) {
            // Improved loading state (optional: use skeleton)
            return <div className="text-center p-10">Loading your tax breakdown...</div>;
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
        case 'location': return 'Start by telling us where you are for relevant data.';
        case 'tax': return 'Enter your estimated federal income tax paid last year.';
        case 'dashboard': return `See how your estimated $${taxAmount?.toLocaleString() || 'tax'} payment might be allocated.`;
        default: return 'Understand your federal tax spending & take action.';
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-background via-secondary/10 to-background">
       <div className="w-full max-w-4xl mx-auto space-y-6"> {/* Increased max-width */}
        {step !== 'location' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 self-start mb-[-1rem] ml-[-0.5rem] relative z-10" // Adjust positioning
            aria-label="Go back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Card className="w-full shadow-xl rounded-xl border border-border/50 overflow-hidden bg-card"> {/* Ensure background for card */}
           <CardHeader className="bg-card/95 border-b border-border/50 px-6 py-5 sm:px-8 sm:py-6">
             {/* Animate title changes */}
             <div key={`header-${step}`} className="animate-fadeIn duration-300">
                  <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                     {getTitle()}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1.5"> {/* Increased margin */}
                    {getDescription()}
                  </CardDescription>
              </div>
           </CardHeader>
          <CardContent className="p-6 sm:p-8 md:p-10 bg-background transition-colors duration-300">
            {/* Apply animations using key and distinct classes for enter/exit */}
            <div key={step} className="animate-slideInUp duration-500 ease-out">
             {renderStep()}
            </div>
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-muted-foreground/70 text-xs">
            Powered by Firebase & Google AI. Data is estimated and for informational purposes. Verify with official sources.
        </footer>
       </div>
    </main>
  );
}

    