// src/app/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import type { Location, TaxSpending, SelectedItem } from '@/services/tax-spending';
import { getTaxSpending } from '@/services/tax-spending';
import { guessStateFromZip, getAverageTaxForState } from '@/lib/zip-to-state';
import { mapFundingLevelToSlider } from '@/lib/funding-utils';
import { toneBucket } from '@/services/email/utils';

import LocationStep from '@/components/onboarding/LocationStep';
import TaxAmountStep from '@/components/onboarding/TaxAmountStep';
import HourlyWageStep from '@/components/onboarding/HourlyWageStep';
import TaxBreakdownDashboard from '@/components/dashboard/TaxBreakdownDashboard';
import FloatingEmailButton from '@/components/dashboard/FloatingEmailButton';
import EmailCustomizationModal from '@/components/dashboard/EmailCustomizationModal';
import ResourceSuggestionsModal from '@/components/dashboard/ResourceSuggestionsModal';
import EnterHourlyWageModal from '@/components/dashboard/EnterHourlyWageModal';
import type { SuggestedResource } from '@/types/resource-suggestions';
import { suggestResources } from '@/services/resource-suggestions';
import { RESOURCE_DATABASE } from '@/lib/resource-suggestion-logic'; // For preloading icons
import { importLucideIcon } from '@/lib/icon-utils'; // Icon loading utility


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import type { DashboardPerspectives } from '@/types/perspective';
import { generateCurrencyPerspectiveList } from '@/lib/currency-perspective';
import { generateCombinedPerspectiveList } from '@/lib/time-perspective';


type AppStep = 'location' | 'tax' | 'hourlyWage' | 'dashboard';

const NATIONAL_MEDIAN_FEDERAL_TAX = 17766;
const DEFAULT_LOCATION: Location = { lat: 40.7128, lng: -74.0060 };
const DEFAULT_STATE = 'NY';


