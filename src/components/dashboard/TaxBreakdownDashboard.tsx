// src/components/dashboard/TaxBreakdownDashboard.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { TaxSpending, TaxSpendingSubItem, SelectedItem } from '@/services/tax-spending';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, Sector } from 'recharts'; // Renamed PieChart to RechartsPieChart, Added Sector
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
    Medal, Gavel, FileText, Leaf, Mountain, Vote, Rocket, FlaskConical, Microscope, School, Radio, LibrarySquare, Search, SearchCheck,
    type LucideIcon, Anchor, CloudSun, Eye, Lightbulb, Palette, ShieldAlert, Siren, TramFront, PieChart as LucidePieChart, Activity, Banknote, TrendingUp, Brain,
    ArrowDownRightSquare
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
    Tooltip as ShadTooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import type { CombinedPerspective } from '@/lib/time-perspective';
import type { CombinedCurrencyPerspective } from '@/lib/currency-perspective';
import type { DashboardPerspectives } from '@/types/perspective';


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
  perspectives: DashboardPerspectives | null;
  onOpenEnterHourlyWageModal: () => void;
  shouldAutoSwitchToTimeMode?: boolean; // New prop for auto-switching
  onAutoSwitchToTimeMode?: () => void; // New prop callback
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

    // Main Category Icons
    "Health": HeartPulse,
    "War and Weapons": ShieldCheck,
    "Interest on Debt": TrendingDown,
    "Veterans": Medal,
    "Unemployment and Labor": Briefcase,
    "Education": GraduationCap,
    "Food and Agriculture": Wheat,
    "Government": Landmark,
    "Housing and Community": Building,
    "Energy and Environment": Sprout,
    "International Affairs": Globe,
    "Law Enforcement": Gavel,
    "Transportation": Train,
    "Science": Atom,
    HelpCircle, Info, Scale, Crosshair, Megaphone, CheckSquare, AlertTriangle,
    Anchor, CloudSun, Eye, FlaskConical, LibrarySquare, Lightbulb, Palette, PieChart: LucidePieChart, Radio, Rocket, SearchCheck, ShieldAlert, Siren, TramFront, Vote, Banknote, Activity, FileText, Leaf, Mountain, Search,
    Brain,
    ArrowDownRightSquare,
};

const DefaultIcon = HelpCircle;


