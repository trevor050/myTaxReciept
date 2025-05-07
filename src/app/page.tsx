'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Location, TaxSpending, SelectedItem } from '@/services/tax-spending'; // Added SelectedItem
import { getTaxSpending } from '@/services/tax-spending';
import { guessStateFromZip, getAverageTaxForState } from '@/lib/zip-to-state';
import { mapFundingLevelToSlider } from '@/lib/funding-utils'; // Import the mapping function

import LocationStep from '@/components/onboarding/LocationStep';
import TaxAmountStep from '@/components/onboarding/TaxAmountStep';
import HourlyWageStep from '@/components/onboarding/HourlyWageStep'; // Import the new step
import TaxBreakdownDashboard from '@/components/dashboard/TaxBreakdownDashboard';
import FloatingEmailButton from '@/components/dashboard/FloatingEmailButton';
import EmailCustomizationModal from '@/components/dashboard/EmailCustomizationModal'; // Import the modal
import ResourceSuggestionsModal from '@/components/dashboard/ResourceSuggestionsModal'; // Import the new modal
import type { SuggestedResource } from '@/services/resource-suggestions'; // Import suggestion type
import { suggestResources } from '@/services/resource-suggestions'; // Import suggestion service

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import type { DashboardPerspectives, PerspectiveData } from '@/types/perspective'; // Import new types
import { generateCurrencyPerspectiveList } from '@/lib/currency-perspective';
import { generateCombinedPerspectiveList } from '@/lib/time-perspective';