export default function Home() {
  const [step, setStep] = useState<AppStep>('location');
  const [prevStep, setPrevStep] = useState<AppStep | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [taxAmount, setTaxAmount] = useState<number | null>(null);
  const [hourlyWage, setHourlyWage] = useState<number | null>(null);
  const [taxSpending, setTaxSpending] = useState<TaxSpending[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [animationClass, setAnimationClass] = useState('animate-slideInUp');

  const [showEmailAction, setShowEmailAction] = useState(false);
  const [emailActionCount, setEmailActionCount] = useState(0);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailItems, setSelectedEmailItems] = useState<Map<string, SelectedItem>>(new Map());
  const [balanceBudgetChecked, setBalanceBudgetChecked] = useState(false);

  const [aggressiveness, setAggressiveness] = useState(50);
  const [itemFundingLevels, setItemFundingLevels] = useState<Map<string, number>>(new Map());
  const [userName, setUserName] = useState('');
  const [userLocationText, setUserLocationText] = useState('');

  const [estimatedMedianTax, setEstimatedMedianTax] = useState(NATIONAL_MEDIAN_FEDERAL_TAX);

  const [suggestedResources, setSuggestedResources] = useState<SuggestedResource[]>([]);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isSuggestingResources, setIsSuggestingResources] = useState(false);


  const [dashboardPerspectives, setDashboardPerspectives] = useState<DashboardPerspectives | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const [isEnterHourlyWageModalOpen, setIsEnterHourlyWageModalOpen] = useState(false);
  const [shouldAutoSwitchToTimeMode, setShouldAutoSwitchToTimeMode] = useState(false);


  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);

      // Preload icons for ResourceSuggestionsModal
      const preloadResourceIcons = async () => {
        const iconsToLoad = new Set<string>();
        RESOURCE_DATABASE.forEach(resource => {
          if (resource.icon) {
            iconsToLoad.add(resource.icon);
          }
        });
        // Add any other default icons if necessary from ResourceSuggestionsModal
        // For now, just preloading icons from the database
        for (const iconName of iconsToLoad) {
          try {
            await importLucideIcon(iconName);
          } catch (e) {
            // console.warn(`Preload failed for icon ${iconName}:`, e);
          }
        }
      };
      preloadResourceIcons();

      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);


  useEffect(() => {
     setItemFundingLevels(new Map(
       Array.from(selectedEmailItems.entries()).map(([id, item]) => [
         id,
         itemFundingLevels.get(id) ?? mapFundingLevelToSlider(item.fundingLevel)
       ])
     ));
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedEmailItems]);


  const navigateToStep = useCallback((nextStep: AppStep) => {
    const stepOrder: AppStep[] = ['location', 'tax', 'hourlyWage', 'dashboard'];
    const currentStepIndex = stepOrder.indexOf(step);
    const nextStepIndex = stepOrder.indexOf(nextStep);
    const isGoingBack = nextStepIndex < currentStepIndex;

    setAnimationClass(isGoingBack ? 'animate-slideOutUp' : 'animate-slideOutUp');

    if (step === 'dashboard' && nextStep !== 'dashboard') {
       setShowEmailAction(false);
       setEmailActionCount(0);
       setSelectedEmailItems(new Map());
       setBalanceBudgetChecked(false);
       setIsEmailModalOpen(false);
       setAggressiveness(50);
       setItemFundingLevels(new Map());
       setUserName('');
       setUserLocationText('');
       setSuggestedResources([]);
       setIsResourceModalOpen(false);
       setDashboardPerspectives(null);
       if (nextStep !== 'hourlyWage') {
         setHourlyWage(null);
       }
    }
     if (step === 'hourlyWage' && isGoingBack) {
        setHourlyWage(null);
     }
     if (step === 'tax' && isGoingBack) {
         setLocation(null);
         setEstimatedMedianTax(NATIONAL_MEDIAN_FEDERAL_TAX);
     }


    setTimeout(() => {
      setPrevStep(step);
      setStep(nextStep);
      setAnimationClass(isGoingBack ? 'animate-slideInDown' : 'animate-slideInUp');
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isMobileView]); // Added isMobileView as it affects perspective calculation later

  const generatePerspectives = useCallback((currentTaxAmount: number, currentHourlyWage: number | null, currentTaxSpending: TaxSpending[]) => {
    const maxPerspectiveItems = isMobileView ? 3 : 5;
    const newChartPerspectives: DashboardPerspectives['chart'] = {};
    currentTaxSpending.forEach(item => {
        const spendingAmount = (item.percentage / 100) * currentTaxAmount;
        newChartPerspectives[item.category] = {
            currency: generateCurrencyPerspectiveList(spendingAmount, maxPerspectiveItems),
            time: currentHourlyWage ? generateCombinedPerspectiveList((spendingAmount / currentHourlyWage) * 60, maxPerspectiveItems) : null,
        };
    });

    const newAccordionPerspectives: DashboardPerspectives['accordion'] = {};
    currentTaxSpending.forEach(category => {
        const categoryAmount = (category.percentage / 100) * currentTaxAmount;
        newAccordionPerspectives[category.id || category.category] = {
            currency: generateCurrencyPerspectiveList(categoryAmount, maxPerspectiveItems + 2),
            time: currentHourlyWage ? generateCombinedPerspectiveList((categoryAmount / currentHourlyWage) * 60, maxPerspectiveItems + 2) : null,
        };
        category.subItems?.forEach(subItem => {
            const subItemAmount = subItem.amountPerDollar * currentTaxAmount;
             newAccordionPerspectives[subItem.id] = {
                currency: generateCurrencyPerspectiveList(subItemAmount, maxPerspectiveItems),
                time: currentHourlyWage ? generateCombinedPerspectiveList((subItemAmount / currentHourlyWage) * 60, maxPerspectiveItems) : null,
            };
        });
    });

    const newTotalPerspectiveData: DashboardPerspectives['total'] = {
        currency: generateCurrencyPerspectiveList(currentTaxAmount, maxPerspectiveItems + 2),
        time: currentHourlyWage ? generateCombinedPerspectiveList((currentTaxAmount / currentHourlyWage) * 60, maxPerspectiveItems + 2) : null,
    };

    setDashboardPerspectives({
        chart: newChartPerspectives,
        accordion: newAccordionPerspectives,
        total: newTotalPerspectiveData,
    });
  }, [isMobileView]);


  const handleLocationSubmit = useCallback((loc: Location | null, zipCode?: string) => {
    const finalLocation = loc ?? DEFAULT_LOCATION;
    setLocation(finalLocation);

    const stateAbbr = zipCode ? guessStateFromZip(zipCode) : (loc ? null : DEFAULT_STATE);
    const medianForState = getAverageTaxForState(stateAbbr);
    setEstimatedMedianTax(medianForState);

    toast({
        title: 'Location Set',
        description: loc ? (zipCode ? `Using location for ${zipCode}.` : 'Using current location.') : `Using default location (New York Area). Estimated median tax for this area: $${medianForState.toLocaleString()}.`,
    });
    navigateToStep('tax');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, navigateToStep]);

  const handleTaxAmountSubmit = useCallback((amount: number | null) => {
    const finalAmount = amount ?? estimatedMedianTax;
    setTaxAmount(finalAmount);
    navigateToStep('hourlyWage');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimatedMedianTax, navigateToStep]);

   const handleHourlyWageSubmit = useCallback(async (wage: number | null) => {
     setIsLoading(true);
     setHourlyWage(wage);

     const finalTaxAmount = taxAmount ?? estimatedMedianTax;
     const currentLocation = location ?? DEFAULT_LOCATION;

     toast({
          title: wage ? 'Hourly Wage Set' : 'Hourly Wage Skipped',
          description: wage ? `Calculating breakdown based on $${wage.toFixed(2)}/hour.` : 'Time perspective feature will be disabled. You can enable it later.',
     });

     try {
       // Simulate loading for smoother transition if API call is very fast
       // For actual fast APIs, this might not be needed or could be shorter
       await new Promise(resolve => setTimeout(resolve, 100));
       const spendingData = await getTaxSpending(currentLocation, finalTaxAmount);
       setTaxSpending(spendingData);
       generatePerspectives(finalTaxAmount, wage, spendingData);
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
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [taxAmount, estimatedMedianTax, location, toast, navigateToStep, generatePerspectives]);

  const handleHourlyWageSubmitFromModal = useCallback((wage: number) => {
    setHourlyWage(wage);
    setIsLoading(true);
    setShouldAutoSwitchToTimeMode(true); // Flag to auto-switch to time mode
    toast({
        title: 'Hourly Wage Set',
        description: `Recalculating time perspectives based on $${wage.toFixed(2)}/hour. View switched to Time Worked.`,
    });
    if (taxAmount && taxSpending.length > 0) {
        generatePerspectives(taxAmount, wage, taxSpending);
    }
    setIsEnterHourlyWageModalOpen(false);
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxAmount, taxSpending, toast, generatePerspectives]);


  const handleBack = useCallback(() => {
     if (step === 'tax') {
       navigateToStep('location');
     } else if (step === 'hourlyWage') {
       navigateToStep('tax');
     } else if (step === 'dashboard') {
       navigateToStep('hourlyWage');
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, navigateToStep]);


  const getTitleAndDescription = useCallback(() => {
    switch (step) {
        case 'location': return {
            title: 'Find Your Tax Breakdown',
            description: 'Enter your location (e.g., zip code) or skip to use a default.'
        };
        case 'tax': return {
            title: 'Estimate Your Contribution',
             description: `Enter your estimated federal income tax paid last year, or skip to use the estimated median for your area ($${estimatedMedianTax.toLocaleString()}).`
        };
         case 'hourlyWage': return {
            title: 'Time Perspective (Optional)',
            description: 'Enter your approximate hourly wage to see spending in terms of work time. This helps visualize the impact of tax spending in a new way. You can skip this step.'
         };
        case 'dashboard': return {
             title: 'Your Personalized Tax Receipt',
             description: `See how your estimated ${taxAmount ? '$'+taxAmount.toLocaleString() : `median ($${estimatedMedianTax.toLocaleString()}) tax`} payment might be allocated.`
        };
        default: return {
            title: 'My Tax Receipt .org',
            description: 'Understand your federal tax spending & take action.'
        };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, estimatedMedianTax, taxAmount]);

  const { title, description } = getTitleAndDescription();

  const handleDashboardSelectionChange = useCallback((
      showButton: boolean,
      count: number,
      selected: Map<string, SelectedItem>,
      budgetPref: boolean
    ) => {
    setShowEmailAction(showButton);
    setEmailActionCount(count);
    setSelectedEmailItems(selected);
    setBalanceBudgetChecked(budgetPref);

     if (count === 0) {
        setAggressiveness(50);
        setUserName('');
        setUserLocationText('');
     }
  }, []);

  const handleOpenEmailModal = useCallback(() => {
     const itemsForModal = new Map<string, SelectedItem>();
     selectedEmailItems.forEach((item, key) => {
         itemsForModal.set(key, { ...item });
     });

     setItemFundingLevels(new Map(
       Array.from(itemsForModal.entries()).map(([id, item]) => [
         id,
         itemFundingLevels.get(id) ?? mapFundingLevelToSlider(item.fundingLevel)
       ])
     ));
     setSelectedEmailItems(itemsForModal);
     setIsEmailModalOpen(true);
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedEmailItems, itemFundingLevels]);

  const hasConcernsForSuggestions = selectedEmailItems.size > 0 || balanceBudgetChecked;

  const handleShowResourceSuggestions = useCallback(async () => {
    if (!hasConcernsForSuggestions) {
        toast({
            title: "No Concerns Selected",
            description: "To receive tailored suggestions for further action, please first select some spending items that concern you or indicate your preference for balancing the budget. You can do this on the main dashboard by checking the boxes next to specific programs.",
            variant: "default",
            duration: 7000
        });
        return;
    }

    setIsSuggestingResources(true);
    try {
        const itemsArrayForSuggestions: SelectedItem[] = Array.from(selectedEmailItems.values())
            .map(item => ({
                id: item.id,
                description: item.description,
                fundingLevel: item.fundingLevel,
                category: item.category,
            }));

        const suggestions = await suggestResources(itemsArrayForSuggestions, aggressiveness, balanceBudgetChecked);
        setSuggestedResources(suggestions);
        if (suggestions.length > 0) {
            setIsEmailModalOpen(false);
            setIsResourceModalOpen(true);
        } else {
            toast({
                title: "No Specific Suggestions Found",
                description: "While we couldn't pinpoint organizations for your exact combination of concerns right now, remember that contacting your representatives directly with the email you've generated is a powerful way to make your voice heard. You can also research broader advocacy groups related to your general interests.",
                variant: "default",
                duration: 9000
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasConcernsForSuggestions, selectedEmailItems, aggressiveness, balanceBudgetChecked, toast]);

  const handleEmailGenerated = useCallback(() => {
    setIsEmailModalOpen(false);
    if (hasConcernsForSuggestions) {
        setTimeout(() => {
            handleShowResourceSuggestions();
        }, 300);
    }
  }, [hasConcernsForSuggestions, handleShowResourceSuggestions]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-2 sm:p-4 md:p-8 bg-gradient-to-br from-background via-secondary/5 to-background relative">
       <div className={`w-full ${step === 'dashboard' ? 'max-w-full md:max-w-4xl lg:max-w-5xl' : 'max-w-full sm:max-w-md md:max-w-2xl'} mx-auto space-y-1 sm:space-y-2 transition-all duration-300 ease-in-out z-10`}>
        <div className="flex justify-start items-center min-h-[36px] sm:min-h-[40px] px-1 sm:px-0">
            {step !== 'location' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 self-center opacity-80 hover:opacity-100 text-xs sm:text-sm"
                aria-label="Go back"
              >
                <ArrowLeft className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back
              </Button>
            ) : <div />}
        </div>

        <Card className="w-full shadow-xl rounded-lg sm:rounded-xl border border-border/50 overflow-hidden bg-card">
           <CardHeader className="bg-card/95 border-b border-border/50 px-3 py-2 sm:px-6 sm:py-5 md:px-8 md:py-6 relative">
             <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                <ThemeToggle />
             </div>
             <div key={`header-${step}`} className="animate-fadeIn duration-400 pr-8 sm:pr-10">
                  <CardTitle className="text-lg sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                     {title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base">
                    {description}
                  </CardDescription>
              </div>
           </CardHeader>
          <CardContent className="p-3 sm:p-6 md:p-10 bg-background relative overflow-hidden min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
             <div className={`${animationClass} duration-300`}>
                 {step === 'location' && <LocationStep onSubmit={handleLocationSubmit} />}
                 {step === 'tax' && <TaxAmountStep onSubmit={handleTaxAmountSubmit} isLoading={isLoading} medianTax={estimatedMedianTax} />}
                 {step === 'hourlyWage' && <HourlyWageStep onSubmit={handleHourlyWageSubmit} isLoading={isLoading} />}
                 {step === 'dashboard' && (
                     isLoading || taxAmount === null || taxSpending.length === 0 || !dashboardPerspectives ? (
                         <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center p-6 sm:p-10">Loading your tax breakdown...</div>
                         </div>
                     ) : (
                         <TaxBreakdownDashboard
                            taxAmount={taxAmount}
                            hourlyWage={hourlyWage}
                            taxSpending={taxSpending}
                            onSelectionChange={handleDashboardSelectionChange}
                            perspectives={dashboardPerspectives}
                            onOpenEnterHourlyWageModal={() => setIsEnterHourlyWageModalOpen(true)}
                            shouldAutoSwitchToTimeMode={shouldAutoSwitchToTimeMode}
                            onAutoSwitchToTimeMode={() => setShouldAutoSwitchToTimeMode(false)}
                         />
                     )
                 )}
             </div>
          </CardContent>
        </Card>


        <footer className="mt-4 sm:mt-6 text-center text-muted-foreground/60 text-[10px] sm:text-xs px-2 sm:px-4 md:px-0 relative pb-16 sm:pb-6">
             Powered by publicly available data and community resources. Data is estimated and for informational purposes. Verify with official sources.
        </footer>
       </div>

       <FloatingEmailButton
            isVisible={showEmailAction && step === 'dashboard'}
            count={emailActionCount}
            onClick={handleOpenEmailModal}
       />

       <EmailCustomizationModal
            isOpen={isEmailModalOpen}
            onOpenChange={setIsEmailModalOpen}
            onEmailGenerated={handleEmailGenerated}
            onSuggestResources={handleShowResourceSuggestions}
            canSuggestResources={hasConcernsForSuggestions}
            selectedItems={selectedEmailItems}
            balanceBudgetChecked={balanceBudgetChecked}
            taxAmount={taxAmount ?? estimatedMedianTax}
            aggressiveness={aggressiveness}
            setAggressiveness={setAggressiveness}
            itemFundingLevels={itemFundingLevels}
            setItemFundingLevels={setItemFundingLevels}
            userName={userName}
            setUserName={setUserName}
            userLocation={userLocationText}
            setUserLocation={setUserLocationText}
        />

        <ResourceSuggestionsModal
            isOpen={isResourceModalOpen}
            onOpenChange={setIsResourceModalOpen}
            suggestedResources={suggestedResources}
            isLoading={isSuggestingResources}
            selectedItems={selectedEmailItems}
            balanceBudgetChecked={balanceBudgetChecked}
            userTone={toneBucket(aggressiveness)}
            hasUserConcerns={hasConcernsForSuggestions}
        />

        <EnterHourlyWageModal
            isOpen={isEnterHourlyWageModalOpen}
            onOpenChange={setIsEnterHourlyWageModalOpen}
            onSubmit={handleHourlyWageSubmitFromModal}
        />
    </main>
  );
}
