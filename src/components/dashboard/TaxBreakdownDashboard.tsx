
'use client';

import * as React from 'react';
import { useState } from 'react'; // Import useState
import type { TaxSpending, TaxSpendingSubItem } from '@/services/tax-spending'; // Import TaxSpendingSubItem
import { generateRepresentativeEmail } from '@/services/tax-spending'; // Import email generation function
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'; // Removed Sector
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import {
    ExternalLink,
    Info,
    Mail, // Icon for email button
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
    Link as LinkIcon, // Icon for Wikipedia link
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Tooltip as ShadTooltip, // Renamed to avoid conflict with Recharts Tooltip
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'; // Import cn utility

interface TaxBreakdownDashboardProps {
  taxAmount: number;
  taxSpending: TaxSpending[];
  representativeSuggestion: SuggestRepresentativesOutput | null;
}

// Define a richer color palette - ensure enough colors for categories
const COLORS = [
    'hsl(var(--chart-1))', // Teal base
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    '#8884d8', // Purple
    '#82ca9d', // Green
    '#ffc658', // Yellow
    '#ff8042', // Orange
    '#a4de6c', // Light Green
    '#d0ed57', // Lime Green
    '#ffc0cb', // Pink
    '#00C49F', // Another Teal/Green
    '#FFBB28', // Amber
    '#FF8042', // Deep Orange
];


// --- Icon Mapping ---
const categoryIcons: { [key: string]: React.ElementType } = {
    'Health': HeartPulse,
    'War and Weapons': Crosshair,
    'Interest on Debt': PiggyBank,
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
    // Add more mappings as needed
};
const DefaultIcon = HelpCircle;


// --- Custom Tooltip for Pie Chart ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Access the payload item (category data)
    const totalAmount = data.totalAmount; // Get total tax amount from payload
    const spendingAmount = (data.percentage / 100) * totalAmount;
    const Icon = categoryIcons[data.category] || DefaultIcon;

    return (
        // Use ShadCN Card for Tooltip styling - simplified look
        <div className="rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-fadeIn text-sm">
             <div className="flex items-center justify-between mb-1">
                 <span className="font-medium flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {data.category}
                 </span>
                <span className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="font-semibold">
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
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mt-6 list-none p-0">
      {payload.map((entry: any, index: number) => {
          const percentage = entry.payload?.percentage; // Access percentage from the payload
          const Icon = categoryIcons[entry.value] || DefaultIcon;
          return (
            <li key={`item-${index}`} className="flex items-center space-x-1.5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <span style={{ backgroundColor: entry.color }} className="h-2 w-2 rounded-full inline-block shrink-0"></span>
              <Icon className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{entry.value}</span>
              {percentage != null && <span className="">({percentage.toFixed(1)}%)</span>}
            </li>
          );
      })}
    </ul>
  );
};


