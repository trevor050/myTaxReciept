
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { TaxSpending, TaxSpendingSubItem, SelectedItem } from '@/services/tax-spending';
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives'; // Keep type for prop definition, even if unused
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import EmailCustomizationModal from '@/components/dashboard/EmailCustomizationModal'; // Keep this import

import {
    ExternalLink,
    Info,
    Mail,
    Scale,
    HeartPulse,
    ShieldCheck,
    Briefcase,
    GraduationCap,
    Wheat,
    Building,
    Atom,
    Globe,
    Landmark,
    Sprout,
    Train,
    TrendingDown,
    Crosshair,
    HelpCircle,
    Megaphone, // Icon for activism plea
    CheckSquare, // Icon for budget balance checkbox
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label'; // Import Label

interface TaxBreakdownDashboardProps {
  taxAmount: number;
  taxSpending: TaxSpending[];
  representativeSuggestion: SuggestRepresentativesOutput | null; // Kept for type safety, but unused
}

// Use CSS variables for colors defined in globals.css
const COLORS = [
    'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))',
    'hsl(var(--chart-5))', 'hsl(var(--chart-6))', 'hsl(var(--chart-7))', 'hsl(var(--chart-8))',
    'hsl(var(--chart-9))', 'hsl(var(--chart-10))','hsl(var(--chart-11))','hsl(var(--chart-12))',
    'hsl(var(--chart-13))','hsl(var(--chart-14))','hsl(var(--chart-15))'
];

const categoryIcons: { [key: string]: React.ElementType } = {
    'Health': HeartPulse,
    'War and Weapons': Crosshair,
    'Interest on Debt': TrendingDown,
    'Veterans': ShieldCheck,
    'Unemployment and Labor': Briefcase,
    'Education': GraduationCap,
    'Food and Agriculture': Wheat,
    'Government': Landmark,
    'Housing and Community': Building,
    'Energy and Environment': Sprout,
    'International Affairs': Globe,
    'Law Enforcement': Scale,
    'Transportation': Train,
    'Science': Atom,
};
const DefaultIcon = HelpCircle;


const CustomTooltip = ({ active, payload, label, totalAmount }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const spendingAmount = (data.percentage / 100) * totalAmount;
    const Icon = categoryIcons[data.category] || DefaultIcon;

    return (
        <div className="rounded-lg border bg-popover p-2.5 text-popover-foreground shadow-lg animate-scaleIn text-xs max-w-[150px] sm:max-w-[200px]">
             <div className="flex items-center justify-between mb-1 gap-2">
                 <span className="font-medium flex items-center gap-1.5 truncate">
                    <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                    {data.category}
                 </span>
                <span className="font-mono text-muted-foreground shrink-0">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="font-semibold text-sm">
                {formatCurrency(spendingAmount)} {/* Use helper function */}
            </div>
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


const SubItemTooltipContent = ({ subItem }: { subItem: TaxSpendingSubItem }) => (
    <TooltipContent side="top" align="center" className="max-w-xs sm:max-w-sm text-sm bg-popover border shadow-xl p-3 rounded-lg animate-scaleIn">
      <p className="font-semibold mb-1.5 text-popover-foreground">{subItem.description}</p>
      {subItem.tooltipText && <p className="text-muted-foreground text-xs leading-relaxed mb-2">{subItem.tooltipText}</p>}
      {subItem.wikiLink && (
        <a
          href={subItem.wikiLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1 text-xs font-medium"
          onClick={(e) => e.stopPropagation()} // Prevent accordion closing
        >
          Learn More <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </TooltipContent>
);

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined) => {
     if (typeof amount !== 'number' || isNaN(amount)) {
      return '$--.--';
    }
    // Use standard currency formatting
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  taxSpending,
  representativeSuggestion, // Kept for prop type, but unused
}: TaxBreakdownDashboardProps) {

  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientDueDate, setClientDueDate] = useState<string | null>(null);
  const [nationalDebt, setNationalDebt] = useState<string>('fetching...');
  const [balanceBudgetChecked, setBalanceBudgetChecked] = useState(false);
  const { toast } = useToast();

   useEffect(() => {
    const currentYear = new Date().getFullYear();
    // Use consistent date format
    const date = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setClientDueDate(date);

    // Fetch national debt on component mount
    getFormattedNationalDebt().then(setNationalDebt);

  }, []); // Empty dependency array ensures this runs only once on mount

  const handleOpenModal = () => {
     // Check if either items are selected OR the budget balance is checked
     if (selectedItems.size > 0 || balanceBudgetChecked) {
       setIsModalOpen(true);
     } else {
         toast({
            title: "Nothing Selected",
            description: "Please select items or check 'Prioritize Balancing the Budget' to include in your email.",
            variant: "default",
         });
     }
  };


  const handleEmailSubmit = (emailDetails: { subject: string; body: string }) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailDetails.subject)}&body=${encodeURIComponent(emailDetails.body)}`;
    window.open(mailtoLink, '_self');
    setIsModalOpen(false); // Close modal after generating mailto link
  };


   const handleCheckboxChange = (checked: boolean | 'indeterminate', item: TaxSpendingSubItem) => {
        const newSelectedItems = new Map(selectedItems);
        const itemId = `${item.id}`; // Ensure key is string
        if (checked === true) {
            // Add default reduction level (e.g., 'Reduce') when selected
            newSelectedItems.set(itemId, { id: itemId, description: item.description, reductionLevel: 50 });
        } else {
            newSelectedItems.delete(itemId);
        }
        setSelectedItems(newSelectedItems);
    };

    const handleBudgetCheckboxChange = (checked: boolean | 'indeterminate') => {
        setBalanceBudgetChecked(checked === true);
    }


  // Use client-side date state
  const currentYear = new Date().getFullYear(); // Get current year for display
  const dueDateDisplay = clientDueDate || `April 15, ${currentYear + 1}`; // Use calculated due date

  const chartData = taxSpending.map(item => ({
    category: item.category,
    percentage: item.percentage,
  }));


  return (
    // Add relative positioning and padding-bottom to the container to prevent overlap with FAB
    <div className="space-y-10 animate-fadeIn relative pb-28 sm:pb-24"> {/* Increased padding-bottom */}
        {/* --- Header --- */}
        <div className="text-center space-y-1 mb-10">
            {/* Keep only one main title */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{currentYear} Federal Income Tax Receipt</h1>
            <p className="text-lg text-muted-foreground">Based on your estimated <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span> payment.</p>
            <p className="text-xs text-muted-foreground/70">Next Filing Due: {dueDateDisplay}</p>
         </div>

       {/* --- Direct Activism Plea --- */}
        <Alert className="mb-8 shadow-sm rounded-lg border border-primary/20 bg-primary/5 text-foreground animate-fadeIn delay-500 duration-3000"> {/* Extended duration */}
             <Megaphone className="h-5 w-5 mt-0.5 stroke-primary" />
            <AlertTitle className="font-semibold text-primary">Make Your Voice Heard!</AlertTitle>
            <AlertDescription className="text-sm text-foreground/90 space-y-1.5">
                Understanding where your money goes is the first step. The next is action.
                <span className="block">Your elected officials work for you. Let them know how you feel about these spending priorities. Select specific items below that concern you and use the button to draft a direct message.</span>
                 <Button variant="link" className="p-0 h-auto ml-0 text-primary font-medium text-sm mt-1" onClick={() => window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer')}>
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
                    outerRadius={window.innerWidth < 640 ? 80 : 100}
                    innerRadius={window.innerWidth < 640 ? 50 : 65}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="percentage"
                    nameKey="category"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={'hsl(var(--background))'} strokeWidth={1} />
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip totalAmount={taxAmount} />} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.4 }} />
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
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">Select items you believe are overspent or prioritize balancing the budget.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TooltipProvider delayDuration={250}>
                 <Accordion type="multiple" className="w-full">
                    {taxSpending.map((item, index) => {
                        const categoryAmount = (item.percentage / 100) * taxAmount;
                        const Icon = categoryIcons[item.category] || DefaultIcon;
                        const isInterestOnDebt = item.category === 'Interest on Debt';
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                             <AccordionItem value={`item-${index}`} key={item.id || index} className="border-b border-border/40 last:border-b-0 group">
                                <AccordionTrigger className="hover:no-underline py-3 px-3 sm:px-4 rounded-none hover:bg-accent/50 data-[state=open]:bg-accent/40 transition-colors duration-150 text-left">
                                     <div className="flex justify-between items-center w-full gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Icon className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-medium text-sm truncate flex-1">{item.category}</span>
                                        </div>
                                        <div className="text-right shrink-0 flex items-baseline gap-1 ml-auto">
                                            <span className="font-semibold font-mono text-sm">{formatCurrency(categoryAmount)}</span>
                                            <span className="text-muted-foreground text-xs font-mono hidden sm:inline">({item.percentage.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent
                                    className="bg-background/30 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden"
                                >
                                    <div className="pl-8 pr-3 sm:pl-10 sm:pr-4 pt-3 pb-4 text-muted-foreground space-y-2.5">
                                     {isInterestOnDebt ? (
                                         <blockquote className="text-xs bg-secondary/40 p-3 rounded-md border border-border/40 text-foreground/75 shadow-inner flex flex-col gap-2 items-start">
                                             <div className="flex items-start gap-2">
                                                 <TrendingDown className="h-4 w-4 shrink-0 mt-0.5 text-destructive/80" />
                                                 <span className="leading-relaxed">
                                                    This significant portion reflects the cost of servicing the national debt, {nationalDebt}. This debt is a direct consequence of sustained government spending exceeding revenue collection. Decades of deficit spending (often driven by tax cuts for the wealthy and corporations, unfunded wars, and economic bailouts) contribute to this substantial burden. High interest payments divert critical funds from essential public services, infrastructure projects, education systems, and potential tax relief, raising serious questions about long-term fiscal stability and the accountability of our government's financial management.
                                                </span>
                                             </div>
                                             {/* Add Budget Balance Checkbox here */}
                                             <div className="flex items-center space-x-2 pl-6 pt-2">
                                                 <Checkbox
                                                    id="balance-budget"
                                                    checked={balanceBudgetChecked}
                                                    onCheckedChange={handleBudgetCheckboxChange}
                                                    aria-label="Prioritize Balancing the Budget"
                                                    className="rounded-[4px]"
                                                 />
                                                <Label htmlFor="balance-budget" className="text-xs font-medium text-foreground/90 cursor-pointer">
                                                   Prioritize Balancing the Budget
                                                </Label>
                                             </div>
                                         </blockquote>
                                     ) : hasSubItems ? (
                                        <ul className="space-y-2">
                                            {item.subItems!.map((subItem) => {
                                                const subItemAmount = subItem.amountPerDollar * taxAmount;
                                                const isSelected = selectedItems.has(subItem.id);
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
                                                                    <label
                                                                        htmlFor={`subitem-${item.id}-${subItem.id}`}
                                                                        className={cn(
                                                                            "truncate cursor-pointer hover:text-foreground transition-colors flex items-center gap-1 flex-1",
                                                                            isSelected ? "text-foreground font-medium" : ""
                                                                        )}
                                                                     >
                                                                        {subItem.description}
                                                                        {(subItem.tooltipText || subItem.wikiLink) && <Info className="h-3 w-3 opacity-40 group-hover/subitem:opacity-100 transition-opacity shrink-0"/>}
                                                                    </label>
                                                                </TooltipTrigger>
                                                                {(subItem.tooltipText || subItem.wikiLink) && <SubItemTooltipContent subItem={subItem} />}
                                                            </ShadTooltip>
                                                         </div>
                                                        <span className="font-medium font-mono text-foreground/80 whitespace-nowrap">{formatCurrency(subItemAmount)}</span>
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
                </TooltipProvider>
                 {/* --- Total Row --- */}
                 <div className="flex justify-between items-center w-full px-3 sm:px-4 py-3 sm:py-4 border-t-2 border-primary/50 bg-primary/5">
                     <span className="font-bold text-sm sm:text-base text-primary tracking-tight">TOTAL ESTIMATED TAX</span>
                     <span className="font-bold font-mono text-sm sm:text-base text-primary">{formatCurrency(taxAmount)}</span>
                 </div>
            </CardContent>
        </Card>

        {/* Floating Action Button - Fixed Centered Bottom */}
        {/* Ensure this div is outside the main card content flow */}
        <div className={cn(
             "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out pointer-events-none", // Use fixed positioning, always present but controlled by pointer-events
             (selectedItems.size > 0 || balanceBudgetChecked) ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 scale-95" // Show/hide with scale and pointer-events
         )}>
            <Button
                size="lg"
                className={cn(
                    "shadow-2xl rounded-full text-sm sm:text-base px-5 py-3 sm:px-6 sm:py-3",
                    "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700", // Light mode gradient remains Teal
                    "dark:bg-gradient-to-r dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800", // Dark mode gradient corrected to purple only
                    "text-primary-foreground animate-glow flex items-center gap-2 ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                    "transition-transform hover:scale-105 active:scale-95" // Add hover/active transforms
                )}
                onClick={handleOpenModal}
                aria-label={`Email your representative about ${selectedItems.size} selected item(s)`}
                // Button is effectively disabled by pointer-events-none when no items are selected
                // disabled={selectedItems.size === 0 && !balanceBudgetChecked} // Keep disabled prop for accessibility state
             >
                 <Mail className="h-4 w-4 sm:h-5 sm:w-5"/>
                 {/* Update button text based on selection */}
                 Email Officials ({selectedItems.size + (balanceBudgetChecked ? 1 : 0)})
             </Button>
        </div>


        {/* Email Customization Modal */}
        <EmailCustomizationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedItems={Array.from(selectedItems.values())}
            balanceBudgetChecked={balanceBudgetChecked} // Pass budget check state
            onSubmit={handleEmailSubmit}
        />
    </div>
  );
}

