// src/components/dashboard/ResourceSuggestionsModal.tsx
'use client';

import * as React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Info, Loader2, Link as LinkIcon, GripVertical, X, MessageSquareQuote, PlusCircle, MinusCircle, Search, Sparkles, Trophy, Users as UsersIcon, Target, HandHeart, FilterX, Megaphone, Gavel, Landmark } from 'lucide-react';
import type { SuggestedResource, MatchedReason, BadgeType } from '@/services/resource-suggestions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SelectedItem } from '@/services/tax-spending';
import type { Tone } from '@/services/email/types';

const importLucideIcon = async (iconName: string | undefined): Promise<React.ElementType | typeof Info> => {
  if (!iconName) return Info;
  try {
    // Lucide icon names are typically PascalCase. This basic normalization helps.
    const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    // @ts-ignore TS doesn't know about dynamic imports for all lucide icons
    const module = await import('lucide-react');
    // @ts-ignore
    return module[normalizedIconName] || module[iconName] || Info; // Try normalized, then original, then fallback
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
    return Info;
  }
};


interface ResourceSuggestionsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suggestedResources: SuggestedResource[];
  isLoading: boolean;
  selectedItems: Map<string, SelectedItem>;
  balanceBudgetChecked: boolean;
  userTone: Tone;
  hasUserConcerns: boolean; // New prop
}

const MatchedReasonTooltipContent = ({ reasons, resourceName }: { reasons: MatchedReason[], resourceName: string }) => {
  if (!reasons || reasons.length === 0) {
    return <TooltipContent><p>This resource broadly relates to areas of public interest.</p></TooltipContent>;
  }
  return (
    <TooltipContent side="top" align="start" className="max-w-xs bg-popover p-3 shadow-xl rounded-lg border text-popover-foreground animate-scaleIn z-[60]">
      <p className="font-semibold mb-2 text-sm text-foreground">How {resourceName} aligns with your concerns:</p>
      <ScrollArea className="max-h-48 pr-2 tooltip-scrollbar">
        <ul className="space-y-2 text-xs list-none">
            {reasons.map((reason, index) => {
            let prefix = "Addresses";
            let icon = <MessageSquareQuote className="inline-block mr-1.5 h-3.5 w-3.5 text-muted-foreground" />;
            let actionColor = "text-foreground";

            if (reason.type === 'supports') {
                prefix = "Supports";
                icon = <PlusCircle className="inline-block mr-1.5 h-3.5 w-3.5 text-green-500" />;
                actionColor = "text-green-600 dark:text-green-400";
            } else if (reason.type === 'opposes') {
                prefix = "Opposes";
                icon = <MinusCircle className="inline-block mr-1.5 h-3.5 w-3.5 text-red-500" />;
                actionColor = "text-red-600 dark:text-red-400";
            } else if (reason.type === 'reviews') {
                prefix = "Advocates for review of";
                icon = <Search className="inline-block mr-1.5 h-3.5 w-3.5 text-blue-500" />;
                actionColor = "text-blue-600 dark:text-blue-400";
            }
            return (
                <li key={index} className="flex items-start gap-1">
                {icon}
                <div>
                    <strong className={`font-medium ${actionColor}`}>{prefix}:</strong>
                    <span className="text-muted-foreground ml-1">{reason.actionableTag}</span>
                    <p className="text-foreground/70 text-[10px] pl-1 italic mt-0.5">(Related to your concern about: {reason.originalConcern})</p>
                </div>
                </li>
            );
            })}
        </ul>
      </ScrollArea>
    </TooltipContent>
  );
};

const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const BadgeIcon = ({ badgeType }: { badgeType: BadgeType }) => {
    switch (badgeType) {
        case 'Best Match': return <Trophy className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400" />;
        case 'Top Match': return <Sparkles className="h-3 w-3 mr-1 text-sky-600 dark:text-sky-400" />;
        case 'High Impact': return <Megaphone className="h-3 w-3 mr-1 text-rose-600 dark:text-rose-400" />;
        case 'Broad Focus': return <UsersIcon className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />;
        case 'Niche Focus': return <Target className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400" />;
        case 'Community Pick': return <HandHeart className="h-3 w-3 mr-1 text-teal-600 dark:text-teal-400" />;
        case 'Grassroots Power': return <Megaphone className="h-3 w-3 mr-1 text-lime-600 dark:text-lime-400" />;
        case 'Data-Driven': return <DatabaseIcon className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400" />;
        case 'Legal Advocacy': return <Gavel className="h-3 w-3 mr-1 text-rose-600 dark:text-rose-400" />;
        case 'Established Voice': return <Landmark className="h-3 w-3 mr-1 text-slate-600 dark:text-slate-400" />;
        default: return null;
    }
};