// --- SubItem Tooltip Content ---
const SubItemTooltipContent = ({ subItem }: { subItem: TaxSpendingSubItem }) => (
    <TooltipContent side="top" align="start" className="max-w-xs text-sm bg-background border shadow-xl p-3 rounded-lg">
      <p className="font-medium mb-1">{subItem.description}</p>
      {subItem.tooltipText && <p className="text-muted-foreground mb-2">{subItem.tooltipText}</p>}
      {subItem.wikiLink && (
        <a
          href={subItem.wikiLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1 text-xs"
          onClick={(e) => e.stopPropagation()} // Prevent tooltip from closing immediately
        >
          <LinkIcon className="h-3 w-3" /> Wikipedia
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

  const [selectedItems, setSelectedItems] = useState<Map<string, { id: string; description: string }>>(new Map());

  const chartData = taxSpending.map((item) => ({
      ...item,
      totalAmount: taxAmount, // Pass total tax amount to each data point for tooltip calculation
  }));

  const handleContactRepresentatives = () => {
    // Use selected items if available, otherwise use AI suggestions
    const itemsToEmail = selectedItems.size > 0
        ? Array.from(selectedItems.values())
        : representativeSuggestion?.suggestedCategories.map(cat => ({ id: cat, description: cat })) || []; // Fallback structure

    if (itemsToEmail.length === 0) {
        // Maybe show a toast? "Select items you're concerned about first."
        console.log("No items selected or suggested for email.");
        return;
    }

    console.log('Generating email for:', itemsToEmail);
    const emailBody = generateRepresentativeEmail(itemsToEmail);
    const mailtoLink = `mailto:?subject=${encodeURIComponent("Concerns Regarding Federal Tax Spending Priorities")}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Optionally redirect or show confirmation after triggering mailto
     // window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer');
  };

   const handleCheckboxChange = (checked: boolean | 'indeterminate', item: TaxSpendingSubItem) => {
        const newSelectedItems = new Map(selectedItems);
        if (checked) {
            newSelectedItems.set(item.id, { id: item.id, description: item.description });
        } else {
            newSelectedItems.delete(item.id);
        }
        setSelectedItems(newSelectedItems);
    };


  const formatCurrency = (amount: number) => {
      // Ensure it's a number before formatting
       if (typeof amount !== 'number' || isNaN(amount)) {
        return '$--.--'; // Or some placeholder for invalid numbers
      }
      return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Note: Using `new Date()` directly can cause hydration issues if server/client times differ slightly.
  // For static dates like the *due date*, it's safer. For *current year*, it's usually fine but keep in mind.
  const currentYear = new Date().getFullYear();
  const dueDate = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // April 15th of next year

  return (
    <div className="space-y-10 animate-fadeIn relative pb-20"> {/* Add padding-bottom for floating button */}
        {/* --- Header --- */}
        <div className="text-center space-y-1.5 mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Your {currentYear} Federal Tax Receipt</h1>
            <p className="text-base text-muted-foreground">Estimated based on a <span className="font-medium text-foreground">${taxAmount.toLocaleString()}</span> payment.</p>
            <p className="text-xs text-muted-foreground/80">Filing Due: {dueDate}</p>
         </div>

       {/* --- AI Suggestion Alert --- */}
        {representativeSuggestion?.shouldSuggestRepresentatives && (
            <Alert className="bg-primary/5 border-primary/20 text-foreground mb-8 shadow-sm rounded-lg">
                 <Info className="h-4 w-4 stroke-primary mt-1" />
                <AlertTitle className="font-semibold text-primary">Take Action</AlertTitle>
                <AlertDescription className="text-foreground/90 text-sm">
                    {representativeSuggestion.reason} Consider contacting your representatives about: <span className="font-medium">{representativeSuggestion.suggestedCategories.join(', ')}.</span>
                    <span className="block mt-1">You can also select specific sub-items below to include in your email.</span>
                     <Button variant="link" className="p-0 h-auto ml-1 text-primary font-medium text-sm" onClick={() => window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer')}>
                        Find Your Officials <ExternalLink className="inline ml-1 h-3 w-3" />
                    </Button>
                </AlertDescription>
            </Alert>
        )}
        {!representativeSuggestion?.shouldSuggestRepresentatives && representativeSuggestion?.reason && (
             <Alert variant="default" className="mt-4 mb-8 bg-secondary/50 border-border rounded-lg">
                 <Info className="h-4 w-4 mt-1 text-muted-foreground" />
                <AlertTitle className="font-medium">Representative Contact Suggestion</AlertTitle>
                <AlertDescription className="text-muted-foreground text-sm">
                    {representativeSuggestion.reason}
                </AlertDescription>
            </Alert>
        )}

      {/* --- Chart Section (Simplified Wrapper) --- */}
      <div className="mb-12">
         <h2 className="text-xl font-semibold text-center mb-5">Spending Overview</h2>
         <TooltipProvider delayDuration={100}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={115} // Slightly larger
                    innerRadius={70} // Larger inner radius for donut
                    fill="#8884d8"
                    paddingAngle={1} // Add slight padding between segments
                    dataKey="percentage"
                    nameKey="category"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={'hsl(var(--background))'} strokeWidth={entry.percentage > 0.5 ? 1.5 : 0} /> // Thicker border on larger segments
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }} />
                   <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </TooltipProvider>
             <p className="text-xs text-muted-foreground text-center mt-5 flex items-center justify-center gap-1.5">
                <Info className="h-3 w-3" /> Hover over segments for details. Data is estimated based on publicly available figures.
             </p>
      </div>


      {/* --- Detailed Breakdown Card --- */}
       <Card className="shadow-lg border border-border/60 rounded-xl overflow-hidden bg-gradient-to-b from-card to-card/95">
            <CardHeader className="px-6 py-5 border-b border-border/50">
                <CardTitle className="text-2xl font-semibold tracking-tight">Detailed Tax Receipt</CardTitle>
                <CardDescription className="text-muted-foreground">Select items you believe are overspent to include them in an email to your representative.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-0">
              <TooltipProvider delayDuration={200}>
                 <Accordion type="multiple" className="w-full">
                    {taxSpending.map((item, index) => {
                        const categoryAmount = (item.percentage / 100) * taxAmount;
                        const Icon = categoryIcons[item.category] || DefaultIcon;
                        const isInterestOnDebt = item.category === 'Interest on Debt';
                        const hasSubItems = item.subItems && item.subItems.length > 0;

                        return (
                             <AccordionItem value={`item-${index}`} key={index} className="border-b border-border/50 last:border-b-0 group">
                                <AccordionTrigger className="hover:no-underline py-4 px-4 sm:px-6 rounded-none hover:bg-accent/60 transition-colors duration-150 data-[state=open]:bg-accent/50">
                                     <div className="flex justify-between items-center w-full gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon className="h-5 w-5 text-primary shrink-0" />
                                            <span className="font-medium text-base sm:text-lg truncate flex-1">{item.category}</span>
                                        </div>
                                        <div className="text-right shrink-0 flex items-baseline gap-2 ml-auto mr-2"> {/* Added margin */}
                                            <span className="font-semibold text-base sm:text-lg">${formatCurrency(categoryAmount)}</span>
                                            <span className="text-muted-foreground text-xs sm:text-sm">({item.percentage.toFixed(1)}%)</span>
                                        </div>
                                        {/* Chevron moved outside by AccordionTrigger */}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent
                                    className="bg-background/50 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden"
                                >
                                    <div className="pl-12 pr-4 sm:pr-6 pt-3 pb-5 text-muted-foreground space-y-3"> {/* Increased padding */}
                                     {isInterestOnDebt && (
                                        <blockquote className="text-sm italic bg-secondary/50 p-3 rounded-md border border-border/50 text-foreground/80 shadow-inner">
                                            This substantial portion represents the cost of servicing the U.S. national debt, a consequence of decades where government spending consistently outpaced revenue collection. Factors like past budget deficits, unfunded wars, economic downturns requiring stimulus, and fluctuating interest rates contribute to this burden. Continued high interest payments divert funds that could otherwise be invested in crucial public services, infrastructure, or tax relief, raising serious questions about long-term fiscal sustainability and responsible governance.
                                        </blockquote>
                                     )}
                                    {hasSubItems ? (
                                        <ul className="space-y-2.5">
                                            {item.subItems!.map((subItem, subIndex) => {
                                                const subItemAmount = subItem.amountPerDollar * taxAmount;
                                                return (
                                                     <li key={subIndex} className="flex justify-between items-center text-sm gap-4 group/subitem">
                                                         <div className="flex items-center gap-2">
                                                            <Checkbox
                                                               id={`subitem-${item.id}-${subItem.id}`}
                                                               checked={selectedItems.has(subItem.id)}
                                                               onCheckedChange={(checked) => handleCheckboxChange(checked, subItem)}
                                                               aria-label={`Select ${subItem.description}`}
                                                               className="mt-0.5" // Align checkbox better
                                                            />
                                                           <ShadTooltip>
                                                                <TooltipTrigger asChild>
                                                                    <label
                                                                        htmlFor={`subitem-${item.id}-${subItem.id}`}
                                                                        className="truncate cursor-pointer hover:text-foreground transition-colors flex items-center gap-1"
                                                                     >
                                                                        {subItem.description}
                                                                        {(subItem.tooltipText || subItem.wikiLink) && <Info className="h-3 w-3 opacity-50 group-hover/subitem:opacity-100 transition-opacity"/>}
                                                                    </label>
                                                                </TooltipTrigger>
                                                                {(subItem.tooltipText || subItem.wikiLink) && <SubItemTooltipContent subItem={subItem} />}
                                                            </ShadTooltip>
                                                         </div>
                                                        <span className="font-medium text-foreground/90 whitespace-nowrap">${formatCurrency(subItemAmount)}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : !isInterestOnDebt && ( // Only show "No breakdown" if not Interest on Debt
                                        <p className="text-sm italic">No detailed breakdown provided for this category.</p>
                                    )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                 </Accordion>
                </TooltipProvider>
                 {/* --- Total Row --- */}
                 <div className="flex justify-between items-center w-full mt-6 px-4 sm:px-6 py-5 border-t-2 border-primary/60 bg-primary/5">
                     <span className="font-bold text-lg sm:text-xl text-primary tracking-tight">TOTAL ESTIMATED TAX</span>
                     <span className="font-bold text-lg sm:text-xl text-primary">${formatCurrency(taxAmount)}</span>
                 </div>
            </CardContent>
        </Card>

       {/* Floating Action Button */}
        {selectedItems.size > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideInUp">
                <Button
                    size="lg"
                    className="shadow-2xl rounded-full text-base px-6 py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleContactRepresentatives}
                    aria-label="Email your representative about selected items"
                 >
                    <Mail className="mr-2 h-5 w-5"/>
                    Email Your Representative ({selectedItems.size})
                </Button>
            </div>
        )}
    </div>
  );
}

    