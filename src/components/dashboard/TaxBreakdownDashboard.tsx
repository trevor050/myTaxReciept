
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react'; // Import useEffect
import type { TaxSpending, TaxSpendingSubItem, SelectedItem } from '@/services/tax-spending'; // Import SelectedItem
import { generateRepresentativeEmail } from '@/services/tax-spending';
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import EmailCustomizationModal from '@/components/dashboard/EmailCustomizationModal'; // Import the new modal component

import {
    ExternalLink,
    Info,
    Mail,
    Scale, // Law Enforcement / Government
    HeartPulse, // Health
    ShieldCheck, // Veterans
    Briefcase, // Unemployment and Labor
    GraduationCap, // Education
    Wheat, // Food and Agriculture
    Building, // Housing and Community
    Atom, // Science
    Globe, // International Affairs
    Landmark, // Government (alternative)
    Sprout, // Energy and Environment
    Train, // Transportation
    PiggyBank, // Interest on Debt / General Finance
    Crosshair, // War and Weapons (alternative: Swords)
    HelpCircle, // Default icon
    Link as LinkIcon,
    TrendingDown, // Icon for Interest on Debt message
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

interface TaxBreakdownDashboardProps {
  taxAmount: number;
  taxSpending: TaxSpending[];
  representativeSuggestion: SuggestRepresentativesOutput | null;
}

// Define a richer, more distinct color palette using CSS variables
const COLORS = [
    'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))',
    'hsl(var(--chart-5))', 'hsl(var(--chart-6))', 'hsl(var(--chart-7))', 'hsl(var(--chart-8))',
    'hsl(var(--chart-9))', 'hsl(var(--chart-10))','hsl(var(--chart-11))','hsl(var(--chart-12))',
    'hsl(var(--chart-13))','hsl(var(--chart-14))','hsl(var(--chart-15))'
];


// --- Icon Mapping ---
const categoryIcons: { [key: string]: React.ElementType } = {
    'Health': HeartPulse,
    'War and Weapons': Crosshair,
    'Interest on Debt': TrendingDown, // Changed icon
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


// --- Custom Tooltip for Pie Chart ---
const CustomTooltip = ({ active, payload, label, totalAmount }: any) => { // Added totalAmount prop
  if (active && payload && payload.length) {
    const data = payload[0].payload; // This now correctly accesses the data entry passed to the Pie component
    const spendingAmount = (data.percentage / 100) * totalAmount;
    const Icon = categoryIcons[data.category] || DefaultIcon;

    return (
        // Use ShadCN Card for Tooltip styling - updated look
        <div className="rounded-lg border bg-popover p-2.5 text-popover-foreground shadow-lg animate-fadeIn text-xs">
             <div className="flex items-center justify-between mb-1 gap-2">
                 <span className="font-medium flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    {data.category}
                 </span>
                <span className="font-mono text-muted-foreground">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="font-semibold text-sm">
                ${spendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>
    );
  }
  return null;
};


// --- Custom Legend ---
const CustomLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs mt-4 list-none p-0">
      {payload.map((entry: any, index: number) => {
          const percentage = entry.payload?.percentage; // Access percentage from payload
          const Icon = categoryIcons[entry.value] || DefaultIcon;
          return (
            <li key={`item-${index}`} className="flex items-center space-x-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <span style={{ backgroundColor: entry.color }} className="h-2 w-2 rounded-full inline-block shrink-0"></span>
              {/* <Icon className="h-3 w-3" /> */} {/* Optionally hide icon in legend for less clutter */}
              <span className="truncate max-w-[120px]">{entry.value}</span>
              {percentage != null && <span className="font-mono">({percentage.toFixed(1)}%)</span>}
            </li>
          );
      })}
    </ul>
  );
};


// --- SubItem Tooltip Content ---
const SubItemTooltipContent = ({ subItem }: { subItem: TaxSpendingSubItem }) => (
    <TooltipContent side="top" align="center" className="max-w-sm text-sm bg-popover border shadow-xl p-3 rounded-lg animate-scaleIn">
      <p className="font-semibold mb-1.5 text-popover-foreground">{subItem.description}</p>
      {subItem.tooltipText && <p className="text-muted-foreground text-xs leading-relaxed mb-2">{subItem.tooltipText}</p>}
      {subItem.wikiLink && (
        <a
          href={subItem.wikiLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1 text-xs font-medium"
          onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
        >
          Learn More <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </TooltipContent>
);


// --- Main Component ---
export default function TaxBreakdownDashboard({
  taxAmount,
  taxSpending,
  representativeSuggestion,
}: TaxBreakdownDashboardProps) {

  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map()); // Use SelectedItem type
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientDueDate, setClientDueDate] = useState<string | null>(null); // State for client-side date

   useEffect(() => {
    // Calculate due date on the client to avoid hydration mismatch
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // April 15th of next year
    setClientDueDate(date);
  }, []); // Empty dependency array ensures this runs once on mount


  const handleOpenModal = () => {
    if (selectedItems.size > 0) {
      setIsModalOpen(true);
    } else {
        // Optionally show a toast if no items are selected
        console.log("No items selected.");
    }
  };

  const handleEmailSubmit = (emailDetails: { subject: string; body: string }) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailDetails.subject)}&body=${encodeURIComponent(emailDetails.body)}`;
    window.location.href = mailtoLink;
    setIsModalOpen(false); // Close modal after generating mailto link
  };


   const handleCheckboxChange = (checked: boolean | 'indeterminate', item: TaxSpendingSubItem) => {
        const newSelectedItems = new Map(selectedItems);
        if (checked === true) { // Explicitly check for true
            // Initialize with default reduction level (e.g., 50 for 'Reduce')
            newSelectedItems.set(item.id, { id: item.id, description: item.description, reductionLevel: 50 });
        } else {
            newSelectedItems.delete(item.id);
        }
        setSelectedItems(newSelectedItems);
    };


  const formatCurrency = (amount: number) => {
       if (typeof amount !== 'number' || isNaN(amount)) {
        return '$--.--';
      }
      // Use compact formatting for very small numbers if needed, otherwise standard
      // if (amount < 0.01 && amount > 0) return `$${amount.toFixed(3)}`; // Example for more precision on tiny amounts
      return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Use client-side date state
  const dueDateDisplay = clientDueDate || `April 15, ${new Date().getFullYear() + 1}`;

  // Prepare data for the chart
  const chartData = taxSpending.map(item => ({
    category: item.category,
    percentage: item.percentage,
  }));


  return (
    // Adjusted max-width is handled in parent (page.tsx) for dashboard step
    <div className="space-y-10 animate-fadeIn relative pb-24"> {/* Increased padding-bottom for floating button */}
        {/* --- Header --- */}
        <div className="text-center space-y-1 mb-10">
            {/* Removed redundant title, keep only one main title */}
            {/* <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Your {currentYear} Federal Tax Receipt</h1> */}
            <p className="text-lg text-muted-foreground">Based on your estimated <span className="font-semibold text-foreground">${taxAmount.toLocaleString()}</span> payment.</p>
            <p className="text-xs text-muted-foreground/70">Next Filing Due: {dueDateDisplay}</p>
         </div>

       {/* --- AI Suggestion / Action Prompt (Simplified) --- */}
        {representativeSuggestion && ( // Only show if suggestion exists
            <Alert className={cn(
                "mb-8 shadow-sm rounded-lg border",
                representativeSuggestion.shouldSuggestRepresentatives
                    ? "bg-primary/5 border-primary/20 text-foreground"
                    : "bg-secondary/50 border-border"
                )}>
                 <Info className={cn("h-4 w-4 mt-1", representativeSuggestion.shouldSuggestRepresentatives ? "stroke-primary" : "text-muted-foreground")} />
                <AlertTitle className={cn("font-semibold", representativeSuggestion.shouldSuggestRepresentatives ? "text-primary" : "text-foreground")}>
                    {representativeSuggestion.shouldSuggestRepresentatives ? "Consider Taking Action" : "Spending Context"}
                </AlertTitle>
                <AlertDescription className="text-sm text-foreground/90">
                    {representativeSuggestion.reason}
                    {representativeSuggestion.shouldSuggestRepresentatives && (
                       <>
                        Key areas identified: <span className="font-medium">{representativeSuggestion.suggestedCategories.join(', ')}.</span>
                        <span className="block mt-1.5">You can select specific items below to include in an email to your representatives.</span>
                         <Button variant="link" className="p-0 h-auto ml-0 text-primary font-medium text-sm mt-1" onClick={() => window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer')}>
                            Find Your Officials <ExternalLink className="inline ml-1 h-3 w-3" />
                        </Button>
                       </>
                    )}
                </AlertDescription>
            </Alert>
        )}


      {/* --- Chart Section --- */}
      <div className="mb-12">
         <h2 className="text-xl font-semibold text-center mb-4">Spending Overview</h2>
         <TooltipProvider delayDuration={150}> {/* Slightly longer delay */}
              <ResponsiveContainer width="100%" height={320}> {/* Adjusted height */}
                <PieChart margin={{ top: 5, right: 15, bottom: 5, left: 15 }}>
                  <Pie
                    data={chartData} // Use prepared chartData
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100} // Slightly smaller
                    innerRadius={65} // Larger hole for donut
                    fill="#8884d8"
                    paddingAngle={1.5} // Increased padding
                    dataKey="percentage"
                    nameKey="category"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={'hsl(var(--background))'} strokeWidth={1} /> // Consistent stroke
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip totalAmount={taxAmount} />} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.4 }} /> {/* Pass totalAmount */}
                   <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </TooltipProvider>
             <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                <Info className="h-3 w-3" /> Hover over segments for details. Estimated data.
             </p>
      </div>


      {/* --- Detailed Breakdown Card --- */}
       <Card className="shadow-lg border border-border/60 rounded-xl overflow-hidden bg-gradient-to-b from-card to-card/95">
            <CardHeader className="px-6 py-5 border-b border-border/50">
                <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight">Detailed Spending</CardTitle> {/* Simplified title */}
                <CardDescription className="text-muted-foreground text-sm">Select items you believe are overspent to include in an email.</CardDescription>
            </CardHeader>
            <CardContent className="p-0"> {/* Remove default padding */}
              <TooltipProvider delayDuration={250}> {/* Slightly longer tooltip delay */}
                 <Accordion type="multiple" className="w-full">
                    {taxSpending.map((item, index) => {
                        const categoryAmount = (item.percentage / 100) * taxAmount;
                        const Icon = categoryIcons[item.category] || DefaultIcon;
                        const isInterestOnDebt = item.category === 'Interest on Debt';
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                             <AccordionItem value={`item-${index}`} key={item.id || index} className="border-b border-border/40 last:border-b-0 group">
                                <AccordionTrigger className="hover:no-underline py-3.5 px-4 sm:px-6 rounded-none hover:bg-accent/50 data-[state=open]:bg-accent/40 transition-colors duration-150">
                                     <div className="flex justify-between items-center w-full gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Icon className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-medium text-sm sm:text-base truncate flex-1">{item.category}</span>
                                        </div>
                                        <div className="text-right shrink-0 flex items-baseline gap-1.5 ml-auto mr-1">
                                            <span className="font-semibold font-mono text-sm sm:text-base">${formatCurrency(categoryAmount)}</span>
                                            <span className="text-muted-foreground text-xs font-mono">({item.percentage.toFixed(1)}%)</span>
                                        </div>
                                        {/* Chevron is part of Trigger */}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent
                                    className="bg-background/30 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden"
                                >
                                    <div className="pl-10 pr-4 sm:pl-12 sm:pr-6 pt-3 pb-4 text-muted-foreground space-y-2.5"> {/* Adjusted padding */}
                                     {isInterestOnDebt && (
                                         <blockquote className="text-xs italic bg-secondary/40 p-3 rounded-md border border-border/40 text-foreground/75 shadow-inner flex gap-2 items-start">
                                             <TrendingDown className="h-4 w-4 shrink-0 mt-0.5 text-destructive/80" />
                                             <span>This significant portion reflects the cost of servicing the national debt, largely driven by decades of government spending exceeding revenue. Factors include past deficits, unfunded conflicts, economic stimulus, and interest rate changes. High interest payments divert funds from public services, infrastructure, or tax relief, raising serious questions about long-term fiscal health and responsible governance.</span>
                                         </blockquote>
                                     )}
                                    {hasSubItems ? (
                                        <ul className="space-y-2">
                                            {item.subItems!.map((subItem) => {
                                                const subItemAmount = subItem.amountPerDollar * taxAmount;
                                                const isSelected = selectedItems.has(subItem.id);
                                                return (
                                                     <li key={subItem.id} className="flex justify-between items-center text-xs gap-3 group/subitem">
                                                         <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <Checkbox
                                                               id={`subitem-${item.id}-${subItem.id}`}
                                                               checked={isSelected}
                                                               onCheckedChange={(checked) => handleCheckboxChange(checked, subItem)}
                                                               aria-label={`Select ${subItem.description}`}
                                                               className="mt-0 shrink-0" // Adjusted alignment
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
                                                        <span className="font-medium font-mono text-foreground/80 whitespace-nowrap">${formatCurrency(subItemAmount)}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : !isInterestOnDebt && (
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
                 <div className="flex justify-between items-center w-full px-4 sm:px-6 py-4 border-t-2 border-primary/50 bg-primary/5">
                     <span className="font-bold text-base sm:text-lg text-primary tracking-tight">TOTAL ESTIMATED TAX</span>
                     <span className="font-bold font-mono text-base sm:text-lg text-primary">${formatCurrency(taxAmount)}</span>
                 </div>
            </CardContent>
        </Card>

       {/* Floating Action Button */}
        {selectedItems.size > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideInUp">
                <Button
                    size="lg"
                    className="shadow-2xl rounded-full text-sm sm:text-base px-5 py-5 sm:px-6 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground animate-glow flex items-center gap-2" // Added flex and gap
                    onClick={handleOpenModal} // Open modal instead of direct email
                    aria-label={`Email your representative about ${selectedItems.size} selected item(s)`}
                 >
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5"/> {/* Adjusted icon size */}
                    Email Officials ({selectedItems.size})
                </Button>
            </div>
        )}

        {/* Email Customization Modal */}
        <EmailCustomizationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedItems={Array.from(selectedItems.values())}
            onSubmit={handleEmailSubmit}
        />
    </div>
  );
}
