
// src/components/dashboard/TaxBreakdownDashboard.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { TaxSpending, TaxSpendingSubItem, SelectedItem } from '@/services/tax-spending';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Import Label

// --- Import ALL potentially used Lucide icons ---
// Consider dynamic imports if bundle size becomes an issue
import {
    ExternalLink, Info, Scale, HeartPulse, ShieldCheck, Briefcase, GraduationCap, Wheat,
    Building, Atom, Globe, Landmark, Sprout, Train, TrendingDown, Crosshair, HelpCircle,
    Megaphone, CheckSquare, AlertTriangle, Clock, DollarSign, Wind, Smile, Music2, Music,
    Coffee, Mail, Newspaper, Footprints, Podcast, BookOpen, SprayCan, Tv, Puzzle, EggFried,
    ShoppingCart, Dumbbell, NotebookPen, Utensils, Users, Tractor, WashingMachine, Dice5,
    Cookie, Film, Clapperboard, HandHeart, Hammer, Trophy, ChefHat, Car, Map, Presentation,
    Plane, Sparkles, PlaneTakeoff, Navigation, Wrench, Youtube, Building2, MapPinned,
    BrainCircuit, Luggage, CalendarDays, HelpingHand, MountainSnow, ClipboardCheck,
    PaintRoller, PenTool, // Add any potentially missing icons here
    type LucideIcon
} from 'lucide-react';
// --- End Lucide Icon Imports ---

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Tooltip as ShadTooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { generateCombinedPerspectiveList, type CombinedPerspective } from '@/lib/time-perspective'; // Import NEW list generation function

interface TaxBreakdownDashboardProps {
  taxAmount: number;
  hourlyWage: number | null; // Added hourly wage prop
  taxSpending: TaxSpending[];
  // Consolidated callback prop
  onSelectionChange: (
    showButton: boolean,
    count: number,
    selectedItems: Map<string, SelectedItem>,
    balanceBudgetChecked: boolean
  ) => void;
}

// Use CSS variables for colors defined in globals.css
const COLORS = [
    'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))',
    'hsl(var(--chart-5))', 'hsl(var(--chart-6))', 'hsl(var(--chart-7))', 'hsl(var(--chart-8))',
    'hsl(var(--chart-9))', 'hsl(var(--chart-10))','hsl(var(--chart-11))','hsl(var(--chart-12))',
    'hsl(var(--chart-13))','hsl(var(--chart-14))','hsl(var(--chart-15))'
];

// Mapping from string names (used in time-perspective.ts) to imported Lucide components
// IMPORTANT: Ensure keys match the 'icon' strings defined in time-perspective.ts
const iconComponents: { [key: string]: LucideIcon } = {
    Wind, Smile, Music2, Music, Coffee, Mail, Newspaper, Footprints, Podcast, BookOpen, SprayCan,
    Tv, Puzzle, EggFried, ShoppingCart, Dumbbell, NotebookPen, Utensils, Users, Tractor, WashingMachine,
    Dice5, Cookie, Film, Clapperboard, HandHeart, Hammer, Trophy, ChefHat, Car, Map, Presentation,
    Plane, Sparkles, PlaneTakeoff, Navigation, Wrench, Youtube, Building2, MapPinned, BrainCircuit,
    Luggage, CalendarDays, HelpingHand, MountainSnow, ClipboardCheck, PaintRoller, PenTool,
    // Add main category icons too
    HeartPulse, Crosshair, TrendingDown, ShieldCheck, Briefcase, GraduationCap, Wheat, Landmark, Building,
    Sprout, Globe, Scale, Train, Atom, HelpCircle
};