type AppStep = 'location' | 'tax' | 'hourlyWage' | 'dashboard'; // Added 'hourlyWage'

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
  const [hourlyWage, setHourlyWage] = useState<number | null>(null); // State for hourly wage
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
  const [userLocationText, setUserLocationText] = useState(''); // Renamed from userLocation to avoid conflict

  const [estimatedMedianTax, setEstimatedMedianTax] = useState<number>(NATIONAL_MEDIAN_FEDERAL_TAX);

  // State for resource suggestions modal and data
  const [suggestedResources, setSuggestedResources] = useState<SuggestedResource[]>([]);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isSuggestingResources, setIsSuggestingResources] = useState(false);

  // State for pre-calculated perspectives
  const [dashboardPerspectives, setDashboardPerspectives] = useState<DashboardPerspectives | null>(null);
  const [isMobileView, setIsMobileView] = useState(false); // For pre-calculating perspectives based on view

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


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
    const stepOrder: AppStep[] = ['location', 'tax', 'hourlyWage', 'dashboard'];
    const currentStepIndex = stepOrder.indexOf(step);
    const nextStepIndex = stepOrder.indexOf(nextStep);
    const isGoingBack = nextStepIndex < currentStepIndex;

    setAnimationClass(isGoingBack ? 'animate-slideOutUp' : 'animate-slideOutUp');

    // Reset state when navigating BACK from dashboard or wage step
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
       setUserLocationText('');
       setSuggestedResources([]); // Clear suggestions
       setIsResourceModalOpen(false); // Ensure resource modal is closed
       setDashboardPerspectives(null); // Clear pre-calculated perspectives
    }
     if (step === 'hourlyWage' && isGoingBack) {
        setTaxAmount(null); // Reset tax amount when going back from wage to allow re-entry/median
        setHourlyWage(null); // Reset wage
     }
     if (step === 'tax' && isGoingBack) {
         setLocation(null); // Reset location
         setEstimatedMedianTax(NATIONAL_MEDIAN_FEDERAL_TAX); // Reset median
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

  const handleTaxAmountSubmit = (amount: number | null) => {
     // Use the estimated median tax based on location/state if amount is null (skipped)
    const finalAmount = amount ?? estimatedMedianTax;
    setTaxAmount(finalAmount);
    navigateToStep('hourlyWage'); // Go to hourly wage step next
  };

   const handleHourlyWageSubmit = async (wage: number | null) => {
     setIsLoading(true);
     setHourlyWage(wage); // Set the wage (can be null if skipped)

     // Ensure taxAmount and location are set (using defaults/estimates if needed)
     const finalTaxAmount = taxAmount ?? estimatedMedianTax;
     const currentLocation = location ?? DEFAULT_LOCATION;

     toast({
          title: wage ? 'Hourly Wage Set' : 'Hourly Wage Skipped',
          description: wage ? `Calculating breakdown based on $${wage.toFixed(2)}/hour.` : 'Time perspective feature will be disabled.',
     });

     try {
       // Simulate loading time
       await new Promise(resolve => setTimeout(resolve, 400));

       const spendingData = await getTaxSpending(currentLocation, finalTaxAmount);
       setTaxSpending(spendingData);

        // Pre-calculate perspectives
        const maxPerspectiveItems = isMobileView ? 3 : 5;
        const newChartPerspectives: Record<string, PerspectiveData> = {};
        spendingData.forEach(item => {
            const spendingAmount = (item.percentage / 100) * finalTaxAmount;
            newChartPerspectives[item.category] = {
                currency: generateCurrencyPerspectiveList(spendingAmount, maxPerspectiveItems),
                time: wage ? generateCombinedPerspectiveList((spendingAmount / wage) * 60, maxPerspectiveItems) : null,
            };
        });

        const newAccordionPerspectives: Record<string, PerspectiveData> = {};
        spendingData.forEach(category => {
            const categoryAmount = (category.percentage / 100) * finalTaxAmount;
            newAccordionPerspectives[category.id || category.category] = {
                currency: generateCurrencyPerspectiveList(categoryAmount, maxPerspectiveItems + 2), // Show a bit more for accordion
                time: wage ? generateCombinedPerspectiveList((categoryAmount / wage) * 60, maxPerspectiveItems + 2) : null,
            };
            category.subItems?.forEach(subItem => {
                const subItemAmount = subItem.amountPerDollar * finalTaxAmount;
                 newAccordionPerspectives[subItem.id] = {
                    currency: generateCurrencyPerspectiveList(subItemAmount, maxPerspectiveItems),
                    time: wage ? generateCombinedPerspectiveList((subItemAmount / wage) * 60, maxPerspectiveItems) : null,
                };
            });
        });

        const newTotalPerspectiveData: PerspectiveData = {
            currency: generateCurrencyPerspectiveList(finalTaxAmount, maxPerspectiveItems + 2),
            time: wage ? generateCombinedPerspectiveList((finalTaxAmount / wage) * 60, maxPerspectiveItems + 2) : null,
        };

        setDashboardPerspectives({
            chart: newChartPerspectives,
            accordion: newAccordionPerspectives,
            total: newTotalPerspectiveData,
        });


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
       navigateToStep('location');
     } else if (step === 'hourlyWage') {
       navigateToStep('tax');
     } else if (step === 'dashboard') {
       navigateToStep('hourlyWage'); // Go back to hourly wage step first
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
         case 'hourlyWage': return { // Added description for new step
            title: 'Time Perspective (Optional)',
            description: 'Enter your approximate hourly wage to see spending in terms of work time, or skip.'
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
        setUserLocationText('');
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

  // Function to handle fetching and showing resource suggestions
  const handleShowResourceSuggestions = async () => {
    if (selectedEmailItems.size === 0 && !balanceBudgetChecked) {
        toast({
            title: "No Concerns Selected",
            description: "To receive tailored suggestions for further action, please first select some spending items that concern you or indicate your preference for balancing the budget. You can do this on the main dashboard by checking the boxes next to specific programs.",
            variant: "default",
            duration: 7000 // Longer duration for more detailed message
        });
        return;
    }

    setIsSuggestingResources(true);
    try {
        // Ensure selectedEmailItems (which should include category) is passed to suggestResources
        const itemsArray = Array.from(selectedEmailItems.values());
        const suggestions = await suggestResources(itemsArray, aggressiveness, balanceBudgetChecked);
        setSuggestedResources(suggestions);
        if (suggestions.length > 0) {
            setIsResourceModalOpen(true);
        } else {
            toast({
                title: "No Specific Suggestions Found",
                description: "While we couldn't pinpoint organizations for your exact combination of concerns right now, remember that contacting your representatives directly with the email you've generated is a powerful way to make your voice heard. You can also research broader advocacy groups related to your general interests.",
                variant: "default",
                duration: 9000 // Longer duration
            });
        }
    } catch (error) {
        console.error("Error fetching resource suggestions:", error);
        toast({
            title: "Suggestion Error",
            description: "Could not fetch resource suggestions at this time. Please try again later. In the meantime, you can still use the generated email to contact your officials.",
            variant: "destructive",
            duration: 7000
        });
    } finally {
        setIsSuggestingResources(false);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-2 sm:p-4 md:p-8 bg-gradient-to-br from-background via-secondary/5 to-background relative"> {/* Adjusted padding for mobile */}
       {/* Container for Back button and Card */}
       <div className={`w-full ${step === 'dashboard' ? 'max-w-full md:max-w-4xl' : 'max-w-full sm:max-w-md md:max-w-2xl'} mx-auto space-y-1 sm:space-y-2 transition-all duration-300 ease-in-out z-10`}> {/* Adjusted max-width for mobile */}
        {/* Flex container JUST for Back button */}
        <div className="flex justify-start items-center min-h-[36px] sm:min-h-[40px] px-1 sm:px-0"> {/* Ensure minimum height */}
            {step !== 'location' && step !== 'dashboard' ? ( // Show back button only on tax and hourlyWage steps
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 self-center opacity-80 hover:opacity-100 text-xs sm:text-sm"
                aria-label="Go back"
              >
                <ArrowLeft className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back
              </Button>
            ) : <div />} {/* Placeholder to keep alignment */}
        </div>

        {/* Main Card */}
        <Card className="w-full shadow-xl rounded-lg sm:rounded-xl border border-border/50 overflow-hidden bg-card"> {/* Adjusted rounding for mobile */}
           {/* Add relative positioning for ThemeToggle placement */}
           <CardHeader className="bg-card/95 border-b border-border/50 px-4 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6 relative"> {/* Adjusted padding for mobile */}
             {/* Add ThemeToggle to the top right corner */}
             <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"> {/* Adjusted position for mobile */}
                <ThemeToggle />
             </div>
             <div key={`header-${step}`} className="animate-fadeIn duration-400 pr-8 sm:pr-10"> {/* Add padding-right to avoid overlap */}
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground"> {/* Adjusted font size for mobile */}
                     {title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base"> {/* Adjusted font size for mobile */}
                    {description}
                  </CardDescription>
              </div>
           </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-10 bg-background relative overflow-hidden min-h-[280px] sm:min-h-[300px] md:min-h-[350px]"> {/* Adjusted padding and min-height for mobile */}
             <div className={`${animationClass} duration-300`}>
                 {step === 'location' && <LocationStep onSubmit={handleLocationSubmit} />}
                 {step === 'tax' && <TaxAmountStep onSubmit={handleTaxAmountSubmit} isLoading={isLoading} medianTax={estimatedMedianTax} />}
                 {step === 'hourlyWage' && <HourlyWageStep onSubmit={handleHourlyWageSubmit} isLoading={isLoading} />}
                 {step === 'dashboard' && (
                     isLoading || taxAmount === null || taxSpending.length === 0 || !dashboardPerspectives ? (
                         <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center p-6 sm:p-10">Loading your tax breakdown...</div> {/* Adjusted padding for mobile */}
                         </div>
                     ) : (
                         <TaxBreakdownDashboard
                            taxAmount={taxAmount}
                            hourlyWage={hourlyWage} // Pass hourly wage
                            taxSpending={taxSpending}
                            onSelectionChange={handleDashboardSelectionChange} // Pass new handler
                            perspectives={dashboardPerspectives} // Pass pre-calculated perspectives
                         />
                     )
                 )}
             </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-4 sm:mt-6 text-center text-muted-foreground/60 text-[10px] sm:text-xs px-2 sm:px-4 md:px-0 relative pb-16 sm:pb-6"> {/* Adjusted font size and padding for mobile */}
             Powered by publicly available data and community resources. Data is estimated and for informational purposes. Verify with official sources.
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
            onOpenChange={(isOpenModal) => {
                setIsEmailModalOpen(isOpenModal);
                // If modal is closing AND (items were selected OR budget checked), offer suggestions
                if (!isOpenModal && (selectedEmailItems.size > 0 || balanceBudgetChecked)) {
                    // Delay slightly to ensure modal is fully closed before opening another
                    setTimeout(() => handleShowResourceSuggestions(), 150);
                }
            }}
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
            userLocation={userLocationText}
            setUserLocation={setUserLocationText}
        />

        {/* Resource Suggestions Modal */}
        <ResourceSuggestionsModal
            isOpen={isResourceModalOpen}
            onOpenChange={setIsResourceModalOpen}
            suggestedResources={suggestedResources}
            isLoading={isSuggestingResources}
        />
    </main>
  );
}
