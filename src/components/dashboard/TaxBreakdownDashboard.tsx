
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { TaxSpending, TaxSpendingSubItem, SelectedItem } from '@/services/tax-spending';
import type { SuggestRepresentativesOutput } from '@/ai/flows/suggest-representatives'; // Keep type for prop definition, even if unused
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import EmailCustomizationModal from '@/components/dashboard/EmailCustomizationModal';

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

interface TaxBreakdownDashboardProps {
  taxAmount: number;
  taxSpending: TaxSpending[];
  representativeSuggestion: SuggestRepresentativesOutput | null; // Kept for type safety, but logic removed
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
        <div className="rounded-lg border bg-popover p-2.5 text-popover-foreground shadow-lg animate-fadeIn text-xs max-w-[150px] sm:max-w-[200px]">
             <div className="flex items-center justify-between mb-1 gap-2">
                 <span className="font-medium flex items-center gap-1.5 truncate">
                    <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                    {data.category}
                 </span>
                <span className="font-mono text-muted-foreground shrink-0">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="font-semibold text-sm">
                ${spendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        </div>
    );
  }
  return null;
};


const CustomLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs mt-4 list-none p-0 max-w-full mx-auto">
      {payload.map((entry: any, index: number) => {
          const percentage = entry.payload?.percentage;
          return (
            <li key={`item-${index}`} className="flex items-center space-x-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <span style={{ backgroundColor: entry.color }} className="h-2 w-2 rounded-full inline-block shrink-0"></span>
              <span className="truncate max-w-[100px] sm:max-w-[150px]">{entry.value}</span>
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
          onClick={(e) => e.stopPropagation()}
        >
          Learn More <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </TooltipContent>
);


export default function TaxBreakdownDashboard({
  taxAmount,
  taxSpending,
  representativeSuggestion, // Kept for prop type, but unused
}: TaxBreakdownDashboardProps) {

  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientDueDate, setClientDueDate] = useState<string | null>(null);
  const { toast } = useToast();

   useEffect(() => {
    const currentYear = new Date().getFullYear();
    // Updated date format based on user feedback example
    const date = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // April 15th of next year
    setClientDueDate(date);
  }, []);

  const handleOpenModal = () => {
    if (selectedItems.size > 0) {
      setIsModalOpen(true);
    } else {
         toast({
            title: "No Items Selected",
            description: "Please select items from the breakdown to include in your email.",
            variant: "default",
         });
    }
  };

  const handleEmailSubmit = (emailDetails: { subject: string; body: string }) => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailDetails.subject)}&body=${encodeURIComponent(emailDetails.body)}`;
    // Use window.open for potentially better compatibility than window.location.href
    window.open(mailtoLink, '_self');
    setIsModalOpen(false);
  };


   const handleCheckboxChange = (checked: boolean | 'indeterminate', item: TaxSpendingSubItem) => {
        const newSelectedItems = new Map(selectedItems);
        if (checked === true) {
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
      // Use standard currency formatting
      return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    <div className="space-y-10 animate-fadeIn relative pb-28 sm:pb-24">
        {/* --- Header --- */}
        <div className="text-center space-y-1 mb-10">
            {/* Combine titles for clarity */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{currentYear} Federal Income Tax Receipt</h1>
            <p className="text-lg text-muted-foreground">Based on your estimated <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span> payment.</p>
            <p className="text-xs text-muted-foreground/70">Next Filing Due: {dueDateDisplay}</p>
         </div>

       {/* --- Direct Activism Plea --- */}
        <Alert className="mb-8 shadow-sm rounded-lg border border-primary/20 bg-primary/5 text-foreground animate-fadeIn delay-500">
             <Megaphone className="h-5 w-5 mt-0.5 stroke-primary" /> {/* Changed Icon */}
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
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">Select items you believe are overspent to include in an email.</CardDescription>
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
                                     {isInterestOnDebt && (
                                         <blockquote className="text-xs bg-secondary/40 p-3 rounded-md border border-border/40 text-foreground/75 shadow-inner flex gap-2 items-start">
                                             <TrendingDown className="h-4 w-4 shrink-0 mt-0.5 text-destructive/80" />
                                             {/* Removed italics, updated text */}
                                             <span className="not-italic">This significant portion reflects the cost of servicing the national debt, a direct consequence of sustained government spending exceeding revenue collection. Decades of deficit spending, underfunded programs, and fluctuating interest rates contribute to this substantial burden. High interest payments divert critical funds from essential public services, infrastructure projects, education systems, and potential tax relief, raising serious questions about long-term fiscal stability and the accountability of our government's financial management.</span>
                                         </blockquote>
                                     )}
                                    {hasSubItems ? (
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
                                                               className="mt-0 shrink-0"
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
                 <div className="flex justify-between items-center w-full px-3 sm:px-4 py-3 sm:py-4 border-t-2 border-primary/50 bg-primary/5">
                     <span className="font-bold text-sm sm:text-base text-primary tracking-tight">TOTAL ESTIMATED TAX</span>
                     <span className="font-bold font-mono text-sm sm:text-base text-primary">{formatCurrency(taxAmount)}</span>
                 </div>
            </CardContent>
        </Card>

        {/* Floating Action Button - Centered */}
        {selectedItems.size > 0 && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideInUp transition-all duration-300 ease-out">
                <Button
                    size="lg"
                    className={cn(
                        "shadow-2xl rounded-full text-sm sm:text-base px-5 py-3 sm:px-6 sm:py-3",
                        "bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700", // Light mode gradient
                        "dark:bg-gradient-to-r dark:from-primary dark:to-purple-700 dark:hover:from-primary/90 dark:hover:to-purple-800", // Dark mode gradient (Purple only)
                        "text-primary-foreground animate-glow flex items-center gap-2 ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                    )}
                    onClick={handleOpenModal}
                    aria-label={`Email your representative about ${selectedItems.size} selected item(s)`}
                 >
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5"/>
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
