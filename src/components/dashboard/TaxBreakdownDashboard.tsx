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
            {/* Enhanced Header Section */}
            <div className="text-center space-y-3 sm:space-y-4 mb-4 sm:mb-6 relative">
                <div className="relative inline-block">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                        {currentYear ? `${currentYear} ` : ''}Federal Income Tax Receipt
                    </h1>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-chart-1/20 blur-xl opacity-30 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Based on your estimated{' '}
                        <span className="font-bold text-transparent bg-gradient-to-r from-primary to-chart-1 bg-clip-text">
                            {formatCurrency(taxAmount)}
                        </span>{' '}
                        payment.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 backdrop-blur-sm border border-border/40">
                        <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse"></div>
                        <p className="text-sm text-muted-foreground font-medium">Next Filing Due: {dueDateDisplay}</p>
                    </div>
                </div>
            </div>


             {/* Enhanced Display Mode Toggle */}
             <div className="flex justify-center items-center my-6 sm:my-8">
                <Label htmlFor="display-mode-toggle" className="text-sm font-semibold text-muted-foreground mr-3 sm:mr-4">View as:</Label>
                <div className="flex items-center space-x-1 bg-card/60 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-border/40 hover:shadow-xl transition-all duration-300">
                    <Button
                        variant={displayMode === 'currency' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleDisplayModeToggle('currency')}
                        className={cn(
                            "rounded-xl px-4 py-2 h-9 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                            displayMode === 'currency' 
                                ? 'bg-gradient-to-r from-primary to-chart-1 text-primary-foreground shadow-lg transform scale-105 animate-float' 
                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:scale-105'
                        )}
                        aria-pressed={displayMode === 'currency'}
                    >
                        <DollarSign className="h-4 w-4 mr-2" /> Currency
                        {displayMode === 'currency' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                    </Button>
                    <Button
                         variant={displayMode === 'time' ? 'default' : 'ghost'}
                         size="sm"
                         onClick={() => handleDisplayModeToggle('time')}
                         className={cn(
                            "rounded-xl px-4 py-2 h-9 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                            displayMode === 'time' && hourlyWage !== null 
                                ? 'bg-gradient-to-r from-primary to-chart-1 text-primary-foreground shadow-lg transform scale-105 animate-float' 
                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:scale-105'
                         )}
                         aria-pressed={displayMode === 'time' && hourlyWage !== null}
                    >
                        <Clock className="h-4 w-4 mr-2" /> Time Worked
                        {displayMode === 'time' && hourlyWage !== null && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Enhanced Call-to-Action Alert */}
            <Alert className="mb-8 sm:mb-10 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-chart-1/10 text-foreground backdrop-blur-sm shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5 animate-pulse"></div>
                <div className="relative z-10">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
                            <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 stroke-primary animate-float" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <AlertTitle className="font-bold text-primary text-lg sm:text-xl tracking-tight">
                                Make Your Voice Heard!
                            </AlertTitle>
                            <AlertDescription className="text-sm sm:text-base text-foreground/90 leading-relaxed space-y-3">
                                <p className="font-medium">Understanding where your money goes is the first step. The next is action.</p>
                                <p>Your elected officials work for you. Let them know how you feel about these spending priorities. Select specific items below that concern you and use the button to draft a direct message.</p>
                                <Button 
                                    variant="link" 
                                    className="p-0 h-auto ml-0 text-primary font-semibold text-sm sm:text-base hover:text-chart-1 transition-colors duration-200 group" 
                                    onClick={() => {if (typeof window !== 'undefined') window.open('https://www.usa.gov/elected-officials', '_blank', 'noopener,noreferrer')}}
                                >
                                    Find Your Officials 
                                    <ExternalLink className="inline ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </Button>
                            </AlertDescription>
                        </div>
                    </div>
                </div>
            </Alert>

          {/* Enhanced Chart Section */}
          <div className="mb-10 sm:mb-16">
             <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-foreground via-primary to-chart-1 bg-clip-text text-transparent">
                    Spending Overview
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                    Interactive breakdown of your federal tax allocation across government departments
                </p>
             </div>

             <div className="relative">
                {/* Enhanced chart background */}
                <div className="absolute inset-0 bg-gradient-to-br from-card/50 via-transparent to-primary/5 rounded-3xl backdrop-blur-sm"></div>
                <div className="relative z-10 p-4 sm:p-6">
                    <ResponsiveContainer width="100%" height={responsivePieHeight + 40}>
                        <RechartsPieChart margin={{ top: isMobileView ? 30 : 20, right: 20, bottom: 20, left: 20 }}>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={responsiveOuterRadius}
                            innerRadius={responsiveInnerRadius}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="percentage"
                            nameKey="category"
                            activeIndex={activePieIndex ?? undefined}
                            activeShape={({ cx, cy, innerRadius: ir, outerRadius: or, startAngle, endAngle, fill }) => (
                                <g>
                                    <Sector
                                        cx={cx}
                                        cy={cy}
                                        innerRadius={ir}
                                        outerRadius={or + (isMobileView ? 6 : 10)}
                                        startAngle={startAngle}
                                        endAngle={endAngle}
                                        fill={fill}
                                        stroke={'hsl(var(--foreground))'}
                                        strokeWidth={2}
                                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                                    />
                                    <Sector
                                        cx={cx}
                                        cy={cy}
                                        innerRadius={ir - 2}
                                        outerRadius={ir}
                                        startAngle={startAngle}
                                        endAngle={endAngle}
                                        fill={fill}
                                        opacity={0.6}
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
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                stroke={'hsl(var(--background))'} 
                                strokeWidth={2}
                                style={{
                                    filter: activePieIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                                    transition: 'all 0.3s ease'
                                }}
                              />
                            ))}
                          </Pie>
                           <RechartsTooltip
                             content={({ active, payload: tooltipPayload }) => {
                                const currentPayload = tooltipPayload && tooltipPayload.length ? tooltipPayload[0].payload : null;
                                const shouldShowTooltip = active || (isMobileView && activePieIndex !== null && currentPayload?.category === chartData[activePieIndex ?? -1]?.category);

                                if (shouldShowTooltip && currentPayload && perspectives?.chart) {
                                    return (
                                        <CustomPieTooltip
                                            active={true}
                                            payload={tooltipPayload}
                                            totalAmount={taxAmount}
                                            hourlyWage={hourlyWage}
                                            displayMode={displayMode}
                                            perspectiveData={perspectives.chart}
                                            isMobile={isMobileView}
                                        />
                                    );
                                }
                                return null;
                             }}
                             cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.6 }}
                             wrapperStyle={{ zIndex: 1000 }}
                            />
                           <Legend content={<CustomLegend />} wrapperStyle={{ maxWidth: '100%', overflow: 'hidden' }}/>
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-full bg-muted/30 backdrop-blur-sm mx-auto w-fit">
                    <Info className="h-4 w-4 text-primary" /> 
                    <p className="text-sm text-muted-foreground font-medium">
                        {isMobileView ? "Tap segments" : "Hover over segments"} for detailed insights • Estimated data
                    </p>
                </div>
             </div>
          </div>

           {/* Enhanced Card for Detailed Spending */}
           <Card className="shadow-2xl border-2 border-border/40 rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5 opacity-50"></div>
                <CardHeader className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 border-b border-border/30 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-primary/20 backdrop-blur-sm">
                            <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                                Detailed Spending
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm sm:text-base md:text-lg mt-1">
                                Select items you believe need funding adjustments or prioritize balancing the budget.
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
                                 <AccordionItem value={`item-${index}`} key={item.id || index} className="border-b border-border/20 last:border-b-0 group relative overflow-hidden">
                                    <AccordionTrigger className="hover:no-underline py-4 px-4 sm:py-5 sm:px-6 rounded-none hover:bg-gradient-to-r hover:from-accent/30 hover:to-primary/10 data-[state=open]:bg-gradient-to-r data-[state=open]:from-accent/40 data-[state=open]:to-primary/15 transition-all duration-300 text-left relative z-10 group/trigger">
                                         <div className="flex justify-between items-center w-full gap-1.5 sm:gap-2 md:gap-3">
                                                                                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                <div className="p-1.5 rounded-lg bg-primary/20 backdrop-blur-sm group-hover/trigger:bg-primary/30 transition-colors duration-300">
                                                    <CategoryIconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 group-hover/trigger:scale-110 transition-transform duration-300" />
                                                </div>
                                                <span className="font-semibold text-sm sm:text-base truncate flex-1 group-hover/trigger:text-primary transition-colors duration-300">{item.category}</span>
                                            </div>
                                            <div className="text-right shrink-0 flex items-baseline gap-2 ml-auto">
                                                <ShadTooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="font-bold font-mono text-sm sm:text-lg cursor-default bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent hover:from-primary hover:to-chart-1 transition-all duration-300">
                                                            {categoryDisplayValue}
                                                        </span>
                                                    </TooltipTrigger>
                                                     <PerspectiveTooltipContent
                                                        perspectiveList={categoryPerspectiveList}
                                                        title={categoryPerspectiveTitle}
                                                    />
                                                </ShadTooltip>
                                                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 backdrop-blur-sm">
                                                    <span className="text-muted-foreground text-xs font-mono">({item.percentage.toFixed(1)}%)</span>
                                                </div>
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
                                                     <p>This staggering amount paid just on <span className="font-medium">interest</span> is a direct consequence of sustained government spending exceeding revenue—often driven by tax cuts favoring the wealthy, unfunded wars, and economic bailouts.</p>
                                                     <p>High interest payments <span className="font-medium">divert critical funds</span> from essential public services, infrastructure, education, and potential tax relief, raising serious questions about long-term fiscal stability and government accountability.</p>
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
                     {/* Enhanced Total Section */}
                     <div className="relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-chart-1/10 to-primary/20 animate-shimmer"></div>
                         <div className="relative z-10 flex justify-between items-center w-full px-4 sm:px-6 py-6 sm:py-8 border-t-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-chart-1/10 backdrop-blur-sm">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 rounded-xl bg-primary/30 backdrop-blur-sm">
                                     <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
                                 </div>
                                 <span className="font-black text-sm sm:text-lg md:text-xl text-primary tracking-tight uppercase">
                                     Total Estimated Tax
                                 </span>
                             </div>
                              <ShadTooltip>
                                 <TooltipTrigger asChild>
                                     <div className="text-right">
                                         <span className="font-black font-mono text-lg sm:text-2xl md:text-3xl cursor-default bg-gradient-to-r from-primary via-chart-1 to-primary bg-clip-text text-transparent hover:from-chart-1 hover:via-primary hover:to-chart-1 transition-all duration-500 animate-glow">
                                           {displayMode === 'time' && hourlyWage && perspectives?.total?.time
                                               ? formatTime((taxAmount / hourlyWage) * 60)
                                               : formatCurrency(taxAmount)
                                           }
                                         </span>
                                         <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
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
                     </div>
                </CardContent>
            </Card>
        </div>
    </TooltipProvider>
  );
}

