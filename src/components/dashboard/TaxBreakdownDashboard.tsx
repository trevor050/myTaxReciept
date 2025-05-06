
// src/components/dashboard/TaxBreakdownDashboard.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { TaxSpending, TaxSpendingSubItem, SelectedItem } from '@/services/tax-spending';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, Sector } from 'recharts'; // Added Sector
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Import Label

// --- Import ALL potentially used Lucide icons ---
import {
    ExternalLink, Info, Scale, HeartPulse, ShieldCheck, Briefcase, GraduationCap, Wheat,
    Building, Atom, Globe, Landmark, Sprout, Train, TrendingDown, Crosshair, HelpCircle,
    Megaphone, CheckSquare, AlertTriangle, Clock, DollarSign, Wind, Smile, Music2, Music,
    Coffee, Mail, Newspaper, Footprints, Podcast, BookOpen, SprayCan, Tv, Puzzle, EggFried,
    ShoppingCart, Dumbbell, NotebookPen, Utensils, Users, Tractor, WashingMachine, Dice5,
    Cookie, Film, Clapperboard, HandHeart, Hammer, Trophy, ChefHat, Car, Map as MapIcon,
    Presentation, Plane, Sparkles, PlaneTakeoff, Navigation, Wrench, Youtube, Building2, MapPinned,
    BrainCircuit, Luggage, CalendarDays, HelpingHand, MountainSnow, ClipboardCheck,
    PaintRoller, PenTool, Move, Languages, Gamepad2, Trees, ShoppingBasket, Flower2,
    GlassWater, Package, Bus, Croissant, Beer, Ticket, Truck, Martini, Grape, Shirt, Backpack, Headphones, Tent, Tablet, Theater, Bike, Watch, Home, Laptop, Smartphone, ShoppingBag, CircleDot, Pizza, Sandwich, Bed, PersonStanding, Armchair, Fish, Phone,
    Medal, Gavel, // Added Medal for Veterans, Gavel for Law Enforcement
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
    TooltipProvider,
    Tooltip as ShadTooltip, // Renamed ShadCN Tooltip to avoid conflict with RechartsTooltip
    TooltipContent,
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
    Move, Languages, Gamepad2, Trees, ShoppingBasket, Flower2, Pizza, Sandwich, Bike, Phone, Fish,

    // Currency Icons
    GlassWater, Package, Bus, Croissant, Beer, Ticket, Truck, Martini, Grape, Shirt, Backpack, Headphones, Tent, Tablet, Theater, Watch, Home, Laptop, Smartphone, ShoppingBag, CircleDot, Bed, PersonStanding, Armchair,

    // Explicitly map Burger usage to Utensils
    Burger: Utensils,
    // Map Golf usage to CircleDot
    Golf: CircleDot,
    // Map UserTie usage to PersonStanding (placeholder)
    UserTie: PersonStanding,

    // Main Category Icons - Ensuring specific mapping for all 14 categories + Government + Housing and Community
    "Health": HeartPulse,
    "War and Weapons": ShieldCheck,
    "Interest on Debt": TrendingDown,
    "Veterans": Medal,
    "Unemployment and Labor": Briefcase,
    "Education": GraduationCap,
    "Food and Agriculture": Wheat,
    "Government": Landmark, // Added Government mapping
    "Housing and Community": Home, // Ensured Housing and Community is mapped
    "Energy and Environment": Sprout,
    "International Affairs": Globe,
    "Law Enforcement": Gavel,
    "Transportation": Train,
    "Science": Atom,
    // Fallback/General Icons - already part of the initial import list
    HelpCircle, Info, Scale, Crosshair, Building, Megaphone, CheckSquare, AlertTriangle,
};

const DefaultIcon = HelpCircle;

// State for pre-calculated perspectives
interface PerspectiveData {
  currency: CombinedCurrencyPerspective[] | null;
  time: CombinedPerspective[] | null;
}

