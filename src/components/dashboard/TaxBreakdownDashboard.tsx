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
    Cookie, Film, Clapperboard, HandHeart, Hammer, Trophy, ChefHat, Car, Map as MapIcon, // Renamed Map to MapIcon
    Presentation, Plane, Sparkles, PlaneTakeoff, Navigation, Wrench, Youtube, Building2, MapPinned,
    BrainCircuit, Luggage, CalendarDays, HelpingHand, MountainSnow, ClipboardCheck,
    PaintRoller, PenTool, Move, Languages, Gamepad2, Trees, ShoppingBasket, Flower2, // Added new icons
    GlassWater, Package, Bus, Croissant, Beer, Ticket, Truck, Martini, Grape, Shirt, Backpack, Headphones, Tent, Tablet, Theater, Bike, Watch, Home, Laptop, Smartphone, ShoppingBag, CircleDot, Pizza, Sandwich, Bed, PersonStanding, Armchair, Fish, Phone, // Currency Icons - Removed Burger, Golf, UserTie | Added Armchair, Fish, Phone
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
import { generateCombinedPerspectiveList, type CombinedPerspective } from '@/lib/time-perspective'; 
import { generateCurrencyPerspectiveList, type CombinedCurrencyPerspective } from '@/lib/currency-perspective'; 

interface TaxBreakdownDashboardProps {
  taxAmount: number;
  hourlyWage: number | null; 
  taxSpending: TaxSpending[];
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

const iconComponents: { [key: string]: LucideIcon } = {
    // Time Icons
    Wind, Smile, Music2, Music, Coffee, Mail, Newspaper, Footprints, Podcast, BookOpen, SprayCan,
    Tv, Puzzle, EggFried, ShoppingCart, Dumbbell, NotebookPen, Utensils, Users, Tractor, WashingMachine,
    Dice5, Cookie, Film, Clapperboard, HandHeart, Hammer, Trophy, ChefHat, Car, Map: MapIcon, 
    Presentation, Plane, Sparkles, PlaneTakeoff, Navigation, Wrench, Youtube, Building2, MapPinned, BrainCircuit,
    Luggage, CalendarDays, HelpingHand, MountainSnow, ClipboardCheck, PaintRoller, PenTool,
    Move, Languages, Gamepad2, Trees, ShoppingBasket, Flower2, Pizza, Sandwich, Bike, Phone, Fish, // Added Phone, Fish

    // Currency Icons
    GlassWater, Package, Bus, Croissant, Beer, Ticket, Truck, Martini, Grape, Shirt, Backpack, Headphones, Tent, Tablet, Theater, Watch, Home, Laptop, Smartphone, ShoppingBag, CircleDot, Bed, PersonStanding, Armchair, // Added Armchair

    // Explicitly map Burger usage to Utensils
    Burger: Utensils, 
    // Map Golf usage to CircleDot
    Golf: CircleDot, 
    // Map UserTie usage to PersonStanding (placeholder)
    UserTie: PersonStanding,

    // Main Category Icons
    HeartPulse, Crosshair, TrendingDown, ShieldCheck, Briefcase, GraduationCap, Wheat, Landmark, Building,
    Sprout, Globe, Scale, Train, Atom, HelpCircle,
};

const DefaultIcon = HelpCircle;

// State for pre-calculated perspectives
interface PerspectiveData {
  currency: CombinedCurrencyPerspective[] | null;
  time: CombinedPerspective[] | null;
}

// --- Tooltip Components ---
const CustomPieTooltip = ({ active, payload, totalAmount, hourlyWage, displayMode, perspectiveData }: any) => {
  if (active && payload && payload.length && perspectiveData) {
    const data = payload[0].payload; // data here is for the specific pie slice
    const iconKey = data.category; // Use category name for icon lookup
    const CategoryIcon = iconComponents[iconKey] || DefaultIcon;

    let displayValue: string;
    let perspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null = null;
    let perspectiveTitle = '';

    if (displayMode === 'time' && hourlyWage) {
        const spendingAmount = (data.percentage / 100) * totalAmount;
        const hoursWorked = spendingAmount / hourlyWage;
        const totalMinutes = hoursWorked * 60;
        displayValue = formatTime(totalMinutes);
        perspectiveList = perspectiveData.time;
        perspectiveTitle = 'In this time, you could have:';
    } else {
        const spendingAmount = (data.percentage / 100) * totalAmount;
        displayValue = formatCurrency(spendingAmount);
        perspectiveList = perspectiveData.currency;
        perspectiveTitle = 'With this amount, you could buy:';
    }

    return (
        <div className="rounded-lg border bg-popover p-2.5 text-popover-foreground shadow-lg animate-scaleIn text-xs max-w-[180px] sm:max-w-[220px]">
             <div className="flex items-center justify-between mb-1 gap-2">
                 <span className="font-medium flex items-center gap-1.5 truncate">
                    <CategoryIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    {data.category}
                 </span>
                <span className="font-mono text-muted-foreground shrink-0">{data.percentage.toFixed(1)}%</span>
            </div>
             <ShadTooltip>
                <TooltipTrigger asChild>
                     <div className="font-semibold text-sm sm:text-base cursor-default text-left">
                        {displayValue}
                     </div>
                </TooltipTrigger>
                <PerspectiveTooltipContent
                    perspectiveList={perspectiveList}
                    title={perspectiveTitle}
                />
             </ShadTooltip>
        </div>
    );
  }
  return null;
};

const PerspectiveTooltipContent = ({ perspectiveList, title }: { perspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null, title: string }) => {
    if (!perspectiveList || perspectiveList.length === 0) {
        return null;
    }

    return (
        <TooltipContent side="top" align="center" className="max-w-xs text-sm bg-popover border shadow-xl p-4 rounded-lg animate-scaleIn z-50">
            <p className="text-popover-foreground text-sm font-semibold mb-2">{title}</p>
            <ul className="space-y-1.5 text-popover-foreground/90 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {perspectiveList.map((item, index) => {
                    const Icon = item.icon ? iconComponents[item.icon] || Info : Info;
                    return (
                        <li key={index} className="flex items-center gap-2 text-xs">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0"/>
                            <span>{item.description}{item.count > 1 ? ` (${item.count} times)` : ''}</span>
                        </li>
                    );
                })}
            </ul>
        </TooltipContent>
    );
};

