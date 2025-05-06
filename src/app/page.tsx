
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Location, TaxSpending, SelectedItem } from '@/services/tax-spending'; // Added SelectedItem
import { getTaxSpending } from '@/services/tax-spending';
import { guessStateFromZip, getAverageTaxForState } from '@/lib/zip-to-state';
import { mapFundingLevelToSlider } from '@/lib/funding-utils'; // Import the mapping function

import LocationStep from '@/components/onboarding/LocationStep';
import TaxAmountStep from '@/components/onboarding/TaxAmountStep';
import TaxBreakdownDashboard from '@/components/dashboard/TaxBreakdownDashboard';
import FloatingEmailButton from '@/components/dashboard/FloatingEmailButton';
import EmailCustomizationModal from '@/components/dashboard/EmailCustomizationModal'; // Import the modal
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle';

type AppStep = 'location' | 'tax' | 'dashboard';

// National median federal tax amount
const NATIONAL_MEDIAN_FEDERAL_TAX = 17766;
// Default location (NYC) for skipping
const DEFAULT_LOCATION: Location = { lat: 40.7128, lng: -74.0060 };
const DEFAULT_STATE = 'NY'; // State abbreviation for default location


export default function Home() {
  const [step, setStep] = useState<AppStep>('location');
  const [prevStep, setPrevStep] = useState<AppStep | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [taxSpending, setTaxSpending] = useState<TaxSpending[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [animationClass, setAnimationClass] = useState('animate-slideInUp');

  // State for controlling the email button visibility/count
  const [showEmailAction, setShowEmailAction] = useState(false);
  const [emailActionCount, setEmailActionCount] = useState(0);
  // State for the email modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  // State to hold the selected items from the dashboard
  const [selectedEmailItems, setSelectedEmailItems] = useState<Map<string, SelectedItem>>(new Map());
  // State to hold budget balance preference
  const [balanceBudgetChecked, setBalanceBudgetChecked] = useState(false);

  // Lifted state for EmailCustomizationModal
  const [aggressiveness, setAggressiveness] = useState<number>(50); // Default 50
  const [itemFundingLevels, setItemFundingLevels] = useState<Map<string, number>>(new Map());
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');

  const [estimatedMedianTax, setEstimatedMedianTax] = useState<number>(NATIONAL_MEDIAN_FEDERAL_TAX);


  // Update itemFundingLevels based on selectedEmailItems whenever it changes
  useEffect(() => {
     setItemFundingLevels(new Map(
       Array.from(selectedEmailItems.entries()).map(([id, item]) => [
         id,
         // Retrieve existing slider value if available, otherwise map from initial funding level
         itemFundingLevels.get(id) ?? mapFundingLevelToSlider(item.fundingLevel)
       ])
     ));
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedEmailItems]); // Only run when selectedEmailItems changes


  const navigateToStep = (nextStep: AppStep) => {
    const isGoingBack = (step === 'tax' && nextStep === 'location') || (step === 'dashboard' && nextStep === 'tax');
    setAnimationClass(isGoingBack ? 'animate-slideOutUp' : 'animate-slideOutUp');

    // Reset state when navigating BACK from dashboard
    if (step === 'dashboard' && nextStep !== 'dashboard') {
       setShowEmailAction(false);
       setEmailActionCount(0);
       setSelectedEmailItems(new Map()); // Clear selected items
       setBalanceBudgetChecked(false); // Reset budget preference
       setIsEmailModalOpen(false); // Ensure modal is closed
       // Reset modal customization state
       setAggressiveness(50);
       setItemFundingLevels(new Map());
       setUserName('');
       setUserLocation('');
    }


    setTimeout(() => {
      setPrevStep(step);
      setStep(nextStep);
      setAnimationClass(isGoingBack ? 'animate-slideInDown' : 'animate-slideInUp');
    }, 300);
  };


  const handleLocationSubmit = (loc: Location | null, zipCode?: string) => {
    // Use default location if null (skipped)
    const finalLocation = loc ?? DEFAULT_LOCATION;
    setLocation(finalLocation);

    // Guess state and update median tax estimate
    const stateAbbr = zipCode ? guessStateFromZip(zipCode) : (loc ? null : DEFAULT_STATE); // Use default state if skipping
    const medianForState = getAverageTaxForState(stateAbbr);
    setEstimatedMedianTax(medianForState);

    toast({
        title: 'Location Set',
        description: loc ? (zipCode ? `Using location for ${zipCode}.` : 'Using current location.') : `Using default location (New York Area). Estimated median tax for this area: $${medianForState.toLocaleString()}.`,
    });
    navigateToStep('tax');
  };

  const handleTaxAmountSubmit = async (amount: number | null) => {
     setIsLoading(true);
     // Use the estimated median tax based on location/state if amount is null (skipped)
    const finalAmount = amount ?? estimatedMedianTax;
    setTaxAmount(finalAmount);

    const currentLocation = location ?? DEFAULT_LOCATION; // Ensure location is set

    try {
      // Simulate loading time for smoother transition
      await new Promise(resolve => setTimeout(resolve, 400));

      const spendingData = await getTaxSpending(currentLocation, finalAmount);
      setTaxSpending(spendingData);

      navigateToStep('dashboard');
    } catch (error) {
      console.error('Error fetching tax spending:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tax data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'tax') {
      setLocation(null); // Reset location when going back from tax
      setEstimatedMedianTax(NATIONAL_MEDIAN_FEDERAL_TAX); // Reset median estimate
      navigateToStep('location');
    } else if (step === 'dashboard') {
       setTaxSpending([]);
       // Reset tax amount when going back from dashboard to allow re-entry or using median
       setTaxAmount(null);
       // Reset email action state and modal state
       setShowEmailAction(false);
       setEmailActionCount(0);
       setSelectedEmailItems(new Map()); // Clear selected items
       setBalanceBudgetChecked(false); // Reset budget preference
       setIsEmailModalOpen(false); // Ensure modal is closed
        // Reset modal customization state
       setAggressiveness(50);
       setItemFundingLevels(new Map());
       setUserName('');
       setUserLocation('');
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
             description: `Enter your estimated federal income tax paid last year, or skip to use the estimated median for your area ($${estimatedMedianTax.toLocaleString()}).` // Updated description
        };
        case 'dashboard': return {
             title: 'Your Personalized Tax Receipt',
             description: `See how your estimated ${taxAmount ? '$'+taxAmount.toLocaleString() : `median ($${estimatedMedianTax.toLocaleString()}) tax`} payment might be allocated.` // Updated description
        };
        default: return {
            title: 'My Tax Receipt .org', // Update default title
            description: 'Understand your federal tax spending & take action.'
        };
    }
  };

  const { title, description } = getTitleAndDescription();

  // Handler for changes in dashboard selection state (from TaxBreakdownDashboard)
  const handleDashboardSelectionChange = (
      showButton: boolean,
      count: number,
      selected: Map<string, SelectedItem>,
      budgetPref: boolean
    ) => {
    setShowEmailAction(showButton);
    setEmailActionCount(count);
    setSelectedEmailItems(selected); // Store the selected items map
    setBalanceBudgetChecked(budgetPref); // Store budget preference

     // If the selection becomes empty, reset email customization state
     if (count === 0) {
        setAggressiveness(50);
        // itemFundingLevels will be cleared by the useEffect watching selectedEmailItems
        setUserName('');
        setUserLocation('');
     }
  };

  // Handler for the FloatingEmailButton click - now opens the modal
  const handleOpenEmailModal = () => {
     // Update itemFundingLevels based on the *current* selection just before opening
     setItemFundingLevels(new Map(
       Array.from(selectedEmailItems.entries()).map(([id, item]) => [
         id,
         itemFundingLevels.get(id) ?? mapFundingLevelToSlider(item.fundingLevel)
       ])
     ));
     setIsEmailModalOpen(true);
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-br from-background via-secondary/5 to-background relative"> {/* Added relative positioning */}
       {/* Container for Back button and Card */}
       <div className={`w-full ${step === 'dashboard' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto space-y-2 transition-all duration-300 ease-in-out z-10`}> {/* Ensure content is above potential fixed footer/button */}
        {/* Flex container JUST for Back button */}
        <div className="flex justify-start items-center min-h-[40px] px-1 sm:px-0"> {/* Ensure minimum height */}
            {step !== 'location' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 self-center opacity-80 hover:opacity-100"
                aria-label="Go back"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
            ) : <div />} {/* Placeholder to keep alignment */}
        </div>

        {/* Main Card */}
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
                 {step === 'tax' && <TaxAmountStep onSubmit={handleTaxAmountSubmit} isLoading={isLoading} medianTax={estimatedMedianTax} />}
                 {step === 'dashboard' && (
                     isLoading || taxAmount === null || taxSpending.length === 0 ? (
                         <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center p-10">Loading your tax breakdown...</div>
                         </div>
                     ) : (
                         <TaxBreakdownDashboard
                            taxAmount={taxAmount}
                            taxSpending={taxSpending}
                            onSelectionChange={handleDashboardSelectionChange} // Pass new handler
                         />
                     )
                 )}
             </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-6 text-center text-muted-foreground/60 text-xs px-4 sm:px-0 relative pb-16 sm:pb-6"> {/* Add padding-bottom to avoid FAB overlap */}
            Powered by Firebase & Google AI (where applicable). Data is estimated and for informational purposes. Verify with official sources.
        </footer>
       </div>

        {/* Floating Action Button - Rendered outside the main flow, positioned fixed */}
       <FloatingEmailButton
            isVisible={showEmailAction && step === 'dashboard'} // Only visible on dashboard when items selected
            count={emailActionCount}
            onClick={handleOpenEmailModal} // Opens the customization modal
       />

        {/* Email Customization Modal */}
       <EmailCustomizationModal
            isOpen={isEmailModalOpen}
            onOpenChange={setIsEmailModalOpen}
            selectedItems={selectedEmailItems} // Pass the stored selected items
            balanceBudgetChecked={balanceBudgetChecked} // Pass budget preference
            taxAmount={taxAmount ?? estimatedMedianTax} // Pass tax amount for context
            // Pass lifted state and setters
            aggressiveness={aggressiveness}
            setAggressiveness={setAggressiveness}
            itemFundingLevels={itemFundingLevels}
            setItemFundingLevels={setItemFundingLevels}
            userName={userName}
            setUserName={setUserName}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
        />
    </main>
  );
}