// --- Tooltip Components ---
const CustomPieTooltip = ({ active, payload, totalAmount, hourlyWage, displayMode, perspectiveData, isMobile }: any) => {
  if (active && payload && payload.length && perspectiveData) {
    const data = payload[0].payload;
    const iconKey = data.category;
    const CategoryIconComponent = iconComponents[iconKey] || DefaultIcon;

    let displayValue: string;
    let perspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null = null;
    let perspectiveTitle = '';

    const currentCategoryPerspective = perspectiveData[data.category];

    if (displayMode === 'time' && hourlyWage && currentCategoryPerspective?.time) {
        const spendingAmount = (data.percentage / 100) * totalAmount;
        const hoursWorked = spendingAmount / hourlyWage;
        const totalMinutes = hoursWorked * 60;
        displayValue = formatTime(totalMinutes);
        perspectiveList = currentCategoryPerspective.time;
        perspectiveTitle = 'In this time, you could have:';
    } else if (currentCategoryPerspective?.currency) {
        const spendingAmount = (data.percentage / 100) * totalAmount;
        displayValue = formatCurrency(spendingAmount);
        perspectiveList = currentCategoryPerspective.currency;
        perspectiveTitle = 'With this amount, you could buy:';
    } else {
      // Fallback if perspective data is missing for some reason
      const spendingAmount = (data.percentage / 100) * totalAmount;
      displayValue = displayMode === 'time' && hourlyWage ? formatTime(((spendingAmount / hourlyWage) * 60)) : formatCurrency(spendingAmount);
      perspectiveTitle = displayMode === 'time' && hourlyWage ? 'Equivalent work time:' : 'Equivalent spending:';
    }


    const content = (
        <div className="rounded-lg border bg-popover p-2 sm:p-2.5 text-popover-foreground shadow-lg animate-scaleIn text-[10px] sm:text-xs max-w-[160px] sm:max-w-[220px]">
             <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-1 sm:gap-2">
                 <span className="font-medium flex items-center gap-1 sm:gap-1.5 truncate">
                    <CategoryIconComponent className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
                    {data.category}
                 </span>
                <span className="font-mono text-muted-foreground shrink-0">{data.percentage.toFixed(1)}%</span>
            </div>
             <div className="font-semibold text-xs sm:text-sm md:text-base cursor-default text-left">
                {displayValue}
             </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="rounded-lg border bg-popover p-2 sm:p-2.5 text-popover-foreground shadow-lg animate-scaleIn text-[10px] sm:text-xs max-w-[200px] sm:max-w-[280px]">
                 <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-1 sm:gap-2">
                     <span className="font-medium flex items-center gap-1 sm:gap-1.5 truncate">
                        <CategoryIconComponent className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
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
                                const PerspectiveItemIcon = item.icon ? iconComponents[item.icon] || Info : Info;
                                return (
                                    <li key={index} className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px]">
                                        <PerspectiveItemIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0"/>
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
                    const PerspectiveItemIcon = item.icon ? iconComponents[item.icon] || Info : Info;
                    return (
                        <li key={index} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                            <PerspectiveItemIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0"/>
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
        console.error("Error formatting national debt (using static value):", error);
        return 'currently over $34 trillion';
    }
}

export default function TaxBreakdownDashboard({
  taxAmount,
  hourlyWage,
  taxSpending,
  onSelectionChange,
  perspectives,
  onOpenEnterHourlyWageModal,
  shouldAutoSwitchToTimeMode = false,
  onAutoSwitchToTimeMode,
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

    if (typeof window !== 'undefined') {
        const currentYear = new Date().getFullYear();
        const date = new Date(currentYear + 1, 3, 15).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setClientDueDate(date);
        getFormattedNationalDebt().then(setNationalDebt);
    }
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


    useEffect(() => {
        const count = selectedItems.size + (balanceBudgetChecked ? 1 : 0);
        onSelectionChange(count > 0, count, selectedItems, balanceBudgetChecked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItems, balanceBudgetChecked]);

    // Auto-switch to time mode when hourly wage is set from modal
    useEffect(() => {
        if (shouldAutoSwitchToTimeMode && hourlyWage !== null && onAutoSwitchToTimeMode) {
            setDisplayMode('time');
            onAutoSwitchToTimeMode(); // Reset the flag
        }
    }, [shouldAutoSwitchToTimeMode, hourlyWage, onAutoSwitchToTimeMode]);

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

  const responsivePieHeight = isMobileView ? 280 : 320;
  const responsiveOuterRadius = isMobileView ? 70 : (isClient && window.innerWidth < 768 ? 80 : 100);
  const responsiveInnerRadius = isMobileView ? 40 : (isClient && window.innerWidth < 768 ? 50 : 65);

  const handleDisplayModeToggle = (mode: 'currency' | 'time') => {
    if (mode === 'time' && hourlyWage === null) {
        onOpenEnterHourlyWageModal();
    } else {
        setDisplayMode(mode);
    }
  };


  return (
    <TooltipProvider delayDuration={isMobileView ? 0 : 200}>
        <div className="space-y-8 sm:space-y-12 animate-fadeIn relative pb-12">
            {/* Refined Header Section */}
            <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    {currentYear ? `${currentYear} ` : ''}Federal Income Tax Receipt
                </h1>
                <div className="space-y-2">
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Based on your estimated{' '}
                        <span className="font-bold text-primary">
                            {formatCurrency(taxAmount)}
                        </span>{' '}
                        payment.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/30">
                        <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                        <p className="text-sm text-muted-foreground font-medium">Next Filing Due: {dueDateDisplay}</p>
                    </div>
                </div>
            </div>


             {/* Refined Display Mode Toggle */}
             <div className="flex justify-center items-center my-6 sm:my-8">
                <Label htmlFor="display-mode-toggle" className="text-sm font-medium text-muted-foreground mr-3 sm:mr-4">View as:</Label>
                <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg shadow-sm border border-border/40">
                    <Button
                        variant={displayMode === 'currency' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleDisplayModeToggle('currency')}
                        className={cn(
                            "rounded-md px-4 py-2 h-8 text-sm font-medium transition-all duration-200",
                            displayMode === 'currency' 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                        aria-pressed={displayMode === 'currency'}
                    >
                        <DollarSign className="h-4 w-4 mr-2" /> Currency
                    </Button>
                    <Button
                         variant={displayMode === 'time' ? 'default' : 'ghost'}
                         size="sm"
                         onClick={() => handleDisplayModeToggle('time')}
                         className={cn(
                            "rounded-md px-4 py-2 h-8 text-sm font-medium transition-all duration-200",
                            displayMode === 'time' && hourlyWage !== null 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                         )}
                         aria-pressed={displayMode === 'time' && hourlyWage !== null}
                    >
                        <Clock className="h-4 w-4 mr-2" /> Time Worked
                    </Button>
                </div>
            </div>

                         {/* Refined Call-to-Action Alert */}
             <Alert className="mb-8 sm:mb-10 rounded-xl border border-primary/30 bg-primary/5 text-foreground shadow-lg">
                 <div className="flex items-start gap-3">
                     <div className="p-2 rounded-lg bg-primary/20">
                         <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 stroke-primary" />
                     </div>
                     <div className="flex-1 space-y-3">
                         <AlertTitle className="font-bold text-primary text-lg sm:text-xl">
                             Make Your Voice Heard!
                         </AlertTitle>
                         <AlertDescription className="text-sm sm:text-base text-foreground/90 leading-relaxed space-y-3">
                             <p className="font-medium">Understanding where your money goes is the first step. The next is action.</p>
                             <p>Your elected officials work for you. Let them know how you feel about these spending priorities. Select specific items below that concern you and use the button to draft a direct message.</p>
                             <Button 
                                 variant="link" 
                                 className="p-0 h-auto ml-0 text-primary font-semibold text-sm sm:text-base hover:text-primary/80 transition-colors duration-200 group" 
                                 onClick={() => {if (typeof window !== 'undefined') window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer')}}
                             >
                                 Find Your Officials 
                                 <ExternalLink className="inline ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                </AlertDescription>
                     </div>
                 </div>
            </Alert>

          

           {/* Refined Card for Detailed Spending */}
           <Card className="shadow-lg border border-border/40 rounded-xl overflow-hidden bg-card">
                <CardHeader className="px-4 py-5 sm:px-6 sm:py-6 border-b border-border/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                            <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                                Detailed Spending Breakdown
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm sm:text-base mt-1">
                                Interactive breakdown of your tax allocation. Click categories for details and select specific items to address with officials.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                     <Accordion type="multiple" className="w-full" defaultValue={[]}>
                        {taxSpending.map((item, index) => {
                            const categoryAmount = (item.percentage / 100) * taxAmount;
                            const CategoryIconComponent = iconComponents[item.category] || DefaultIcon;
                            const isInterestOnDebt = item.category === 'Interest on Debt';
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            const currentCategoryPerspective = perspectives?.accordion[item.id || item.category] || { currency: null, time: null };
                            let categoryDisplayValue: string;
                            let categoryPerspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null = null;
                            let categoryPerspectiveTitle = '';

                            if (displayMode === 'time' && hourlyWage && currentCategoryPerspective?.time) {
                                const hoursWorked = categoryAmount / hourlyWage;
                                const totalMinutes = hoursWorked * 60;
                                categoryDisplayValue = formatTime(totalMinutes);
                                categoryPerspectiveList = currentCategoryPerspective.time;
                                categoryPerspectiveTitle = 'In this time, you could have:';
                            } else if (currentCategoryPerspective?.currency) {
                                categoryDisplayValue = formatCurrency(categoryAmount);
                                categoryPerspectiveList = currentCategoryPerspective.currency;
                                categoryPerspectiveTitle = 'With this amount, you could buy:';
                            } else {
                               categoryDisplayValue = displayMode === 'time' && hourlyWage ? formatTime(((categoryAmount / hourlyWage) * 60)) : formatCurrency(categoryAmount);
                               categoryPerspectiveTitle = displayMode === 'time' && hourlyWage ? 'Equivalent work time:' : 'Equivalent spending:';
                            }


                            return (
                                 <AccordionItem value={`item-${index}`} key={item.id || index} className="border-b border-border/20 last:border-b-0">
                                    <AccordionTrigger className="hover:no-underline py-4 px-4 sm:py-5 sm:px-6 hover:bg-accent/50 data-[state=open]:bg-accent transition-colors duration-200 text-left">
                                         <div className="flex flex-col w-full gap-3">
                                            {/* Top row: Icon, name, and value */}
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-1.5 rounded-md bg-primary/20">
                                                        <CategoryIconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                                                    </div>
                                                    <span className="font-semibold text-sm sm:text-base truncate">{item.category}</span>
                                                </div>
                                                <div className="text-right shrink-0 flex items-center gap-2">
                                                    <ShadTooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="font-bold font-mono text-sm sm:text-lg cursor-default text-foreground">
                                                                {categoryDisplayValue}
                                                            </span>
                                                        </TooltipTrigger>
                                                         <PerspectiveTooltipContent
                                                            perspectiveList={categoryPerspectiveList}
                                                            title={categoryPerspectiveTitle}
                                                        />
                                                    </ShadTooltip>
                                                </div>
                                            </div>
                                            
                                            {/* Bottom row: Progress bar */}
                                            <div className="flex items-center gap-2 w-full">
                                                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                                        style={{ 
                                                            width: `${item.percentage}%`,
                                                            backgroundColor: COLORS[index % COLORS.length] 
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground font-mono min-w-[45px] text-right">
                                                    {item.percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent
                                        className="bg-muted/20 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden"
                                    >
                                        <div className="pl-6 pr-3 sm:pl-8 sm:pr-4 pt-3 pb-4 text-muted-foreground space-y-2">
                                         {isInterestOnDebt ? (
                                             <Alert variant="destructive" className="bg-destructive/5 border-destructive/30 shadow-inner p-3 sm:p-4">
                                                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 stroke-destructive/80 mt-0.5 sm:mt-1" />
                                                  <AlertTitle className="text-destructive/95 font-semibold mb-1 text-sm sm:text-base">National Debt Burden: {nationalDebt}</AlertTitle>
                                                 <AlertDescription className="text-xs sm:text-sm text-destructive/90 dark:text-destructive/85 leading-relaxed space-y-1.5 sm:space-y-2">
                                                     <p>This staggering amount paid just on <span className="font-medium">interest</span> is a direct consequence of sustained government spending exceeding revenue—often driven by tax cuts favoring the wealthy, unfunded wars, and economic bailouts.</p>
                                                     <p>High interest payments <span className="font-medium">divert critical funds</span> from essential public services, infrastructure, education, and potential tax relief, raising serious questions about long-term fiscal stability and government accountability.</p>
                                                                                                           <div className="flex items-center space-x-2 pt-3">
                                                          <Checkbox
                                                            id="balance-budget"
                                                            checked={balanceBudgetChecked}
                                                            onCheckedChange={handleBudgetCheckboxChange}
                                                            aria-label="Prioritize Balancing the Budget"
                                                            className="h-4 w-4"
                                                          />
                                                         <Label htmlFor="balance-budget" className="text-xs font-medium cursor-pointer">
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
                                                    const currentSubItemPerspectiveData = perspectives?.accordion[subItem.id] || { currency: null, time: null };

                                                    let subItemDisplayValue: string;
                                                    let subItemPerspectiveList: (CombinedPerspective | CombinedCurrencyPerspective)[] | null = null;
                                                    let subItemPerspectiveTitle = '';

                                                    if (displayMode === 'time' && hourlyWage && currentSubItemPerspectiveData?.time) {
                                                        const hoursWorked = subItemAmount / hourlyWage;
                                                        const totalMinutes = hoursWorked * 60;
                                                        subItemDisplayValue = formatTime(totalMinutes);
                                                        subItemPerspectiveList = currentSubItemPerspectiveData.time;
                                                        subItemPerspectiveTitle = 'In this time, you could have:';
                                                    } else if (currentSubItemPerspectiveData?.currency) {
                                                        subItemDisplayValue = formatCurrency(subItemAmount);
                                                        subItemPerspectiveList = currentSubItemPerspectiveData.currency;
                                                        subItemPerspectiveTitle = 'With this amount, you could buy:';
                                                    } else {
                                                       subItemDisplayValue = displayMode === 'time' && hourlyWage ? formatTime(((subItemAmount / hourlyWage) * 60)) : formatCurrency(subItemAmount);
                                                       subItemPerspectiveTitle = displayMode === 'time' && hourlyWage ? 'Equivalent work time:' : 'Equivalent spending:';
                                                    }

                                                    return (
                                                         <li key={subItem.id} className="flex justify-between items-center text-xs gap-2 group/subitem">
                                                             <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <Checkbox
                                                                   id={`subitem-${item.id}-${subItem.id}`}
                                                                   checked={isSelected}
                                                                   onCheckedChange={(checked) => handleCheckboxChange(checked, subItem)}
                                                                   aria-label={`Select ${subItem.description}`}
                                                                   className="h-4 w-4 shrink-0"
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
                     {/* Refined Total Section */}
                     <div className="flex justify-between items-center w-full px-4 sm:px-6 py-5 sm:py-6 border-t border-border/30 bg-primary/5">
                         <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-primary/20">
                                 <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                             </div>
                             <span className="font-bold text-sm sm:text-lg text-primary">
                                 Total Estimated Tax
                             </span>
                         </div>
                          <ShadTooltip>
                             <TooltipTrigger asChild>
                                 <div className="text-right">
                                     <span className="font-bold font-mono text-lg sm:text-2xl md:text-3xl cursor-default text-primary">
                                   {displayMode === 'time' && hourlyWage && perspectives?.total?.time
                                       ? formatTime((taxAmount / hourlyWage) * 60)
                                       : formatCurrency(taxAmount)
                                   }
                                 </span>
                                     <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                                         {displayMode === 'time' && hourlyWage ? 'Hours of work' : 'Annual payment'}
                                     </div>
                                 </div>
                             </TooltipTrigger>
                             <PerspectiveTooltipContent
                                 perspectiveList={
                                     displayMode === 'time' && hourlyWage && perspectives?.total?.time
                                         ? perspectives.total.time
                                         : perspectives?.total?.currency || null
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

