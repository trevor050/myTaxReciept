
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Location, TaxSpending } from '@/services/tax-spending';
import { getTaxSpending } from '@/services/tax-spending';
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives';
// Removed suggestRepresentatives import as it's no longer used

import LocationStep from '@/components/onboarding/LocationStep';
import TaxAmountStep from '@/components/onboarding/TaxAmountStep';
import TaxBreakdownDashboard from '@/components/dashboard/TaxBreakdownDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle';

type AppStep = 'location' | 'tax' | 'dashboard';

// Updated median federal tax amount based on provided data
const MEDIAN_FEDERAL_TAX = 17766;
// Default location (NYC) for skipping
const DEFAULT_LOCATION: Location = { lat: 40.7128, lng: -74.0060 };


export default function Home() {
  const [step, setStep] = useState<AppStep>('location');
  const [prevStep, setPrevStep] = useState<AppStep | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [taxSpending, setTaxSpending] = useState<TaxSpending[]>([]);
  // representativeSuggestion is removed as AI call is removed
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [animationClass, setAnimationClass] = useState('animate-slideInUp');

  const navigateToStep = (nextStep: AppStep) => {
    const isGoingBack = (step === 'tax' && nextStep === 'location') || (step === 'dashboard' && nextStep === 'tax');
    setAnimationClass(isGoingBack ? 'animate-slideOutUp' : 'animate-slideOutUp');

    setTimeout(() => {
      setPrevStep(step);
      setStep(nextStep);
      setAnimationClass(isGoingBack ? 'animate-slideInDown' : 'animate-slideInUp');
    }, 300);
  };


  const handleLocationSubmit = (loc: Location | null) => {
    // Use default location if null (skipped)
    const finalLocation = loc ?? DEFAULT_LOCATION;
    setLocation(finalLocation);
    // Note: Regional tax calculation based on zip is complex locally.
    // Sticking to national median regardless of location for now.
    toast({
        title: 'Location Set',
        description: loc ? 'Using provided location.' : 'Using default location (New York Area).',
    });
    navigateToStep('tax');
  };

  const handleTaxAmountSubmit = async (amount: number | null) => {
     setIsLoading(true);
    const finalAmount = amount ?? MEDIAN_FEDERAL_TAX; // Use updated median tax amount if null (skipped)
    setTaxAmount(finalAmount);

    const currentLocation = location ?? DEFAULT_LOCATION; // Ensure location is set

    try {
      // Simulate loading time for smoother transition
      await new Promise(resolve => setTimeout(resolve, 400));

      const spendingData = await getTaxSpending(currentLocation, finalAmount);
      setTaxSpending(spendingData);

      // AI suggestion removed previously

      navigateToStep('dashboard');
    } catch (error) {
      console.error('Error fetching tax spending:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tax data. Please try again.',
        variant: 'destructive',
      });
      // Optionally navigate back or allow retry
      // navigateToStep('tax');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'tax') {
      setLocation(null); // Reset location when going back from tax
      navigateToStep('location');
    } else if (step === 'dashboard') {
       setTaxSpending([]);
       // Reset tax amount when going back from dashboard to allow re-entry or using median
       setTaxAmount(null);
      navigateToStep('tax');
    }
  };


  const getTitleAndDescription = () => {
    switch (step) {
        case 'location': return {
            title: 'Find Your Tax Breakdown',
            description: 'Enter your location (e.g., zip code) or skip to use a default.'
        };
        case 'tax': return {
            title: 'Estimate Your Contribution',
            description: `Enter your estimated federal income tax paid last year, or skip to use the U.S. median of $${MEDIAN_FEDERAL_TAX.toLocaleString()}.` // Updated description
        };
        case 'dashboard': return {
             title: 'Your Personalized Tax Receipt',
             description: `See how your estimated ${taxAmount ? '$'+taxAmount.toLocaleString() : `median ($${MEDIAN_FEDERAL_TAX.toLocaleString()}) tax`} payment might be allocated.` // Updated description
        };
        default: return {
            title: 'My Tax Receipt .org', // Update default title
            description: 'Understand your federal tax spending & take action.'
        };
    }
  };

  const { title, description } = getTitleAndDescription();


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-background via-secondary/5 to-background">
       <div className={`w-full ${step === 'dashboard' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto space-y-4 transition-all duration-300 ease-in-out`}>
        {step !== 'location' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 self-start mb-[-0.5rem] ml-[-0.5rem] relative z-10 opacity-80 hover:opacity-100"
            aria-label="Go back"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
        )}
        <Card className="w-full shadow-xl rounded-xl border border-border/50 overflow-hidden bg-card">
           {/* Add relative positioning for ThemeToggle placement */}
           <CardHeader className="bg-card/95 border-b border-border/50 px-6 py-5 sm:px-8 sm:py-6 relative">
             {/* Add ThemeToggle to the top right corner */}
             <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10">
                <ThemeToggle />
             </div>
             <div key={`header-${step}`} className="animate-fadeIn duration-400 pr-10"> {/* Add padding-right to avoid overlap */}
                  <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                     {title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                    {description}
                  </CardDescription>
              </div>
           </CardHeader>
          <CardContent className="p-6 sm:p-8 md:p-10 bg-background relative overflow-hidden min-h-[300px] sm:min-h-[350px]">
             <div className={`${animationClass} duration-300`}>
                 {step === 'location' && <LocationStep onSubmit={handleLocationSubmit} />}
                 {step === 'tax' && <TaxAmountStep onSubmit={handleTaxAmountSubmit} isLoading={isLoading} />}
                 {step === 'dashboard' && (
                     isLoading || taxAmount === null || taxSpending.length === 0 ? (
                         <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center p-10">Loading your tax breakdown...</div>
                         </div>
                     ) : (
                         <TaxBreakdownDashboard
                            taxAmount={taxAmount}
                            taxSpending={taxSpending}
                            // Pass null for representativeSuggestion as AI is removed
                            representativeSuggestion={null}
                        />
                     )
                 )}
             </div>
          </CardContent>
        </Card>

        <footer className="mt-6 text-center text-muted-foreground/60 text-xs px-4 sm:px-0 relative">
            Powered by Firebase & Google AI (where applicable). Data is estimated and for informational purposes. Verify with official sources.
        </footer>
       </div>
    </main>
  );
}