export default function ResourceSuggestionsModal({
  isOpen,
  onOpenChange,
  suggestedResources,
  isLoading,
  userTone,
  hasUserConcerns,
}: ResourceSuggestionsModalProps) {
  const [IconComponents, setIconComponents] = React.useState<Record<string, React.ElementType>>({});
  const [activeFilterKeys, setActiveFilterKeys] = React.useState<Set<string>>(new Set());


  const [pos, setPos] = React.useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [drag, setDrag] = React.useState(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });
  const isInitialOpen = React.useRef(true);

  const refModal = React.useRef<HTMLDivElement>(null);
  const refHandle = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!isOpen) {
      setPos({ x: null, y: null });
      isInitialOpen.current = true;
      setActiveFilterKeys(new Set()); // Clear filters on close
    } else {
        // Set initial filters based on whether user has concerns
        const initialFilters = new Set<string>();
        if (hasUserConcerns) {
             initialFilters.add('your-matches');
        } else {
             initialFilters.add('all-organizations');
        }
        setActiveFilterKeys(initialFilters);
    }
  }, [isOpen, hasUserConcerns]);


  React.useLayoutEffect(() => {
    if (!isOpen || pos.x !== null || !isInitialOpen.current) return;

    const frame = requestAnimationFrame(() => {
        if (!refModal.current) return;
        const { width, height } = refModal.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        if (width && height) {
             // Calculate top position, ensuring it's not cut off at the bottom
             let newY = windowHeight / 2 - height / 2;
             if (newY + height > windowHeight - 20) { // 20px buffer from bottom
                 newY = windowHeight - height - 20;
             }
             if (newY < 20) { // 20px buffer from top
                 newY = 20;
             }

            setPos({
                x: windowWidth / 2 - width / 2,
                y: newY,
            });
            isInitialOpen.current = false;
        }
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, pos.x]);


  const onDown = React.useCallback((e: React.MouseEvent) => {
    if (!refHandle.current?.contains(e.target as Node) || !refModal.current) return;

    if (pos.x === null) { // First drag after opening centred
      const r = refModal.current.getBoundingClientRect();
      setPos({ x: r.left, y: r.top });
      dragOffset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
       isInitialOpen.current = false; // No longer initial open
    } else { // Subsequent drags
      if (pos.x !== null && pos.y !== null) { // Ensure pos.x and pos.y are not null
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      }
    }
    setDrag(true);
    document.body.style.userSelect = 'none';
  }, [pos]);


  const onMove = React.useCallback((e: MouseEvent) => {
    if (!drag || !refModal.current || pos.x === null || pos.y === null ) return; // Check pos.y too
    const { innerWidth: vw, innerHeight: vh } = window;
    const { width: hW, height: hH } = refModal.current.getBoundingClientRect();
    let x = e.clientX - dragOffset.current.x;
    let y = e.clientY - dragOffset.current.y;

    // Keep modal within viewport boundaries (with a small margin)
    const margin = 5;
    x = Math.max(margin, Math.min(x, vw - hW - margin));
    y = Math.max(margin, Math.min(y, vh - hH - margin));

    setPos({ x, y });
  }, [drag, pos.x, pos.y]);

  const stopDrag = React.useCallback(() => {
    setDrag(false);
    document.body.style.userSelect = '';
  }, []);

  React.useLayoutEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', stopDrag);
    } else {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [drag, onMove, stopDrag]);

  React.useEffect(() => {
    const loadIcons = async () => {
      const loaded: Record<string, React.ElementType> = {};
      const iconsToLoad = new Set<string>();
      suggestedResources.forEach(resource => {
        if (resource.icon && !IconComponents[resource.icon]) {
          iconsToLoad.add(resource.icon);
        }
      });

      for (const iconName of iconsToLoad) {
        loaded[iconName] = await importLucideIcon(iconName);
      }
      if (Object.keys(loaded).length > 0) {
        setIconComponents(prev => ({ ...prev, ...loaded }));
      }
    };

    if (isOpen && suggestedResources.length > 0) {
      loadIcons();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, suggestedResources]);


  const uniqueCategories = React.useMemo(() => {
    const categories = new Set<string>();
    suggestedResources.forEach(r => categories.add(r.mainCategory));
    return Array.from(categories).sort();
  }, [suggestedResources]);

  const filterBubbles = React.useMemo(() => {
    const bubbles = [];
    if (hasUserConcerns) {
        const yourMatchesCount = suggestedResources.filter(r => (r.matchCount || 0) > 0).length;
        if (yourMatchesCount > 0) {
            bubbles.push({ key: 'your-matches', label: 'Your Matches', count: yourMatchesCount });
        }
        const bestMatchesCount = suggestedResources.filter(r => r.badges?.includes('Best Match')).length;
        if (bestMatchesCount > 0) {
             // Count actual number of 'Best Match' if it's one, or 'Top Match' if multiple
            const actualBestCount = suggestedResources.filter(r => r.badges?.includes('Best Match')).length;
            const actualTopCount = suggestedResources.filter(r => r.badges?.includes('Top Match')).length;
            if (actualBestCount === 1) {
                 bubbles.push({ key: 'best-matches', label: 'Best Match', count: 1 });
            } else if (actualTopCount > 0) {
                // This logic might be tricky if 'Best Match' and 'Top Match' can coexist on same item
                // For now, prioritize showing a "Top Matches" count if best match logic isn't exclusive
                bubbles.push({ key: 'top-matches', label: 'Top Matches', count: actualTopCount });
            }
        }
    }
    bubbles.push({ key: 'all-organizations', label: 'All Organizations', count: suggestedResources.length });


    uniqueCategories.forEach(cat => {
        const count = suggestedResources.filter(r => r.mainCategory === cat).length;
        if (count > 0) {
             bubbles.push({ key: cat, label: cat, count });
        }
    });
    return bubbles;
  }, [suggestedResources, uniqueCategories, hasUserConcerns]);

  const displayedResources = React.useMemo(() => {
    if (isLoading) return [];
    let filtered = suggestedResources;

    // Handle specific "meta" filters first
    if (activeFilterKeys.has('your-matches')) {
        filtered = filtered.filter(r => (r.matchCount || 0) > 0);
    } else if (activeFilterKeys.has('best-matches')) { // Assumes 'best-matches' is for the single best
        filtered = filtered.filter(r => r.badges?.includes('Best Match'));
    } else if (activeFilterKeys.has('top-matches')) { // For multiple top matches
        filtered = filtered.filter(r => r.badges?.includes('Top Match'));
    }
    // If 'all-organizations' is active, or no specific meta-filters are active, use the result so far.
    // If specific meta-filters *were* active, 'filtered' already reflects that.

    // Then, if any category filters are active, further refine the list.
    const categoryFilters = Array.from(activeFilterKeys).filter(key =>
        !['your-matches', 'best-matches', 'top-matches', 'all-organizations'].includes(key)
    );

    if (categoryFilters.length > 0) {
        filtered = filtered.filter(r => categoryFilters.includes(r.mainCategory));
    }

    // If after all filters, the list is empty and "all-organizations" wasn't the *only* active filter,
    // it implies a combination of specific filters yielded no results.
    // In this case, if the user hasn't explicitly selected 'all-organizations', we might want to show all.
    // However, current logic: if activeFilterKeys is not empty and doesn't include 'all-organizations',
    // it means specific filters are on. If they yield no results, show no results.
    if (activeFilterKeys.size > 0 && !activeFilterKeys.has('all-organizations')) {
        return filtered;
    }

    // Default to all resources if no filters are active or 'all-organizations' is specifically selected.
    return suggestedResources; // Or 'filtered' if 'all-organizations' was selected alongside others (though that's complex)

  }, [isLoading, suggestedResources, activeFilterKeys]);


  const handleFilterClick = (key: string) => {
    setActiveFilterKeys(prevKeys => {
        const newKeys = new Set(prevKeys);

        if (key === 'all-organizations') {
            // Selecting 'all-organizations' makes it the ONLY active filter.
            return new Set(['all-organizations']);
        }

        // If adding a specific filter (not 'all-organizations'):
        // 1. If 'all-organizations' is currently active, remove it.
        if (newKeys.has('all-organizations')) {
            newKeys.delete('all-organizations');
        }
        // 2. Toggle the clicked filter.
        if (newKeys.has(key)) {
            newKeys.delete(key);
        } else {
            newKeys.add(key);
        }

        // 3. If after toggling, no filters are active, default to 'your-matches' (if concerns) or 'all-organizations'.
        if (newKeys.size === 0) {
            return hasUserConcerns ? new Set(['your-matches']) : new Set(['all-organizations']);
        }

        return newKeys;
    });
  };

  const handleClearAllFilters = () => {
      setActiveFilterKeys(hasUserConcerns ? new Set(['your-matches']) : new Set(['all-organizations']));
  };


  const renderResourceCard = (resource: SuggestedResource, index: number) => {
    const Icon = IconComponents[resource.icon || 'Info'] || Info;
    return (
        <Tooltip key={`${Array.from(activeFilterKeys).join('-')}-${index}-${resource.url}`}>
        <TooltipTrigger asChild>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 bg-card/90 border-border/30 hover:border-primary/40 cursor-help rounded-lg overflow-hidden w-full animate-fadeIn">
            <CardHeader className="pb-2 pt-3 px-3 sm:px-4 bg-secondary/10">
                <CardTitle className="text-sm sm:text-base font-semibold flex items-start justify-between text-foreground gap-2">
                <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 text-primary" />
                    <span className="flex-1">{resource.name}</span>
                </span>
                <div className="flex items-center flex-shrink-0 gap-1 ml-auto flex-wrap justify-end">
                    {resource.badges?.map(badge => (
                        <Badge
                            key={badge}
                            variant={badge === 'Best Match' ? 'default' : 'secondary'}
                            className={cn(
                                "text-xs px-1.5 py-0.5 whitespace-nowrap font-medium",
                                badge === 'Best Match' && "bg-green-600/20 border-green-500 text-green-700 dark:bg-green-700/30 dark:border-green-500 dark:text-green-300",
                                badge === 'Top Match' && "bg-sky-600/20 border-sky-500 text-sky-700 dark:bg-sky-700/30 dark:border-sky-500 dark:text-sky-300",
                                badge === 'High Impact' && "bg-rose-100 border-rose-400 text-rose-700 dark:bg-rose-700/30 dark:border-rose-600 dark:text-rose-300", // Changed color
                                badge === 'Broad Focus' && "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-700/30 dark:border-blue-600 dark:text-blue-300", // Changed color
                                badge === 'Niche Focus' && "bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-700/30 dark:border-indigo-600 dark:text-indigo-300", // Changed color
                                badge === 'Community Pick' && "bg-teal-100 border-teal-400 text-teal-700 dark:bg-teal-700/30 dark:border-teal-600 dark:text-teal-300",
                                badge === 'Grassroots Power' && "bg-lime-100 border-lime-400 text-lime-700 dark:bg-lime-700/30 dark:border-lime-600 dark:text-lime-300",
                                badge === 'Data-Driven' && "bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-700/30 dark:border-purple-600 dark:text-purple-300", // Changed color
                                badge === 'Legal Advocacy' && "bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-700/30 dark:border-orange-600 dark:text-orange-300", // Changed color
                                badge === 'Established Voice' && "bg-slate-100 border-slate-400 text-slate-700 dark:bg-slate-700/30 dark:border-slate-600 dark:text-slate-300",
                            )}
                        >
                           <BadgeIcon badgeType={badge}/> {badge}
                        </Badge>
                    ))}
                    {resource.matchCount && resource.matchCount > 0 && (!resource.badges || !resource.badges.some(b => ['Best Match', 'Top Match'].includes(b))) ? (
                         <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30 text-xs px-1.5 py-0.5 whitespace-nowrap">
                            Matches {resource.matchCount} concern{resource.matchCount !== 1 ? 's':''}
                        </Badge>
                    ) : resource.matchCount === 0 && (
                         <Badge variant="outline" className="border-border text-muted-foreground/70 bg-muted/20 text-xs px-1.5 py-0.5 whitespace-nowrap italic">
                            General Interest
                        </Badge>
                    )}
                </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm space-y-1.5 px-3 sm:px-4 py-3">
                <CardDesc className="text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 mb-1">{resource.description}</CardDesc>
                <p className="text-foreground/80 italic text-[10px] sm:text-xs"><strong className="font-medium text-foreground/90">Why it might be relevant:</strong> {resource.overallRelevance}</p>
                <Button
                variant="link"
                size="sm"
                asChild
                className="p-0 h-auto text-primary hover:text-primary/80 text-xs sm:text-sm mt-1.5 font-medium"
                onClick={(e) => e.stopPropagation()} // Prevent modal interaction when clicking link
                >
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    Visit Website <ExternalLink className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </a>
                </Button>
            </CardContent>
            </Card>
        </TooltipTrigger>
        <MatchedReasonTooltipContent reasons={resource.matchedReasons || []} resourceName={resource.name}/>
        </Tooltip>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        ref={refModal}
        style={
            pos.x !== null && pos.y !== null
            ? { left: pos.x, top: pos.y, transform: 'none' }
            : undefined
        }
        className={cn(
            'dialog-pop fixed z-50 flex max-h-[90vh] sm:max-h-[85vh] w-[95vw] sm:w-[90vw] max-w-3xl flex-col border bg-background shadow-lg sm:rounded-lg',
             pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', // Initial centering
            'data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut'
        )}
        onInteractOutside={e => drag && e.preventDefault()}
        onOpenAutoFocus={e => {
            e.preventDefault();
            const initialFilters = new Set<string>();
             if (hasUserConcerns) {
                initialFilters.add('your-matches');
             } else {
                initialFilters.add('all-organizations');
             }
             setActiveFilterKeys(initialFilters);
        }}
      >
        <div
            ref={refHandle}
            onMouseDown={onDown}
            className='relative flex shrink-0 cursor-move select-none items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 bg-card/95 rounded-t-lg'
         >
          <div className='flex items-center gap-2 sm:gap-3 pointer-events-none'>
            <GripVertical className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0' />
            <div className='space-y-0 sm:space-y-0.5'>
              <DialogTitle className='text-base sm:text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2 text-primary'>
                <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Explore Further Actions
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                 {hasUserConcerns ? "Discover organizations aligned with your concerns. Use filters to narrow results." : "Explore organizations working on various federal policy issues."}
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant='ghost' size='icon' className='h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 pointer-events-auto z-20 relative'>
                <X className='h-3.5 w-3.5 sm:h-4 sm:w-4'/><span className='sr-only'>Close</span>
            </Button>
          </DialogClose>
        </div>
        <TooltipProvider delayDuration={100}>
            <div className="px-2 py-2 sm:px-4 sm:py-3 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                    <div className="flex space-x-2 p-1 items-center">
                        {filterBubbles.map(bubble => (
                            bubble.count > 0 && (
                                <Button
                                    key={bubble.key}
                                    variant={activeFilterKeys.has(bubble.key) ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFilterClick(bubble.key)}
                                    className={cn("rounded-full text-xs h-auto px-3 py-1.5 whitespace-nowrap transition-all duration-150 flex items-center gap-1",
                                    activeFilterKeys.has(bubble.key) ? "shadow-md ring-2 ring-primary/50" : "hover:bg-accent/70"
                                    )}
                                >
                                    {bubble.label} ({bubble.count})
                                    {activeFilterKeys.has(bubble.key) && <X className="h-3 w-3 opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleFilterClick(bubble.key);}} />}
                                </Button>
                            )
                        ))}
                        {/* Only show clear if specific (non-'all') filters are active */}
                        {Array.from(activeFilterKeys).some(k => k !== 'all-organizations') && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearAllFilters}
                                        className="rounded-full h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-destructive/10 ml-1"
                                        title="Clear all active filters"
                                    >
                                        <FilterX className="h-4 w-4" />
                                        <span className="sr-only">Clear Filters</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Clear all filters</p></TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" className="h-2" />
                </ScrollArea>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto px-2 py-2 sm:px-4 sm:py-4 tooltip-scrollbar">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm">Finding relevant resources...</p>
                </div>
            ) : displayedResources.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                    {displayedResources.map((resource, index) => renderResourceCard(resource, index))}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                <Info className="h-10 w-10 mx-auto mb-3 text-primary/70" />
                <p className="text-sm">{ activeFilterKeys.size > 0 && !activeFilterKeys.has('all-organizations') ? `No resources matched your current filter combination.` : "No resources found."}</p>
                <p className="text-xs mt-1">
                    Try adjusting your filters or exploring all organizations.
                </p>
                </div>
            )}
            </ScrollArea>
        </TooltipProvider>

        <DialogFooter className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end px-4 py-3 sm:px-6 sm:py-4 border-t bg-card/95 rounded-b-lg sticky bottom-0 z-10">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Placeholder for Wifi icon
const Wifi = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);