const ItemInfoTooltipContent = ({ subItem }: { subItem: TaxSpendingSubItem }) => {
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
                onClick={(e) => e.stopPropagation()} 
                >
                Learn More <ExternalLink className="h-3 w-3" />
                </a>
            )}
        </TooltipContent>
    );
}
// --- End Tooltip Components ---

const CustomLegend = (props: any) => {
  const { payload } = props;
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const chartContainer = document.querySelector('.recharts-responsive-container');
        if (chartContainer) {
            setChartWidth(chartContainer.clientWidth);
        }
        const handleResize = () => {
            if (chartContainer) {
                setChartWidth(chartContainer.clientWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

const formatCurrency = (amount: number | null | undefined): string => {
     if (typeof amount !== 'number' || isNaN(amount)) {
      return '$--.--';
    }
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
     if (hours === 0 && minutes === 0 && totalMinutes > 0) { 
        return '< 1 min';
    }
    return result.trim();
}

async function getFormattedNationalDebt(): Promise<string> {
    try {
        const debtAmount = 34600000000000; 
        if (isNaN(debtAmount)) {
            return 'currently over $34 trillion';
        }
        if (debtAmount >= 1e12) {
            return `currently over $${(debtAmount / 1e12).toFixed(1)} trillion`;
        } else if (debtAmount >= 1e9) {
            return `currently over $${(debtAmount / 1e9).toFixed(1)} billion`;
        } else {
            return `currently $${debtAmount.toLocaleString()}`;
        }
    } catch (error) {
        console.error("Error fetching national debt:", error);
        return 'currently over $34 trillion'; 
    }
}

export default function TaxBreakdownDashboard({
  taxAmount,
  hourlyWage, 
  taxSpending,
  onSelectionChange, 
}: TaxBreakdownDashboardProps) {

  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [clientDueDate, setClientDueDate] = useState<string | null>(null);
  const [nationalDebt, setNationalDebt] = useState<string>('fetching...');
  const [balanceBudgetChecked, setBalanceBudgetChecked] = useState(false);
  const [displayMode, setDisplayMode] = useState<'currency' | 'time'>('currency');

  // State for pre-calculated perspectives for chart tooltips
  const [chartPerspectiveData, setChartPerspectiveData] = useState<Record<string, PerspectiveData>>({});
  // State for pre-calculated perspectives for accordion items
  const [accordionPerspectiveData, setAccordionPerspectiveData] = useState<Record<string, PerspectiveData>>({});
   // State for pre-calculated perspectives for total row
  const [totalPerspectiveData, setTotalPerspectiveData] = useState<PerspectiveData | null>(null);


   useEffect(() => {
    if (typeof window !== 'undefined') {
        const currentYear = new Date().getFullYear();
        const date = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setClientDueDate(date);
        getFormattedNationalDebt().then(setNationalDebt);

        // Pre-calculate perspectives for chart and accordion items
        const newChartPerspectives: Record<string, PerspectiveData> = {};
        taxSpending.forEach(item => {
            const spendingAmount = (item.percentage / 100) * taxAmount;
            newChartPerspectives[item.category] = {
                currency: generateCurrencyPerspectiveList(spendingAmount, 5), // Show fewer items in pie tooltip
                time: hourlyWage ? generateCombinedPerspectiveList((spendingAmount / hourlyWage) * 60, 5) : null,
            };
        });
        setChartPerspectiveData(newChartPerspectives);

        const newAccordionPerspectives: Record<string, PerspectiveData> = {};
        taxSpending.forEach(category => {
            // Category level
            const categoryAmount = (category.percentage / 100) * taxAmount;
            newAccordionPerspectives[category.id || category.category] = {
                currency: generateCurrencyPerspectiveList(categoryAmount),
                time: hourlyWage ? generateCombinedPerspectiveList((categoryAmount / hourlyWage) * 60) : null,
            };
            // Sub-item level
            category.subItems?.forEach(subItem => {
                const subItemAmount = subItem.amountPerDollar * taxAmount;
                 newAccordionPerspectives[subItem.id] = {
                    currency: generateCurrencyPerspectiveList(subItemAmount),
                    time: hourlyWage ? generateCombinedPerspectiveList((subItemAmount / hourlyWage) * 60) : null,
                };
            });
        });
        setAccordionPerspectiveData(newAccordionPerspectives);

        // Pre-calculate for total row
        setTotalPerspectiveData({
            currency: generateCurrencyPerspectiveList(taxAmount),
            time: hourlyWage ? generateCombinedPerspectiveList((taxAmount / hourlyWage) * 60) : null,
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxAmount, hourlyWage, taxSpending, displayMode]); // Rerun if these change, including displayMode for potential optimization

    useEffect(() => {
        const count = selectedItems.size + (balanceBudgetChecked ? 1 : 0);
        onSelectionChange(count > 0, count, selectedItems, balanceBudgetChecked);
    }, [selectedItems, balanceBudgetChecked, onSelectionChange]);

   const handleCheckboxChange = (checked: boolean | 'indeterminate', item: TaxSpendingSubItem) => {
        const newSelectedItems = new Map(selectedItems);
        const itemId = `${item.id}`; 
        if (checked === true) {
            newSelectedItems.set(itemId, { id: itemId, description: item.description, fundingLevel: 0, category: item.category }); 
        } else {
            newSelectedItems.delete(itemId);
        }
        setSelectedItems(newSelectedItems);
    };

    const handleBudgetCheckboxChange = (checked: boolean | 'indeterminate') => {
        setBalanceBudgetChecked(checked === true);
    }

   const currentYear = typeof window !== 'undefined' ? new Date().getFullYear() : null;
   const dueDateDisplay = clientDueDate || (currentYear ? `April 15, ${currentYear + 1}` : 'April 15'); 

  const chartData = taxSpending.map(item => ({
    category: item.category,
    percentage: item.percentage,
  }));

  return (
    <TooltipProvider> 
        <div className="space-y-10 animate-fadeIn relative pb-10">
            <div className="text-center space-y-1 mb-6 relative"> 
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{currentYear ? `${currentYear} ` : ''}Federal Income Tax Receipt</h1>
                 <p className="text-lg text-muted-foreground">Based on your estimated <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span> payment.</p>
                <p className="text-xs text-muted-foreground/70">Next Filing Due: {dueDateDisplay}</p>

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

          <div className="mb-12">
             <h2 className="text-xl font-semibold text-center mb-4">Spending Overview</h2>
             
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 100} 
                        innerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 65} 
                        fill="#8884d8"
                        paddingAngle={1}
                        dataKey="percentage"
                        nameKey="category"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={'hsl(var(--background))'} strokeWidth={1} />
                        ))}
                      </Pie>
                       <Tooltip 
                         content={({ active, payload, label: tooltipLabel }) => { // `label` here is the category name from Recharts
                            if (active && payload && payload.length) {
                                return (
                                    <CustomPieTooltip
                                        active={active}
                                        payload={payload}
                                        totalAmount={taxAmount}
                                        hourlyWage={hourlyWage}
                                        displayMode={displayMode}
                                        perspectiveData={chartPerspectiveData[tooltipLabel] || { currency: null, time: null }}
                                    />
                                );
                            }
                            return null;
                         }}
                         cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.4 }} 
                        />
                       <Legend content={<CustomLegend />} wrapperStyle={{ maxWidth: '100%', overflow: 'hidden' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                 <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1 px-2">
                    <Info className="h-3 w-3" /> Hover over segments or values for details. Estimated data.
                 </p>
          </div>

           <Card className="shadow-lg border border-border/60 rounded-xl overflow-hidden bg-gradient-to-b from-card to-card/95">
                <CardHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border/50">
                    <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight">Detailed Spending</CardTitle>
                    <CardDescription className="text-muted-foreground text-xs sm:text-sm">Select items you believe need funding adjustments or prioritize balancing the budget.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Accordion type="multiple" className="w-full">
                        {taxSpending.map((item, index) => {
                            const categoryAmount = (item.percentage / 100) * taxAmount;
                            const categoryIconKey = item.category;
                            const CategoryIcon = iconComponents[categoryIconKey] || DefaultIcon;
                            const isInterestOnDebt = item.category === 'Interest on Debt';
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            const currentCategoryPerspective = accordionPerspectiveData[item.id || item.category] || { currency: null, time: null };
                            let categoryDisplayValue: string;
                            let categoryPerspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null = null;
                            let categoryPerspectiveTitle = '';

                            if (displayMode === 'time' && hourlyWage) {
                                const hoursWorked = categoryAmount / hourlyWage;
                                const totalMinutes = hoursWorked * 60;
                                categoryDisplayValue = formatTime(totalMinutes);
                                categoryPerspectiveList = currentCategoryPerspective.time;
                                categoryPerspectiveTitle = 'In this time, you could have:';
                            } else {
                                categoryDisplayValue = formatCurrency(categoryAmount);
                                categoryPerspectiveList = currentCategoryPerspective.currency;
                                categoryPerspectiveTitle = 'With this amount, you could buy:';
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
                                                        <span className="font-semibold font-mono text-sm cursor-default">{categoryDisplayValue}</span>
                                                    </TooltipTrigger>
                                                     <PerspectiveTooltipContent
                                                        perspectiveList={categoryPerspectiveList}
                                                        title={categoryPerspectiveTitle}
                                                    />
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
                                                  <TrendingDown className="h-5 w-5 stroke-destructive/80 mt-1" /> 
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
                                                    const currentSubItemPerspective = accordionPerspectiveData[subItem.id] || { currency: null, time: null };

                                                    let subItemDisplayValue: string;
                                                    let subItemPerspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null = null;
                                                    let subItemPerspectiveTitle = '';

                                                    if (displayMode === 'time' && hourlyWage) {
                                                        const hoursWorked = subItemAmount / hourlyWage;
                                                        const totalMinutes = hoursWorked * 60;
                                                        subItemDisplayValue = formatTime(totalMinutes);
                                                        subItemPerspectiveList = currentSubItemPerspective.time;
                                                        subItemPerspectiveTitle = 'In this time, you could have:';
                                                    } else {
                                                        subItemDisplayValue = formatCurrency(subItemAmount);
                                                        subItemPerspectiveList = currentSubItemPerspective.currency;
                                                        subItemPerspectiveTitle = 'With this amount, you could buy:';
                                                    }

                                                    return (
                                                         <li key={subItem.id} className="flex justify-between items-center text-xs gap-2 group/subitem">
                                                             <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                <Checkbox
                                                                   id={`subitem-${item.id}-${subItem.id}`}
                                                                   checked={isSelected}
                                                                   onCheckedChange={(checked) => handleCheckboxChange(checked, subItem)}
                                                                   aria-label={`Select ${subItem.description}`}
                                                                   className="mt-0 shrink-0 rounded-[4px]" 
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
                                                                    {(subItem.tooltipText || subItem.wikiLink) && (
                                                                         <ItemInfoTooltipContent subItem={subItem} />
                                                                    )}
                                                                </ShadTooltip>
                                                             </div>
                                                            <ShadTooltip>
                                                                <TooltipTrigger asChild>
                                                                     <span className="font-medium font-mono text-foreground/80 whitespace-nowrap cursor-default">
                                                                        {subItemDisplayValue}
                                                                     </span>
                                                                </TooltipTrigger>
                                                                 <PerspectiveTooltipContent
                                                                     perspectiveList={subItemPerspectiveList}
                                                                     title={subItemPerspectiveTitle}
                                                                 />
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
                     <div className="flex justify-between items-center w-full px-3 sm:px-4 py-3 sm:py-4 border-t-2 border-primary/50 bg-primary/5">
                         <span className="font-bold text-sm sm:text-base text-primary tracking-tight">TOTAL ESTIMATED TAX</span>
                          <ShadTooltip>
                             <TooltipTrigger asChild>
                                 <span className="font-bold font-mono text-sm sm:text-base text-primary cursor-default">
                                   {displayMode === 'time' && hourlyWage && totalPerspectiveData?.time
                                       ? formatTime((taxAmount / hourlyWage) * 60)
                                       : formatCurrency(taxAmount)
                                   }
                                 </span>
                             </TooltipTrigger>
                             <PerspectiveTooltipContent
                                 perspectiveList={
                                     displayMode === 'time' && hourlyWage && totalPerspectiveData?.time
                                         ? totalPerspectiveData.time
                                         : totalPerspectiveData?.currency || null
                                 }
                                 title={
                                     displayMode === 'time' && hourlyWage
                                         ? 'In this total time, you could have:'
                                         : 'With this total amount, you could buy:'
                                 }
                             />
                          </ShadTooltip>
                     </div>
                </CardContent>
            </Card>
        </div>
    </TooltipProvider>
  );
}