const CustomTooltip = ({ active, payload, label, totalAmount, hourlyWage, displayMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const spendingAmount = (data.percentage / 100) * totalAmount;
    const CategoryIcon = iconComponents[data.category] || HelpCircle; // Use lookup

    let displayValue: string;
    let timePerspectiveList: CombinedPerspective[] | null = null;

    if (displayMode === 'time' && hourlyWage) {
        const hoursWorked = spendingAmount / hourlyWage;
        const totalMinutes = hoursWorked * 60;
        displayValue = formatTime(totalMinutes); // Convert hours to minutes for formatting
        timePerspectiveList = generateCombinedPerspectiveList(totalMinutes); // Get perspective LIST
    } else {
        displayValue = formatCurrency(spendingAmount);
    }

    return (
        // TooltipProvider/ShadTooltip moved inside to contain the time perspective logic
        <div className="rounded-lg border bg-popover p-2.5 text-popover-foreground shadow-lg animate-scaleIn text-xs max-w-[180px] sm:max-w-[220px]"> {/* Increased max-width */}
             <div className="flex items-center justify-between mb-1 gap-2">
                 <span className="font-medium flex items-center gap-1.5 truncate">
                    <CategoryIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    {data.category}
                 </span>
                <span className="font-mono text-muted-foreground shrink-0">{data.percentage.toFixed(1)}%</span>
            </div>
             <TooltipProvider delayDuration={150}>
                 <ShadTooltip>
                    <TooltipTrigger asChild>
                         <div className="font-semibold text-sm sm:text-base cursor-default text-left"> {/* Changed alignment */}
                            {displayValue}
                         </div>
                    </TooltipTrigger>
                     {/* Show time perspective tooltip only in time mode and if list exists */}
                     {displayMode === 'time' && timePerspectiveList && timePerspectiveList.length > 0 && (
                        <TooltipContent side="top" align="center" className="max-w-xs text-sm bg-popover border shadow-xl p-4 rounded-lg animate-scaleIn z-50">
                            <p className="text-popover-foreground text-sm font-semibold mb-2">In this time, you could have:</p>
                            <ul className="space-y-1.5 text-popover-foreground/90">
                                {timePerspectiveList.map((item, index) => {
                                    const Icon = item.icon ? iconComponents[item.icon] || Info : Info; // Use Info as fallback
                                    return (
                                        <li key={index} className="flex items-center gap-2 text-xs">
                                            <Icon className="h-3 w-3 text-muted-foreground shrink-0"/>
                                            <span>{item.description}{item.count > 1 ? ` (${item.count} times)` : ''}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </TooltipContent>
                     )}
                </ShadTooltip>
             </TooltipProvider>
        </div>
    );
  }
  return null;
};


const CustomLegend = (props: any) => {
  const { payload } = props;
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    // Attempt to get the chart width for responsive legend items
    // Ensure this runs only client-side
    if (typeof window !== 'undefined') {
        const chartContainer = document.querySelector('.recharts-responsive-container');
        if (chartContainer) {
            setChartWidth(chartContainer.clientWidth);
        }
        // Basic resize listener - consider debouncing for performance
        const handleResize = () => {
            if (chartContainer) {
                setChartWidth(chartContainer.clientWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Determine max width based on chart width - adjust as needed
  const maxItemWidth = chartWidth > 400 ? '150px' : '100px';


  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs mt-4 list-none p-0 max-w-full mx-auto">
      {payload.map((entry: any, index: number) => {
          const percentage = entry.payload?.percentage;
          return (
            <li key={`item-${index}`} className="flex items-center space-x-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <span style={{ backgroundColor: entry.color }} className="h-2 w-2 rounded-full inline-block shrink-0"></span>
              <span className="truncate" style={{ maxWidth: maxItemWidth }}>{entry.value}</span>
              {percentage != null && <span className="font-mono shrink-0">({percentage.toFixed(1)}%)</span>}
            </li>
          );
      })}
    </ul>
  );
};


const SubItemTooltipContent = ({ subItem, amount, hourlyWage, displayMode }: { subItem: TaxSpendingSubItem, amount: number, hourlyWage: number | null, displayMode: 'currency' | 'time' }) => {
    // This tooltip is for the Info icon, not the time perspective itself
    return (
        <TooltipContent side="top" align="center" className="max-w-xs sm:max-w-sm text-sm bg-popover border shadow-xl p-3 rounded-lg animate-scaleIn z-50">
            <p className="font-semibold mb-1.5 text-popover-foreground">{subItem.description}</p>
            {subItem.tooltipText && <p className="text-muted-foreground text-xs leading-relaxed mb-2">{subItem.tooltipText}</p>}
            {subItem.wikiLink && (
                <a
                href={subItem.wikiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-xs font-medium mt-2"
                onClick={(e) => e.stopPropagation()} // Prevent accordion closing
                >
                Learn More <ExternalLink className="h-3 w-3" />
                </a>
            )}
        </TooltipContent>
    );
}


// Helper function to format currency
const formatCurrency = (amount: number | null | undefined): string => {
     if (typeof amount !== 'number' || isNaN(amount)) {
      return '$--.--';
    }
    // Use standard currency formatting
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper function to format time (minutes to hours/minutes)
const formatTime = (totalMinutes: number | null | undefined): string => {
    if (typeof totalMinutes !== 'number' || isNaN(totalMinutes) || totalMinutes < 0) {
        return '--h --m';
    }
    if (totalMinutes < 1) {
        return '< 1 min';
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    let result = '';
    if (hours > 0) {
        result += `${hours}h`;
    }
    if (minutes > 0) {
        if (hours > 0) result += ' ';
        result += `${minutes}m`;
    }
     if (hours === 0 && minutes === 0 && totalMinutes > 0) { // Handle cases between 0 and 1 minute
        return '< 1 min';
    }
    return result.trim();
}



// Helper function to fetch and format national debt
async function getFormattedNationalDebt(): Promise<string> {
    try {
        // Placeholder: Replace with a real API call if available
        // Example using a hypothetical API structure
        // const response = await fetch('https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&limit=1');
        // const data = await response.json();
        // const debtAmount = parseFloat(data.data[0].tot_pub_debt_out_amt);

        // Using a static placeholder value for now
        const debtAmount = 34600000000000; // Approx $34.6 Trillion

        if (isNaN(debtAmount)) {
            return 'currently over $34 trillion';
        }

        // Format the number
        if (debtAmount >= 1e12) {
            return `currently over $${(debtAmount / 1e12).toFixed(1)} trillion`;
        } else if (debtAmount >= 1e9) {
            return `currently over $${(debtAmount / 1e9).toFixed(1)} billion`;
        } else {
            return `currently $${debtAmount.toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching national debt:", error);
        return 'currently over $34 trillion'; // Fallback
    }
}


export default function TaxBreakdownDashboard({
  taxAmount,
  hourlyWage, // Use the hourly wage prop
  taxSpending,
  onSelectionChange, // Use the consolidated prop
}: TaxBreakdownDashboardProps) {

  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [clientDueDate, setClientDueDate] = useState<string | null>(null);
  const [nationalDebt, setNationalDebt] = useState<string>('fetching...');
  const [balanceBudgetChecked, setBalanceBudgetChecked] = useState(false);
  const [displayMode, setDisplayMode] = useState<'currency' | 'time'>('currency'); // State for display mode

   useEffect(() => {
    // These need to run only on the client after hydration
    if (typeof window !== 'undefined') {
        const currentYear = new Date().getFullYear();
        const date = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setClientDueDate(date);

        getFormattedNationalDebt().then(setNationalDebt);
    }
  }, []); // Empty dependency array ensures this runs once on mount

    // Effect to update parent component about selection changes
    useEffect(() => {
        const count = selectedItems.size + (balanceBudgetChecked ? 1 : 0);
        onSelectionChange(count > 0, count, selectedItems, balanceBudgetChecked);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItems, balanceBudgetChecked]); // Removed onSelectionChange from deps to avoid potential loops if parent passes unstable function

   const handleCheckboxChange = (checked: boolean | 'indeterminate', item: TaxSpendingSubItem) => {
        const newSelectedItems = new Map(selectedItems);
        const itemId = `${item.id}`; // Ensure key is string
        if (checked === true) {
            // Add default funding level (e.g., 0: Improve Efficiency) when selected
            newSelectedItems.set(itemId, { id: itemId, description: item.description, fundingLevel: 0, category: item.category }); // Include category
        } else {
            newSelectedItems.delete(itemId);
        }
        setSelectedItems(newSelectedItems);
        // State update will trigger the useEffect to notify parent
    };

    const handleBudgetCheckboxChange = (checked: boolean | 'indeterminate') => {
        setBalanceBudgetChecked(checked === true);
         // State update will trigger the useEffect to notify parent
    }


  // Use client-side date state
   const currentYear = typeof window !== 'undefined' ? new Date().getFullYear() : null; // Get current year for display, client-side only
   const dueDateDisplay = clientDueDate || (currentYear ? `April 15, ${currentYear + 1}` : 'April 15'); // Use calculated due date


  const chartData = taxSpending.map(item => ({
    category: item.category,
    percentage: item.percentage,
  }));

   const handleDisplayModeToggle = (checked: boolean) => {
      setDisplayMode(checked ? 'time' : 'currency');
   };


  return (
    <TooltipProvider> {/* Wrap entire dashboard in TooltipProvider */}
        <div className="space-y-10 animate-fadeIn relative pb-10">
            {/* --- Header --- */}
            <div className="text-center space-y-1 mb-6 relative"> {/* Reduced mb */}
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{currentYear ? `${currentYear} ` : ''}Federal Income Tax Receipt</h1>
                 <p className="text-lg text-muted-foreground">Based on your estimated <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span> payment.</p>
                <p className="text-xs text-muted-foreground/70">Next Filing Due: {dueDateDisplay}</p>

                 {/* --- Display Mode Toggle (only if wage provided) --- */}
                {hourlyWage !== null && (
                    <div className="absolute top-0 right-0 sm:relative sm:flex sm:justify-center sm:items-center sm:mt-4 sm:space-x-2 pt-1 pr-1 sm:pt-0 sm:pr-0">
                        <Label htmlFor="display-mode-toggle" className="text-xs font-medium text-muted-foreground hidden sm:inline">View as:</Label>
                        <div className="flex items-center space-x-2 bg-muted p-1 rounded-full">
                            <Button
                                variant={displayMode === 'currency' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setDisplayMode('currency')}
                                className={cn("rounded-full px-3 py-1 h-7 text-xs", displayMode === 'currency' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-accent')}
                                aria-pressed={displayMode === 'currency'}
                            >
                                <DollarSign className="h-3 w-3 mr-1" /> Currency
                            </Button>
                            <Button
                                 variant={displayMode === 'time' ? 'default' : 'ghost'}
                                 size="sm"
                                 onClick={() => setDisplayMode('time')}
                                 className={cn("rounded-full px-3 py-1 h-7 text-xs", displayMode === 'time' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-accent')}
                                 aria-pressed={displayMode === 'time'}
                            >
                                <Clock className="h-3 w-3 mr-1" /> Time Worked
                            </Button>
                        </div>
                    </div>
                )}
             </div>


           {/* --- Direct Activism Plea --- */}
            <Alert className="mb-8 shadow-sm rounded-lg border border-primary/20 bg-primary/5 text-foreground animate-fadeIn delay-500 duration-3000">
                 <Megaphone className="h-5 w-5 mt-0.5 stroke-primary" />
                <AlertTitle className="font-semibold text-primary">Make Your Voice Heard!</AlertTitle>
                <AlertDescription className="text-sm text-foreground/90 space-y-1.5">
                    Understanding where your money goes is the first step. The next is action.
                    <span className="block">Your elected officials work for you. Let them know how you feel about these spending priorities. Select specific items below that concern you and use the button to draft a direct message.</span>
                     <Button variant="link" className="p-0 h-auto ml-0 text-primary font-medium text-sm mt-1" onClick={() => {if (typeof window !== 'undefined') window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer')}}>
                        Find Your Officials <ExternalLink className="inline ml-1 h-3 w-3" />
                    </Button>
                </AlertDescription>
            </Alert>


          {/* --- Chart Section --- */}
          <div className="mb-12">
             <h2 className="text-xl font-semibold text-center mb-4">Spending Overview</h2>
             <TooltipProvider delayDuration={150}>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 100} // Conditional radius client-side
                        innerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 65} // Conditional radius client-side
                        fill="#8884d8"
                        paddingAngle={1}
                        dataKey="percentage"
                        nameKey="category"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={'hsl(var(--background))'} strokeWidth={1} />
                        ))}
                      </Pie>
                       <Tooltip content={<CustomTooltip totalAmount={taxAmount} hourlyWage={hourlyWage} displayMode={displayMode} />} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.4 }} />
                       <Legend content={<CustomLegend />} wrapperStyle={{ maxWidth: '100%', overflow: 'hidden' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </TooltipProvider>
                 <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1 px-2">
                    <Info className="h-3 w-3" /> Hover over segments for details. Estimated data.
                 </p>
          </div>


          {/* --- Detailed Breakdown Card --- */}
           <Card className="shadow-lg border border-border/60 rounded-xl overflow-hidden bg-gradient-to-b from-card to-card/95">
                <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border/50">
                    <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight">Detailed Spending</CardTitle>
                    <CardDescription className="text-muted-foreground text-xs sm:text-sm">Select items you believe need funding adjustments or prioritize balancing the budget.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Removed redundant TooltipProvider, using the one wrapping the whole dashboard */}
                     <Accordion type="multiple" className="w-full">
                        {taxSpending.map((item, index) => {
                            const categoryAmount = (item.percentage / 100) * taxAmount;
                            const CategoryIcon = iconComponents[item.category] || DefaultIcon; // Use lookup
                            const isInterestOnDebt = item.category === 'Interest on Debt';
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            let categoryDisplayValue: string;
                            let categoryTimePerspectiveList: CombinedPerspective[] | null = null; // Added for category tooltip
                            if (displayMode === 'time' && hourlyWage) {
                                const hoursWorked = categoryAmount / hourlyWage;
                                const totalMinutes = hoursWorked * 60;
                                categoryDisplayValue = formatTime(totalMinutes);
                                categoryTimePerspectiveList = generateCombinedPerspectiveList(totalMinutes); // Get time perspective for category
                            } else {
                                categoryDisplayValue = formatCurrency(categoryAmount);
                            }

                            return (
                                 <AccordionItem value={`item-${index}`} key={item.id || index} className="border-b border-border/40 last:border-b-0 group">
                                    <AccordionTrigger className="hover:no-underline py-3 px-3 sm:px-4 rounded-none hover:bg-accent/50 data-[state=open]:bg-accent/40 transition-colors duration-150 text-left">
                                         <div className="flex justify-between items-center w-full gap-2 sm:gap-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <CategoryIcon className="h-4 w-4 text-primary shrink-0" />
                                                <span className="font-medium text-sm truncate flex-1">{item.category}</span>
                                            </div>
                                            <div className="text-right shrink-0 flex items-baseline gap-1 ml-auto">
                                                <ShadTooltip>
                                                    <TooltipTrigger asChild>
                                                        {/* Wrap the display value span in the trigger */}
                                                        <span className="font-semibold font-mono text-sm cursor-default">{categoryDisplayValue}</span>
                                                    </TooltipTrigger>
                                                    {/* Category Time Perspective Tooltip */}
                                                     {displayMode === 'time' && categoryTimePerspectiveList && categoryTimePerspectiveList.length > 0 && (
                                                        <TooltipContent side="top" align="end" className="max-w-xs text-sm bg-popover border shadow-xl p-4 rounded-lg animate-scaleIn z-50">
                                                            <p className="text-popover-foreground text-sm font-semibold mb-2">In this time, you could have:</p>
                                                            <ul className="space-y-1.5 text-popover-foreground/90">
                                                                {categoryTimePerspectiveList.map((pItem, pIndex) => {
                                                                    const PIcon = pItem.icon ? iconComponents[pItem.icon] || Info : Info;
                                                                    return (
                                                                        <li key={pIndex} className="flex items-center gap-2 text-xs">
                                                                            <PIcon className="h-3 w-3 text-muted-foreground shrink-0"/>
                                                                            <span>{pItem.description}{pItem.count > 1 ? ` (${pItem.count} times)` : ''}</span>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </TooltipContent>
                                                     )}
                                                </ShadTooltip>
                                                <span className="text-muted-foreground text-xs font-mono hidden sm:inline">({item.percentage.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent
                                        className="bg-background/30 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden"
                                    >
                                        <div className="pl-8 pr-3 sm:pl-10 sm:pr-4 pt-3 pb-4 text-muted-foreground space-y-2.5">
                                         {isInterestOnDebt ? (
                                             <Alert variant="destructive" className="bg-destructive/5 border-destructive/30 shadow-inner">
                                                  <AlertTriangle className="h-5 w-5 stroke-destructive/80 mt-1" />
                                                  <AlertTitle className="text-destructive/95 font-semibold mb-1">National Debt Burden: {nationalDebt}</AlertTitle>
                                                 <AlertDescription className="text-sm text-destructive/90 dark:text-destructive/80 leading-relaxed space-y-2">
                                                     <p>This staggering amount paid just on <strong className="font-medium">interest</strong> is a direct consequence of sustained government spending exceeding revenue—often driven by tax cuts favoring the wealthy, unfunded wars, and economic bailouts.</p>
                                                     <p>High interest payments <strong className="font-medium">divert critical funds</strong> from essential public services, infrastructure, education, and potential tax relief, raising serious questions about long-term fiscal stability and government accountability.</p>
                                                     <div className="flex items-center space-x-2 pt-3">
                                                          <Checkbox
                                                            id="balance-budget"
                                                            checked={balanceBudgetChecked}
                                                            onCheckedChange={handleBudgetCheckboxChange}
                                                            aria-label="Prioritize Balancing the Budget"
                                                            className="rounded-[4px] border-destructive/70 data-[state=checked]:bg-destructive/80 data-[state=checked]:border-destructive/80"
                                                          />
                                                         <Label htmlFor="balance-budget" className="text-xs font-medium text-destructive/95 dark:text-destructive/85 cursor-pointer">
                                                            Prioritize Balancing the Budget & Reducing Debt
                                                         </Label>
                                                      </div>
                                                 </AlertDescription>
                                             </Alert>
                                         ) : hasSubItems ? (
                                            <ul className="space-y-2">
                                                {item.subItems!.map((subItem) => {
                                                    const subItemAmount = subItem.amountPerDollar * taxAmount;
                                                    const isSelected = selectedItems.has(subItem.id);

                                                    let subItemDisplayValue: string;
                                                    let subItemTimePerspectiveList: CombinedPerspective[] | null = null; // Changed to list
                                                    if (displayMode === 'time' && hourlyWage) {
                                                        const hoursWorked = subItemAmount / hourlyWage;
                                                        const totalMinutes = hoursWorked * 60;
                                                        subItemDisplayValue = formatTime(totalMinutes);
                                                        subItemTimePerspectiveList = generateCombinedPerspectiveList(totalMinutes); // Get perspective list for subitem
                                                    } else {
                                                        subItemDisplayValue = formatCurrency(subItemAmount);
                                                    }


                                                    return (
                                                         <li key={subItem.id} className="flex justify-between items-center text-xs gap-2 group/subitem">
                                                             <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                <Checkbox
                                                                   id={`subitem-${item.id}-${subItem.id}`}
                                                                   checked={isSelected}
                                                                   onCheckedChange={(checked) => handleCheckboxChange(checked, subItem)}
                                                                   aria-label={`Select ${subItem.description}`}
                                                                   className="mt-0 shrink-0 rounded-[4px]" // Slightly rounder checkbox
                                                                />
                                                               <ShadTooltip>
                                                                    <TooltipTrigger asChild>
                                                                        {/* Tooltip triggered by Info icon OR description if no icons */}
                                                                         <label
                                                                            htmlFor={`subitem-${item.id}-${subItem.id}`}
                                                                            className={cn(
                                                                                "truncate cursor-pointer hover:text-foreground transition-colors flex items-center gap-1 flex-1",
                                                                                isSelected ? "text-foreground font-medium" : ""
                                                                            )}
                                                                         >
                                                                            {subItem.description}
                                                                            {/* Show info icon if wiki/tooltip exists */}
                                                                            {(subItem.tooltipText || subItem.wikiLink) && <Info className="h-3 w-3 opacity-40 group-hover/subitem:opacity-100 transition-opacity shrink-0"/>}
                                                                        </label>
                                                                    </TooltipTrigger>
                                                                    {/* Tooltip Content for Description/Wiki */}
                                                                    {(subItem.tooltipText || subItem.wikiLink) && (
                                                                         <SubItemTooltipContent
                                                                             subItem={subItem}
                                                                             amount={subItemAmount}
                                                                             hourlyWage={hourlyWage}
                                                                             displayMode={displayMode} // Pass mode for potential future use
                                                                         />
                                                                    )}
                                                                </ShadTooltip>
                                                             </div>
                                                            {/* --- Value Span with Time Perspective Tooltip --- */}
                                                            <ShadTooltip>
                                                                <TooltipTrigger asChild>
                                                                     <span className="font-medium font-mono text-foreground/80 whitespace-nowrap cursor-default">
                                                                        {subItemDisplayValue}
                                                                     </span>
                                                                </TooltipTrigger>
                                                                {/* SubItem Time Perspective Tooltip */}
                                                                 {displayMode === 'time' && subItemTimePerspectiveList && subItemTimePerspectiveList.length > 0 && (
                                                                    <TooltipContent side="top" align="end" className="max-w-xs text-sm bg-popover border shadow-xl p-4 rounded-lg animate-scaleIn z-50">
                                                                          <p className="text-popover-foreground text-sm font-semibold mb-2">In this time, you could have:</p>
                                                                          <ul className="space-y-1.5 text-popover-foreground/90">
                                                                            {subItemTimePerspectiveList.map((pItem, pIndex) => {
                                                                                 const PIcon = pItem.icon ? iconComponents[pItem.icon] || Info : Info;
                                                                                 return (
                                                                                    <li key={pIndex} className="flex items-center gap-2 text-xs">
                                                                                        <PIcon className="h-3 w-3 text-muted-foreground shrink-0"/>
                                                                                         <span>{pItem.description}{pItem.count > 1 ? ` (${pItem.count} times)` : ''}</span>
                                                                                     </li>
                                                                                );
                                                                             })}
                                                                         </ul>
                                                                     </TooltipContent>
                                                                )}
                                                            </ShadTooltip>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <p className="text-xs italic text-center py-2">No detailed breakdown available.</p>
                                        )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                     </Accordion>
                     {/* --- Total Row --- */}
                     <div className="flex justify-between items-center w-full px-3 sm:px-4 py-3 sm:py-4 border-t-2 border-primary/50 bg-primary/5">
                         <span className="font-bold text-sm sm:text-base text-primary tracking-tight">TOTAL ESTIMATED TAX</span>
                          <ShadTooltip>
                             <TooltipTrigger asChild>
                                 <span className="font-bold font-mono text-sm sm:text-base text-primary cursor-default">
                                   {displayMode === 'time' && hourlyWage
                                       ? formatTime((taxAmount / hourlyWage) * 60)
                                       : formatCurrency(taxAmount)
                                   }
                                 </span>
                             </TooltipTrigger>
                              {/* Total Time Perspective Tooltip */}
                             {displayMode === 'time' && hourlyWage && (() => { // Use IIFE to avoid variable scope issues
                                const totalMinutes = (taxAmount / hourlyWage) * 60;
                                const perspectiveList = generateCombinedPerspectiveList(totalMinutes);
                                return perspectiveList && perspectiveList.length > 0 && (
                                    <TooltipContent side="top" align="end" className="max-w-xs text-sm bg-popover border shadow-xl p-4 rounded-lg animate-scaleIn z-50">
                                        <p className="text-popover-foreground text-sm font-semibold mb-2">In this total time, you could have:</p>
                                        <ul className="space-y-1.5 text-popover-foreground/90">
                                            {perspectiveList.map((pItem, pIndex) => {
                                                const PIcon = pItem.icon ? iconComponents[pItem.icon] || Info : Info;
                                                return (
                                                    <li key={pIndex} className="flex items-center gap-2 text-xs">
                                                        <PIcon className="h-3 w-3 text-muted-foreground shrink-0"/>
                                                        <span>{pItem.description}{pItem.count > 1 ? ` (${pItem.count} times)` : ''}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </TooltipContent>
                                );
                             })()}
                          </ShadTooltip>
                     </div>
                </CardContent>
            </Card>

        </div>
    </TooltipProvider>
  );
}


    