// --- Tooltip Components ---
const CustomPieTooltip = ({ active, payload, totalAmount, hourlyWage, displayMode, perspectiveData, isMobile }: any) => {
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

    const content = (
        <div className="rounded-lg border bg-popover p-2 sm:p-2.5 text-popover-foreground shadow-lg animate-scaleIn text-[10px] sm:text-xs max-w-[160px] sm:max-w-[220px]"> {/* Adjusted padding and font size for mobile */}
             <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-1 sm:gap-2"> {/* Adjusted spacing for mobile */}
                 <span className="font-medium flex items-center gap-1 sm:gap-1.5 truncate">
                    <CategoryIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" /> {/* Adjusted icon size for mobile */}
                    {data.category}
                 </span>
                <span className="font-mono text-muted-foreground shrink-0">{data.percentage.toFixed(1)}%</span>
            </div>
             <div className="font-semibold text-xs sm:text-sm md:text-base cursor-default text-left"> {/* Adjusted font size for mobile */}
                {displayValue}
             </div>
        </div>
    );

    // On mobile, the perspective content is shown inside the main tooltip, no separate hover needed
    if (isMobile) {
        return (
            <div className="rounded-lg border bg-popover p-2 sm:p-2.5 text-popover-foreground shadow-lg animate-scaleIn text-[10px] sm:text-xs max-w-[200px] sm:max-w-[280px]">
                 <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-1 sm:gap-2">
                     <span className="font-medium flex items-center gap-1 sm:gap-1.5 truncate">
                        <CategoryIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
                        {data.category}
                     </span>
                    <span className="font-mono text-muted-foreground shrink-0">{data.percentage.toFixed(1)}%</span>
                </div>
                 <div className="font-semibold text-xs sm:text-sm md:text-base cursor-default text-left mb-1.5 sm:mb-2">
                    {displayValue}
                 </div>
                {perspectiveList && perspectiveList.length > 0 && (
                    <>
                        <hr className="my-1.5 sm:my-2 border-border/50" />
                        <p className="text-popover-foreground text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5">{perspectiveTitle}</p>
                        <ul className="space-y-1 sm:space-y-1.5 text-popover-foreground/90 max-h-32 sm:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            {perspectiveList.map((item, index) => {
                                const Icon = item.icon ? iconComponents[item.icon] || Info : Info;
                                return (
                                    <li key={index} className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px]">
                                        <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0"/>
                                        <span>{item.description}{item.count > 1 ? ` (${item.count} times)` : ''}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>
        );
    }

    // Desktop hover tooltip
    return (
        <ShadTooltip>
            <TooltipTrigger asChild>
                {content}
            </TooltipTrigger>
            <PerspectiveTooltipContent
                perspectiveList={perspectiveList}
                title={perspectiveTitle}
            />
        </ShadTooltip>
    );
  }
  return null;
};

const PerspectiveTooltipContent = ({ perspectiveList, title }: { perspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null, title: string}) => {
    if (!perspectiveList || perspectiveList.length === 0) {
        return null;
    }

    return (
        <TooltipContent side="top" align="center" className="max-w-[200px] sm:max-w-xs text-xs sm:text-sm bg-popover border shadow-xl p-3 sm:p-4 rounded-lg animate-scaleIn z-50">
            <p className="text-popover-foreground text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{title}</p>
            <ul className="space-y-1 sm:space-y-1.5 text-popover-foreground/90 max-h-48 sm:max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {perspectiveList.map((item, index) => {
                    const Icon = item.icon ? iconComponents[item.icon] || Info : Info;
                    return (
                        <li key={index} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0"/>
                            <span>{item.description}{item.count > 1 ? ` (${item.count} times)` : ''}</span>
                        </li>
                    );
                })}
            </ul>
        </TooltipContent>
    );
};

