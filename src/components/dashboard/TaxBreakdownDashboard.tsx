
'use client';

import * as React from 'react';
import type { TaxSpending } from '@/services/tax-spending';
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Sector } from 'recharts';
import { Button } from '@/components/ui/button';
import {
    ExternalLink,
    Info,
    ChevronDown,
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
import { cn } from '@/lib/utils'; // Import cn utility

interface TaxBreakdownDashboardProps {
  taxAmount: number;
  taxSpending: TaxSpending[];
  representativeSuggestion: SuggestRepresentativesOutput | null;
}

// Define a richer color palette - ensure enough colors for categories
const COLORS = [
    'hsl(var(--chart-1))', // Teal
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#ffc0cb' // Added more distinct colors
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
        // Use ShadCN Card for Tooltip styling
        <Card className="w-64 shadow-xl animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {data.category}
                 </CardTitle>
                <span className="text-xs text-muted-foreground">{data.percentage.toFixed(1)}%</span>
            </CardHeader>
            <CardContent>
                 <div className="text-lg font-bold">
                    ${spendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {/* Optionally add more details if needed */}
                {/* <p className="text-xs text-muted-foreground">
                   Part of ${totalAmount.toLocaleString()} total tax
                </p> */}
            </CardContent>
        </Card>
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
            <li key={`item-${index}`} className="flex items-center space-x-1.5 cursor-pointer hover:text-primary transition-colors">
              <span style={{ backgroundColor: entry.color }} className="h-2.5 w-2.5 rounded-full inline-block shrink-0"></span>
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="truncate max-w-[100px]">{entry.value}</span>
              {percentage && <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>}
            </li>
          );
      })}
    </ul>
  );
};

// --- Main Component ---
export default function TaxBreakdownDashboard({
  taxAmount,
  taxSpending,
  representativeSuggestion,
}: TaxBreakdownDashboardProps) {

  const chartData = taxSpending.map((item) => ({
      ...item,
      totalAmount: taxAmount, // Pass total tax amount to each data point for tooltip calculation
  }));

  const handleContactRepresentatives = () => {
    console.log('Contact Representatives action triggered for categories:', representativeSuggestion?.suggestedCategories);
    window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer');
  };

  const formatCurrency = (amount: number) => {
      return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Note: Using `new Date()` directly can cause hydration issues if server/client times differ slightly.
  // For static dates like the *due date*, it's safer. For *current year*, it's usually fine but keep in mind.
  const currentYear = new Date().getFullYear();
  const dueDate = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // April 15th of next year

  return (
    <div className="space-y-8 animate-fadeIn">
        {/* --- Header --- */}
        <div className="text-center space-y-1 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Your {currentYear} Federal Tax Receipt</h1>
            <p className="text-muted-foreground">Estimated based on a ${taxAmount.toLocaleString()} payment.</p>
            <p className="text-sm text-muted-foreground">Filing Due: {dueDate}</p>
         </div>

       {/* --- AI Suggestion Alert --- */}
        {representativeSuggestion?.shouldSuggestRepresentatives && (
            <Alert className="bg-primary/5 border-primary/20 text-foreground mb-8 shadow-sm">
                 <Info className="h-4 w-4 stroke-primary mt-1" />
                <AlertTitle className="font-semibold text-primary">Take Action</AlertTitle>
                <AlertDescription className="text-foreground/90">
                    {representativeSuggestion.reason} Consider contacting your representatives about: <span className="font-medium">{representativeSuggestion.suggestedCategories.join(', ')}.</span>
                     <Button variant="link" className="p-0 h-auto ml-1 text-primary font-medium" onClick={handleContactRepresentatives}>
                        Find Your Officials <ExternalLink className="inline ml-1 h-3 w-3" />
                    </Button>
                </AlertDescription>
            </Alert>
        )}
        {!representativeSuggestion?.shouldSuggestRepresentatives && representativeSuggestion?.reason && (
             <Alert variant="default" className="mt-4 mb-8 bg-secondary/50 border-border">
                 <Info className="h-4 w-4 mt-1" />
                <AlertTitle>Representative Contact Suggestion</AlertTitle>
                <AlertDescription>
                    {representativeSuggestion.reason}
                </AlertDescription>
            </Alert>
        )}

      {/* --- Chart Section (Simplified Wrapper) --- */}
      <div className="mb-10">
         <h2 className="text-xl font-semibold text-center mb-4">Spending Overview</h2>
         <TooltipProvider delayDuration={100}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110} // Slightly larger radius
                    innerRadius={60} // Make it a donut chart
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="category"
                    // Remove direct labels
                    // label={...}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={entry.percentage > 1 ? 'hsl(var(--background))' : 'none'} strokeWidth={1} />
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }} />
                   <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </TooltipProvider>
             <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                <Info className="h-3 w-3" /> Data is estimated based on publicly available figures.
             </p>
      </div>


      {/* --- Detailed Breakdown Card --- */}
       <Card className="shadow-md border border-border/60">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Detailed Tax Receipt</CardTitle>
                <CardDescription>Estimated amount spent per category based on your ${taxAmount.toLocaleString()} payment.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                 <Accordion type="multiple" className="w-full">
                    {taxSpending.map((item, index) => {
                        const categoryAmount = (item.percentage / 100) * taxAmount;
                        const Icon = categoryIcons[item.category] || DefaultIcon;
                        const isInterestOnDebt = item.category === 'Interest on Debt';

                        return (
                             <AccordionItem value={`item-${index}`} key={index} className="border-b border-border/60 last:border-b-0">
                                <AccordionTrigger className="hover:no-underline py-4 px-2 rounded-md hover:bg-accent transition-colors">
                                     <div className="flex justify-between items-center w-full gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon className="h-5 w-5 text-primary shrink-0" />
                                            <span className="font-medium text-base truncate flex-1">{item.category}</span>
                                        </div>
                                        <div className="text-right shrink-0 flex items-baseline gap-2">
                                            <span className="font-semibold text-lg">${formatCurrency(categoryAmount)}</span>
                                            <span className="text-muted-foreground text-sm">({item.percentage.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-10 pr-2 pt-1 pb-4 text-muted-foreground">
                                     {isInterestOnDebt && (
                                        <p className="text-sm mb-3 italic bg-secondary/50 p-3 rounded-md border border-border/50">
                                            This represents the cost of servicing the U.S. national debt, which has accumulated over decades due to government spending exceeding revenue. Factors like past budget deficits, economic downturns, and changes in interest rates influence this amount.
                                        </p>
                                     )}
                                    {item.subItems && item.subItems.length > 0 ? (
                                        <ul className="space-y-1.5">
                                            {item.subItems.map((subItem, subIndex) => {
                                                const subItemAmount = subItem.amountPerDollar * taxAmount;
                                                return (
                                                     <li key={subIndex} className="flex justify-between items-center text-sm gap-4">
                                                        <span className="truncate">{subItem.description}</span>
                                                        <span className="font-medium text-foreground/90 whitespace-nowrap">${formatCurrency(subItemAmount)}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : !isInterestOnDebt && ( // Only show "No breakdown" if not Interest on Debt
                                        <p className="text-sm">No detailed breakdown provided for this category.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                 </Accordion>
                 {/* --- Total Row --- */}
                 <div className="flex justify-between items-center w-full mt-8 pt-4 border-t-2 border-primary/80 px-2">
                     <span className="font-bold text-xl text-primary">TOTAL ESTIMATED TAX</span>
                     <span className="font-bold text-xl text-primary">${formatCurrency(taxAmount)}</span>
                 </div>
            </CardContent>
        </Card>
    </div>
  );
}
    
    