
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle'; // Import ThemeToggle

type AppStep = 'location' | 'tax' | 'dashboard';

const AVERAGE_FEDERAL_TAX = 10000; // Updated average federal tax amount

export default function Home() {
  const [step, setStep] = useState<AppStep>('location');
  const [prevStep, setPrevStep] = useState<AppStep | null>(null); // Track previous step for animation direction
  const [location, setLocation] = useState<Location | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [taxSpending, setTaxSpending] = useState<TaxSpending[]>([]);
  const [representativeSuggestion, setRepresentativeSuggestion] =
    useState<SuggestRepresentativesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [animationClass, setAnimationClass] = useState('animate-slideInUp');

  const navigateToStep = (nextStep: AppStep) => {
    const isGoingBack = (step === 'tax' && nextStep === 'location') || (step === 'dashboard' && nextStep === 'tax');
    setAnimationClass(isGoingBack ? 'animate-slideOutUp' : 'animate-slideOutUp'); // Animate out first

    setTimeout(() => {
      setPrevStep(step);
      setStep(nextStep);
      setAnimationClass(isGoingBack ? 'animate-slideInDown' : 'animate-slideInUp'); // Animate in
    }, 300); // Match animation duration
  };


  const handleLocationSubmit = (loc: Location) => {
    setLocation(loc);
    navigateToStep('tax');
  };

  const handleTaxAmountSubmit = async (amount: number | null) => { // Allow null for average case
     setIsLoading(true);
    const finalAmount = amount ?? AVERAGE_FEDERAL_TAX; // Use updated average tax amount if null
    setTaxAmount(finalAmount);

    if (!location) {
      toast({
        title: 'Error',
        description: 'Location not set. Please go back and set your location.',
        variant: 'destructive',
      });
      setIsLoading(false);
      navigateToStep('location');
      return;
    }

    try {
      // Simulate network delay slightly longer for perceived smoothness
      await new Promise(resolve => setTimeout(resolve, 400));

      const spendingData = await getTaxSpending(location, finalAmount);
      setTaxSpending(spendingData);

      // Fetch AI suggestion (Simplified - focusing on top categories)
      try {
         const suggestionResult = await suggestRepresentatives({ taxSpending: spendingData });
         setRepresentativeSuggestion(suggestionResult);
      } catch (aiError) {
          console.warn("AI suggestion failed:", aiError);
          // Provide a basic fallback if AI fails - maybe just list top 1-2 categories manually
           const topCategories = spendingData.slice(0, 2).map(s => s.category);
           setRepresentativeSuggestion({
               topSpendingCategories: topCategories,
               reason: "Analysis based on highest spending areas.",
           });
      }


      navigateToStep('dashboard');
    } catch (error) {
      console.error('Error fetching tax spending:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tax data. Please try again.',
        variant: 'destructive',
      });
       // Stay on tax step on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'tax') {
      navigateToStep('location');
    } else if (step === 'dashboard') {
       // Clear data relevant to the dashboard when going back
       setTaxSpending([]);
       setRepresentativeSuggestion(null);
      navigateToStep('tax');
    }
  };


  const getTitleAndDescription = () => {
    switch (step) {
        case 'location': return {
            title: 'Find Your Tax Breakdown',
            description: 'Start by telling us where you are for relevant data.'
        };
        case 'tax': return {
            title: 'Estimate Your Contribution',
            description: `Enter your estimated federal income tax paid last year, or use the U.S. average of $${AVERAGE_FEDERAL_TAX.toLocaleString()}.` // Updated description
        };
        case 'dashboard': return {
             title: 'Your Personalized Tax Receipt',
             description: `See how your estimated ${taxAmount ? '$'+taxAmount.toLocaleString() : `average ($${AVERAGE_FEDERAL_TAX.toLocaleString()}) tax`} payment might be allocated.` // Updated description
        };
        default: return {
            title: 'WhereIsMyTaxMoneyGoing.org',
            description: 'Understand your federal tax spending & take action.'
        };
    }
  };

  const { title, description } = getTitleAndDescription();


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-background via-secondary/5 to-background">
       {/* Adjust max-width based on step for better responsiveness */}
       <div className={`w-full ${step === 'dashboard' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto space-y-4 transition-all duration-300 ease-in-out`}>
        {step !== 'location' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 self-start mb-[-0.5rem] ml-[-0.5rem] relative z-10 opacity-80 hover:opacity-100" // Adjusted positioning and opacity
            aria-label="Go back"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
        )}
        <Card className="w-full shadow-xl rounded-xl border border-border/50 overflow-hidden bg-card">
           <CardHeader className="bg-card/95 border-b border-border/50 px-6 py-5 sm:px-8 sm:py-6">
             {/* Use key for smooth text transition */}
             <div key={`header-${step}`} className="animate-fadeIn duration-400">
                  <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                     {title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1.5 text-sm sm:text-base"> {/* Adjusted text size */}
                    {description}
                  </CardDescription>
              </div>
           </CardHeader>
          <CardContent className="p-6 sm:p-8 md:p-10 bg-background relative overflow-hidden min-h-[300px] sm:min-h-[350px]"> {/* Increased min-height slightly */}
             {/* Apply animations directly to the step components */}
             <div className={`${animationClass} duration-300`}>
                 {step === 'location' && <LocationStep onSubmit={handleLocationSubmit} />}
                 {step === 'tax' && <TaxAmountStep onSubmit={handleTaxAmountSubmit} isLoading={isLoading} />}
                 {step === 'dashboard' && (
                     isLoading || taxAmount === null || taxSpending.length === 0 ? (
                         <div className="flex items-center justify-center h-full text-muted-foreground"> {/* Center loading */}
                            <div className="text-center p-10">Loading your tax breakdown...</div>
                         </div>
                     ) : (
                         // No need for inner div with max-width here, handled by parent container
                         <TaxBreakdownDashboard
                            taxAmount={taxAmount}
                            taxSpending={taxSpending}
                            representativeSuggestion={representativeSuggestion}
                        />
                     )
                 )}
             </div>
          </CardContent>
        </Card>
        <footer className="mt-6 text-center text-muted-foreground/60 text-xs px-4 sm:px-0 relative"> {/* Added padding for mobile */}
            Powered by Firebase & Google AI. Data is estimated and for informational purposes. Verify with official sources.
            <div className="absolute right-0 bottom-0 sm:right-4"> {/* Position ThemeToggle */}
                 <ThemeToggle />
            </div>
        </footer>
       </div>
    </main>
  );
}