const ItemInfoTooltipContent = ({ subItem }: { subItem: TaxSpendingSubItem }) => { // Removed isMobile as it's handled by TooltipProvider
    return (
        <TooltipContent side="top" align="center" className="max-w-[200px] sm:max-w-sm text-xs sm:text-sm bg-popover border shadow-xl p-2.5 sm:p-3 rounded-lg animate-scaleIn z-50">
            <p className="font-semibold mb-1 sm:mb-1.5 text-popover-foreground">{subItem.description}</p>
            {subItem.tooltipText && <p className="text-muted-foreground text-[10px] sm:text-xs leading-relaxed mb-1.5 sm:mb-2">{subItem.tooltipText}</p>}
            {subItem.wikiLink && (
                <a
                href={subItem.wikiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2"
                onClick={(e) => e.stopPropagation()}
                >
                Learn More <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </a>
            )}
        </TooltipContent>
    );
}
// --- End Tooltip Components ---

const CustomLegend = (props: any) => {
  const { payload } = props;
  const [chartWidth, setChartWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) {
      return null;
  }

  const maxItemWidth = chartWidth > 300 ? (chartWidth > 400 ? '150px' : '120px') : '80px';

  return (
    <ul className="flex flex-wrap justify-center gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-1.5 text-[10px] sm:text-xs mt-3 sm:mt-4 list-none p-0 max-w-full mx-auto">
      {payload.map((entry: any, index: number) => {
          const percentage = entry.payload?.percentage;
          return (
            <li key={`item-${index}`} className="flex items-center space-x-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              <span style={{ backgroundColor: entry.color }} className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full inline-block shrink-0"></span>
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
  const [isClient, setIsClient] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);


  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Ensure perspective data is calculated only on client after mount
    if (typeof window !== 'undefined') {
        const currentYear = new Date().getFullYear();
        const date = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setClientDueDate(date);
        getFormattedNationalDebt().then(setNationalDebt);

        const newChartPerspectives: Record<string, PerspectiveData> = {};
        taxSpending.forEach(item => {
            const spendingAmount = (item.percentage / 100) * taxAmount;
            newChartPerspectives[item.category] = {
                currency: generateCurrencyPerspectiveList(spendingAmount, isMobileView ? 3 : 5),
                time: hourlyWage ? generateCombinedPerspectiveList((spendingAmount / hourlyWage) * 60, isMobileView ? 3: 5) : null,
            };
        });
        setChartPerspectiveData(newChartPerspectives);

        const newAccordionPerspectives: Record<string, PerspectiveData> = {};
        taxSpending.forEach(category => {
            const categoryAmount = (category.percentage / 100) * taxAmount;
            newAccordionPerspectives[category.id || category.category] = {
                currency: generateCurrencyPerspectiveList(categoryAmount),
                time: hourlyWage ? generateCombinedPerspectiveList((categoryAmount / hourlyWage) * 60) : null,
            };
            category.subItems?.forEach(subItem => {
                const subItemAmount = subItem.amountPerDollar * taxAmount;
                 newAccordionPerspectives[subItem.id] = {
                    currency: generateCurrencyPerspectiveList(subItemAmount),
                    time: hourlyWage ? generateCombinedPerspectiveList((subItemAmount / hourlyWage) * 60) : null,
                };
            });
        });
        setAccordionPerspectiveData(newAccordionPerspectives);

        setTotalPerspectiveData({
            currency: generateCurrencyPerspectiveList(taxAmount),
            time: hourlyWage ? generateCombinedPerspectiveList((taxAmount / hourlyWage) * 60) : null,
        });
    }

    return () => window.removeEventListener('resize', checkMobile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, taxAmount, hourlyWage, taxSpending, displayMode, isMobileView]);


  // State for pre-calculated perspectives for chart tooltips
  const [chartPerspectiveData, setChartPerspectiveData] = useState<Record<string, PerspectiveData>>({});
  // State for pre-calculated perspectives for accordion items
  const [accordionPerspectiveData, setAccordionPerspectiveData] = useState<Record<string, PerspectiveData>>({});
   // State for pre-calculated perspectives for total row
  const [totalPerspectiveData, setTotalPerspectiveData] = useState<PerspectiveData | null>(null);


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

   const currentYear = isClient ? new Date().getFullYear() : new Date().getFullYear();
   const dueDateDisplay = clientDueDate || (currentYear ? `April 15, ${currentYear + 1}` : 'April 15');

  const chartData = taxSpending.map(item => ({
    category: item.category,
    percentage: item.percentage,
  }));

  const responsivePieHeight = isMobileView ? 260 : 320;
  const responsiveOuterRadius = isMobileView ? 65 : (isClient && window.innerWidth < 768 ? 80 : 100);
  const responsiveInnerRadius = isMobileView ? 35 : (isClient && window.innerWidth < 768 ? 50 : 65);


  return (
    <TooltipProvider delayDuration={isMobileView ? 0 : 200}>
        <div className="space-y-6 sm:space-y-10 animate-fadeIn relative pb-10"> {/* Adjusted spacing for mobile */}
            <div className="text-center space-y-0.5 sm:space-y-1 mb-4 sm:mb-6 relative"> {/* Adjusted spacing for mobile */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">{currentYear ? `${currentYear} ` : ''}Federal Income Tax Receipt</h1> {/* Adjusted font size for mobile */}
                <p className="text-base sm:text-lg text-muted-foreground">Based on your estimated <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span> payment.</p> {/* Adjusted font size for mobile */}
                <p className="text-xs text-muted-foreground/70">Next Filing Due: {dueDateDisplay}</p>
            </div>


            {/* Currency/Time Toggle Button */}
            {hourlyWage !== null && (
                <div className="flex justify-center items-center my-4 sm:my-6"> {/* Centered and adjusted margin */}
                    <Label htmlFor="display-mode-toggle" className="text-xs font-medium text-muted-foreground mr-2 sm:mr-3">View as:</Label> {/* Adjusted margin */}
                    <div className="flex items-center space-x-1 sm:space-x-2 bg-muted p-0.5 sm:p-1 rounded-full shadow-sm"> {/* Added shadow */}
                        <Button
                            variant={displayMode === 'currency' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setDisplayMode('currency')}
                            className={cn("rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 h-7 sm:h-8 text-[10px] sm:text-xs transition-all duration-200", displayMode === 'currency' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/80')}
                            aria-pressed={displayMode === 'currency'}
                        >
                            <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> Currency {/* Adjusted icon size and margin */}
                        </Button>
                        <Button
                             variant={displayMode === 'time' ? 'default' : 'ghost'}
                             size="sm"
                             onClick={() => setDisplayMode('time')}
                             className={cn("rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 h-7 sm:h-8 text-[10px] sm:text-xs transition-all duration-200", displayMode === 'time' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/80')}
                             aria-pressed={displayMode === 'time'}
                        >
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> Time Worked {/* Adjusted icon size and margin */}
                        </Button>
                    </div>
                </div>
            )}

            <Alert className="mb-6 sm:mb-8 shadow-sm rounded-lg border border-primary/20 bg-primary/5 text-foreground animate-fadeIn delay-500 duration-3000">
                 <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 stroke-primary" />
                <AlertTitle className="font-semibold text-primary text-sm sm:text-base">Make Your Voice Heard!</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm text-foreground/90 space-y-1 sm:space-y-1.5">
                    Understanding where your money goes is the first step. The next is action.
                    <span className="block">Your elected officials work for you. Let them know how you feel about these spending priorities. Select specific items below that concern you and use the button to draft a direct message.</span>
                     <Button variant="link" className="p-0 h-auto ml-0 text-primary font-medium text-xs sm:text-sm mt-1" onClick={() => {if (typeof window !== 'undefined') window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer')}}>
                        Find Your Officials <ExternalLink className="inline ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                </AlertDescription>
            </Alert>

          <div className="mb-8 sm:mb-12">
             <h2 className="text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4">Spending Overview</h2>

                  <ResponsiveContainer width="100%" height={responsivePieHeight}>
                    <PieChart margin={{ top: isMobileView ? 20 : 5, right: 5, bottom: 5, left: 5 }}>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={responsiveOuterRadius}
                        innerRadius={responsiveInnerRadius}
                        fill="#8884d8"
                        paddingAngle={1}
                        dataKey="percentage"
                        nameKey="category"
                        activeIndex={activePieIndex ?? undefined}
                        activeShape={({ cx, cy, innerRadius: ir, outerRadius: or, startAngle, endAngle, fill, payload: piePayload }) => ( // Corrected activeShape destructuring
                            <g>
                                <Sector
                                    cx={cx}
                                    cy={cy}
                                    innerRadius={ir}
                                    outerRadius={or + (isMobileView ? 3 : 5)}
                                    startAngle={startAngle}
                                    endAngle={endAngle}
                                    fill={fill}
                                    stroke={'hsl(var(--foreground))'}
                                    strokeWidth={1}
                                />
                            </g>
                        )}
                        onMouseEnter={(_, index) => !isMobileView && setActivePieIndex(index)}
                        onMouseLeave={() => !isMobileView && setActivePieIndex(null)}
                        onClick={(_, index) => {
                            if (isMobileView) {
                                setActivePieIndex(activePieIndex === index ? null : index);
                            }
                        }}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={'hsl(var(--background))'} strokeWidth={1} />
                        ))}
                      </Pie>
                       <RechartsTooltip
                         content={({ active, payload }) => { // Simplified destructuring
                            const currentPayload = payload && payload.length ? payload[0].payload : null;
                            if ((active || (isMobileView && activePieIndex !== null && currentPayload?.category === chartData[activePieIndex ?? -1]?.category)) && currentPayload) { // Guard against -1 index
                                return (
                                    <CustomPieTooltip
                                        active={active}
                                        payload={payload} // Pass the full payload
                                        totalAmount={taxAmount}
                                        hourlyWage={hourlyWage}
                                        displayMode={displayMode}
                                        perspectiveData={chartPerspectiveData[currentPayload.category] || { currency: null, time: null }}
                                        isMobile={isMobileView}
                                    />
                                );
                            }
                            return null;
                         }}
                         cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.4 }}
                         wrapperStyle={{ zIndex: 100 }}
                        />
                       <Legend content={<CustomLegend />} wrapperStyle={{ maxWidth: '100%', overflow: 'hidden' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                 <p className="text-xs text-muted-foreground text-center mt-3 sm:mt-4 flex items-center justify-center gap-1 px-2">
                    <Info className="h-3 w-3" /> {isMobileView ? "Tap segments" : "Hover over segments"} or values for details. Estimated data.
                 </p>
          </div>

           <Card className="shadow-lg border border-border/60 rounded-xl overflow-hidden bg-gradient-to-b from-card to-card/95">
                <CardHeader className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 border-b border-border/50">
                    <CardTitle className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">Detailed Spending</CardTitle>
                    <CardDescription className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">Select items you believe need funding adjustments or prioritize balancing the budget.</CardDescription>
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
                                    <AccordionTrigger className="hover:no-underline py-2.5 px-3 sm:py-3 sm:px-4 rounded-none hover:bg-accent/50 data-[state=open]:bg-accent/40 transition-colors duration-150 text-left">
                                         <div className="flex justify-between items-center w-full gap-1.5 sm:gap-2 md:gap-3">
                                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                                <CategoryIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                                                <span className="font-medium text-xs sm:text-sm truncate flex-1">{item.category}</span>
                                            </div>
                                            <div className="text-right shrink-0 flex items-baseline gap-1 ml-auto">
                                                <ShadTooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="font-semibold font-mono text-xs sm:text-sm cursor-default">{categoryDisplayValue}</span>
                                                    </TooltipTrigger>
                                                     <PerspectiveTooltipContent
                                                        perspectiveList={categoryPerspectiveList}
                                                        title={categoryPerspectiveTitle}
                                                    />
                                                </ShadTooltip>
                                                <span className="text-muted-foreground text-[10px] sm:text-xs font-mono hidden sm:inline">({item.percentage.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent
                                        className="bg-background/30 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden"
                                    >
                                        <div className="pl-6 pr-2 sm:pl-8 sm:pr-3 md:pl-10 md:pr-4 pt-2.5 pb-3 sm:pt-3 sm:pb-4 text-muted-foreground space-y-2 sm:space-y-2.5">
                                         {isInterestOnDebt ? (
                                             <Alert variant="destructive" className="bg-destructive/5 border-destructive/30 shadow-inner p-3 sm:p-4">
                                                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 stroke-destructive/80 mt-0.5 sm:mt-1" />
                                                  <AlertTitle className="text-destructive/95 font-semibold mb-1 text-sm sm:text-base">National Debt Burden: {nationalDebt}</AlertTitle>
                                                 <AlertDescription className="text-xs sm:text-sm text-destructive/90 dark:text-destructive/85 leading-relaxed space-y-1.5 sm:space-y-2">
                                                     <p>This staggering amount paid just on <strong className="font-medium">interest</strong> is a direct consequence of sustained government spending exceeding revenue—often driven by tax cuts favoring the wealthy, unfunded wars, and economic bailouts.</p>
                                                     <p>High interest payments <strong className="font-medium">divert critical funds</strong> from essential public services, infrastructure, education, and potential tax relief, raising serious questions about long-term fiscal stability and government accountability.</p>
                                                     <div className="flex items-center space-x-1.5 sm:space-x-2 pt-2 sm:pt-3">
                                                          <Checkbox
                                                            id="balance-budget"
                                                            checked={balanceBudgetChecked}
                                                            onCheckedChange={handleBudgetCheckboxChange}
                                                            aria-label="Prioritize Balancing the Budget"
                                                            className="rounded-[4px] border-destructive/70 data-[state=checked]:bg-destructive/80 data-[state=checked]:border-destructive/80 h-3.5 w-3.5 sm:h-4 sm:w-4"
                                                          />
                                                         <Label htmlFor="balance-budget" className="text-[10px] sm:text-xs font-medium text-destructive/95 dark:text-destructive/85 cursor-pointer">
                                                            Prioritize Balancing the Budget & Reducing Debt
                                                         </Label>
                                                      </div>
                                                 </AlertDescription>
                                             </Alert>
                                         ) : hasSubItems ? (
                                            <ul className="space-y-1.5 sm:space-y-2">
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
                                                         <li key={subItem.id} className="flex justify-between items-center text-[10px] sm:text-xs gap-1.5 sm:gap-2 group/subitem">
                                                             <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                                                                <Checkbox
                                                                   id={`subitem-${item.id}-${subItem.id}`}
                                                                   checked={isSelected}
                                                                   onCheckedChange={(checked) => handleCheckboxChange(checked, subItem)}
                                                                   aria-label={`Select ${subItem.description}`}
                                                                   className="mt-0 shrink-0 rounded-[4px] h-3.5 w-3.5 sm:h-4 sm:w-4"
                                                                />
                                                               <ShadTooltip>
                                                                    <TooltipTrigger asChild>
                                                                         <label
                                                                            htmlFor={`subitem-${item.id}-${subItem.id}`}
                                                                            className={cn(
                                                                                "truncate cursor-pointer hover:text-foreground transition-colors flex items-center gap-0.5 sm:gap-1 flex-1",
                                                                                isSelected ? "text-foreground font-medium" : ""
                                                                            )}
                                                                         >
                                                                         <span>
                                                                            {subItem.description}
                                                                            {(subItem.tooltipText || subItem.wikiLink) && <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-40 group-hover/subitem:opacity-100 transition-opacity shrink-0 inline-block ml-1"/>}
                                                                         </span>
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
                     <div className="flex justify-between items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 border-t-2 border-primary/50 bg-primary/5">
                         <span className="font-bold text-xs sm:text-sm md:text-base text-primary tracking-tight">TOTAL ESTIMATED TAX</span>
                          <ShadTooltip>
                             <TooltipTrigger asChild>
                                 <span className="font-bold font-mono text-xs sm:text-sm md:text-base text-primary cursor-default">
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






