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
import { ExternalLink, Info, Loader2, Link as LinkIcon, GripVertical, X, MessageSquareQuote, PlusCircle, MinusCircle, Search, Sparkles, Trophy, Users as UsersIcon, Target, HandHeart, FilterX, Megaphone, Gavel, Landmark, Dove, LibrarySquare, DollarSign, Eye, School, Home, Bed, Utensils, Medal, Hammer, Anchor, ListFilter, Tag, FlaskConical, Brain, Building as BuildingIcon, Star, Wheelchair, PawPrint } from 'lucide-react';
import type { SuggestedResource, MatchedReason, BadgeType } from '@/types/resource-suggestions';
import { BADGE_DISPLAY_PRIORITY_MAP } from '@/types/resource-suggestions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SelectedItem } from '@/services/tax-spending';
import type { Tone } from '@/services/email/types';


const importLucideIcon = async (iconName: string | undefined): Promise<React.ElementType | typeof Info> => {
  if (!iconName) return Info;
  try {
    const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    // @ts-ignore
    const module = await import('lucide-react');
    // @ts-ignore
    return module[normalizedIconName] || module[iconName] || Info;
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
  hasUserConcerns: boolean;
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

// Using an inline SVG for Database as it's not in Lucide
const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);


const BadgeIcon = ({ badgeType }: { badgeType: BadgeType }) => {
    switch (badgeType) {
        case 'Best Match': return <Trophy className="h-3 w-3 mr-1" />;
        case 'Top Match': return <Sparkles className="h-3 w-3 mr-1" />;
        case 'High Impact': return <Megaphone className="h-3 w-3 mr-1 text-rose-600 dark:text-rose-400" />;
        case 'Broad Focus': return <UsersIcon className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />;
        case 'Niche Focus': return <Target className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400" />;
        case 'Community Pick': return <HandHeart className="h-3 w-3 mr-1 text-teal-600 dark:text-teal-400" />;
        case 'Grassroots Power': return <UsersIcon className="h-3 w-3 mr-1 text-lime-600 dark:text-lime-400" />;
        case 'Data-Driven': return <DatabaseIcon className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />;
        case 'Legal Advocacy': return <Gavel className="h-3 w-3 mr-1 text-orange-600 dark:text-orange-400" />;
        case 'Established Voice': return <Landmark className="h-3 w-3 mr-1 text-slate-600 dark:text-slate-400" />;
        case 'General Interest': return <Info className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />;
        default: return null;
    }
};

const FilterBubbleIcon = ({ filterKey, filterType }: { filterKey: string, filterType: string | undefined }) => {
    if (filterKey === 'your-matches') return <Sparkles className="h-3.5 w-3.5" />;
    if (filterKey === 'best-matches') return <Trophy className="h-3.5 w-3.5" />;
    if (filterKey === 'top-matches') return <Star className="h-3.5 w-3.5" />;
    if (filterKey === 'all-organizations') return <ListFilter className="h-3.5 w-3.5" />;
    if (filterType === 'category') return <Tag className="h-3.5 w-3.5 opacity-70" />;
    if (filterType === 'orgType') {
        if (filterKey.includes('grassroots')) return <UsersIcon className="h-3.5 w-3.5 opacity-70" />;
        if (filterKey.includes('research')) return <FlaskConical className="h-3.5 w-3.5 opacity-70" />;
        if (filterKey.includes('legal')) return <Gavel className="h-3.5 w-3.5 opacity-70" />;
        if (filterKey.includes('established')) return <BuildingIcon className="h-3.5 w-3.5 opacity-70" />;
        if (filterKey.includes('activism')) return <Megaphone className="h-3.5 w-3.5 opacity-70" />;
        if (filterKey.includes('think-tank')) return <Brain className="h-3.5 w-3.5 opacity-70" />;
        if (filterKey.includes('direct-service')) return <HandHeart className="h-3.5 w-3.5 opacity-70" />;
    }
    return null;
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
  const [activeFilterKeys, setActiveFilterKeys] = React.useState<Set<string>>(new Set(['all-organizations']));


  const [pos, setPos] = React.useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [drag, setDrag] = React.useState(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });
  const isInitialOpen = React.useRef(true);

  const refModal = React.useRef<HTMLDivElement>(null);
  const refHandle = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (hasUserConcerns && suggestedResources.some(r => (r.matchCount || 0) > 0)) {
        setActiveFilterKeys(new Set(['your-matches']));
      } else {
        setActiveFilterKeys(new Set(['all-organizations']));
      }
      // Initial centering logic moved to useLayoutEffect
    } else {
      isInitialOpen.current = true; // Reset for next open
      setPos({ x: null, y: null }); // Reset position state
    }
  }, [isOpen, hasUserConcerns, suggestedResources]);


  React.useLayoutEffect(() => {
    if (isOpen && isInitialOpen.current && refModal.current && pos.x === null) { // only run if not already positioned by drag
        const frame = requestAnimationFrame(() => {
            if (!refModal.current) return;
            const { width, height } = refModal.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const margin = 20; // Margin from viewport edges

            if (width && height) { // Ensure dimensions are available
                let newY = Math.max(margin, windowHeight / 2 - height / 2);
                newY = Math.min(newY, windowHeight - height - margin); // Ensure it doesn't go off bottom

                let newX = Math.max(margin, windowWidth / 2 - width / 2);
                newX = Math.min(newX, windowWidth - width - margin); // Ensure it doesn't go off right

                setPos({
                    x: newX,
                    y: newY,
                });
                isInitialOpen.current = false; // Mark as centered
            }
        });
        return () => cancelAnimationFrame(frame);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pos.x, isLoading]); // Re-run if isOpen changes or if pos.x gets reset or loading state changes


   React.useLayoutEffect(() => { // Effect to keep modal within viewport during content changes
    if (!isOpen || isInitialOpen.current) return; // Don't run if closed or initial centering is pending
    if (pos.x !== null && pos.y !== null && refModal.current) {
        const { width: currentWidth, height: currentHeight } = refModal.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const margin = 20; // Margin from viewport edges

        let newX = pos.x;
        let newY = pos.y;

        if (currentWidth > 0) { // Ensure width is positive
            if (newX < margin) newX = margin;
            if (newX + currentWidth > windowWidth - margin) {
                newX = Math.max(margin, windowWidth - currentWidth - margin);
            }
        }
        if (currentHeight > 0) { // Ensure height is positive
             if (newY < margin) newY = margin;
             if (newY + currentHeight > windowHeight - margin) {
                newY = Math.max(margin, windowHeight - currentHeight - margin);
            }
        }
        // Only update position if it actually changed to prevent infinite loops
        if (Math.abs(newX - (pos.x || 0)) > 0.1 || Math.abs(newY - (pos.y || 0)) > 0.1 ) {
             setPos({ x: newX, y: newY });
        }
    }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isOpen, pos.x, pos.y, isLoading, suggestedResources.length, activeFilterKeys, refModal.current?.offsetHeight, refModal.current?.offsetWidth]);


  const onDown = React.useCallback((e: React.MouseEvent) => {
    if (!refHandle.current?.contains(e.target as Node) || !refModal.current) return;
    isInitialOpen.current = false; // User is interacting, disable initial centering

    if (pos.x === null || pos.y === null) { // If not already positioned by drag (e.g., first drag after CSS centering)
      const r = refModal.current.getBoundingClientRect();
      const newPos = { x: r.left, y: r.top };
      setPos(newPos);
      dragOffset.current = { x: e.clientX - newPos.x, y: e.clientY - newPos.y };
    } else {
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }
    setDrag(true);
    document.body.style.userSelect = 'none';
  }, [pos]);


  const onMove = React.useCallback((e: MouseEvent) => {
    if (!drag || !refModal.current || pos.x === null || pos.y === null ) return;
    const { innerWidth: vw, innerHeight: vh } = window;
    const { width: hW, height: hH } = refModal.current.getBoundingClientRect();
    let x = e.clientX - dragOffset.current.x;
    let y = e.clientY - dragOffset.current.y;

    const margin = 5; // Minimal margin when dragging
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
      const defaultIcons = ['Dove', 'LibrarySquare', 'DollarSign', 'Eye', 'School', 'Home', 'Bed', 'Utensils', 'Medal', 'Hammer', 'Anchor', 'ListFilter', 'Tag', 'FlaskConical', 'Brain', 'BuildingIcon', 'Wheelchair', 'PawPrint'];
      defaultIcons.forEach(icon => {
        if (!IconComponents[icon]) iconsToLoad.add(icon);
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

  const uniqueOrgTypeTags = React.useMemo(() => {
    const tags = new Set<string>();
    suggestedResources.forEach(r => r.orgTypeTags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  },[suggestedResources]);


  const filterBubbles = React.useMemo(() => {
    const bubbles = [];
     if (hasUserConcerns) {
        const yourMatchesCount = suggestedResources.filter(r => (r.matchCount || 0) > 0).length;
        if (yourMatchesCount > 0) {
            bubbles.push({ key: 'your-matches', label: 'Your Matches', count: yourMatchesCount, type: 'special' });
        }
        const bestMatchesCount = suggestedResources.filter(r => r.badges?.includes('Best Match')).length;
        if (bestMatchesCount > 0) {
            bubbles.push({ key: 'best-matches', label: 'Best Match', count: bestMatchesCount, type: 'badgeHighlight' });
        }
        const topMatchesCount = suggestedResources.filter(r => r.badges?.includes('Top Match')).length;
         if (topMatchesCount > 0 ) {
             bubbles.push({ key: 'top-matches', label: 'Top Matches', count: topMatchesCount, type: 'badgeHighlight' });
        }
    }
    bubbles.push({ key: 'all-organizations', label: 'All Organizations', count: suggestedResources.length, type: 'special' });


    uniqueCategories.forEach(cat => {
        const count = suggestedResources.filter(r => r.mainCategory === cat).length;
        if (count > 0) {
             bubbles.push({ key: `cat-${cat}`, label: cat, count, type: 'category' });
        }
    });

    uniqueOrgTypeTags.forEach(tag => {
        const count = suggestedResources.filter(r => r.orgTypeTags?.includes(tag as any)).length;
        if (count > 0) {
            const label = tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            bubbles.push({ key: `orgtype-${tag}`, label, count, type: 'orgType' });
        }
    });

    const allBadgeTypesPresent = new Set<BadgeType>();
    suggestedResources.forEach(r => r.badges?.forEach(b => allBadgeTypesPresent.add(b)));
    Array.from(allBadgeTypesPresent)
        .filter(b => !['Best Match', 'Top Match'].includes(b)) // Exclude already handled special badges
        .sort((a,b) => (BADGE_DISPLAY_PRIORITY_MAP[a] || 99) - (BADGE_DISPLAY_PRIORITY_MAP[b] || 99))
        .forEach(badgeType => {
            const count = suggestedResources.filter(r => r.badges?.includes(badgeType)).length;
            if (count > 0) {
                bubbles.push({ key: `badge-${badgeType.toLowerCase().replace(/\s+/g, '-')}`, label: badgeType, count, type: 'badgeGeneral' });
            }
    });


    return bubbles.sort((a,b) => {
        const typeOrder = { 'special': 1, 'badgeHighlight': 2, 'category': 3, 'orgType': 4, 'badgeGeneral': 5 };
        const orderA = typeOrder[a.type as keyof typeof typeOrder] || 6;
        const orderB = typeOrder[b.type as keyof typeof typeOrder] || 6;
        if (orderA !== orderB) return orderA - orderB;
        return a.label.localeCompare(b.label);
    });

  }, [suggestedResources, uniqueCategories, uniqueOrgTypeTags, hasUserConcerns]);

  const displayedResources = React.useMemo(() => {
    if (isLoading) return []; // Return empty if loading, to prevent lag during computation
    let filtered = suggestedResources;

    if (activeFilterKeys.size > 0 && !activeFilterKeys.has('all-organizations')) {
        filtered = suggestedResources.filter(r => {
            return Array.from(activeFilterKeys).some(key => {
                if (key === 'your-matches') return (r.matchCount || 0) > 0;
                if (key === 'best-matches') return r.badges?.includes('Best Match') || false;
                if (key === 'top-matches') return r.badges?.includes('Top Match') || false;
                if (key.startsWith('cat-')) return r.mainCategory === key.substring(4);
                if (key.startsWith('orgtype-')) return r.orgTypeTags?.includes(key.substring(8) as any) || false;
                if (key.startsWith('badge-')) {
                    const badgeKey = key.substring(6).replace(/-/g, ' ');
                    return r.badges?.some(b => b.toLowerCase() === badgeKey) || false;
                }
                return false;
            });
        });
    }
    // Virtualization could be implemented here if performance is still an issue with many cards
    return filtered;

  }, [isLoading, suggestedResources, activeFilterKeys]);


  const handleFilterClick = (key: string) => {
    setActiveFilterKeys(prevKeys => {
        const newKeys = new Set(prevKeys);
        const isAllOrgsActive = newKeys.has('all-organizations');

        if (key === 'all-organizations') {
            return new Set(['all-organizations']); // Selecting "All" deselects others
        }

        if (isAllOrgsActive) {
            newKeys.delete('all-organizations'); // If "All" was active, deselect it when a specific filter is chosen
        }

        if (newKeys.has(key)) {
            newKeys.delete(key); // Toggle off
        } else {
            newKeys.add(key); // Toggle on
        }

        // If no specific filters are active, revert to "All Organizations"
        if (newKeys.size === 0) {
            return new Set(['all-organizations']);
        }
        return newKeys;
    });
  };

  const handleClearAllFilters = () => {
      setActiveFilterKeys(new Set(['all-organizations']));
  };


  const renderResourceCard = React.useCallback((resource: SuggestedResource) => {
    const Icon = IconComponents[resource.icon || 'Info'] || Info;

    const displayedBadges: BadgeType[] = (resource.badges || [])
        .sort((a, b) => (BADGE_DISPLAY_PRIORITY_MAP[a] || 99) - (BADGE_DISPLAY_PRIORITY_MAP[b] || 99));

    return (
        <Tooltip>
        <TooltipTrigger asChild>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 bg-card/90 border-border/30 hover:border-primary/40 cursor-help rounded-lg overflow-hidden w-full animate-fadeIn">
            <CardHeader className="pb-2 pt-3 px-3 sm:px-4 bg-secondary/10">
                <CardTitle className="text-sm sm:text-base font-semibold flex items-start justify-between text-foreground gap-2">
                <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 text-primary" />
                    <span className="flex-1">{resource.name}</span>
                </span>
                <div className="flex items-center flex-shrink-0 gap-1 ml-auto flex-wrap justify-end max-w-[60%]">
                    {displayedBadges.map(badge => (
                        <Badge
                            key={badge}
                            variant={badge === 'Best Match' || badge === 'Top Match' ? 'default' : 'outline'}
                            className={cn(
                                "text-xs px-1.5 py-0.5 whitespace-nowrap font-medium flex items-center",
                                badge === 'Best Match' && "bg-emerald-600 border-emerald-700 text-emerald-50 dark:bg-emerald-500 dark:border-emerald-600 dark:text-emerald-100",
                                badge === 'Top Match' && "bg-sky-600 border-sky-700 text-sky-50 dark:bg-sky-500 dark:border-sky-600 dark:text-sky-100",
                                badge === 'High Impact' && "bg-rose-100 border-rose-400 text-rose-700 dark:bg-rose-700/30 dark:border-rose-600 dark:text-rose-300",
                                badge === 'Broad Focus' && "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-700/30 dark:border-blue-600 dark:text-blue-300",
                                badge === 'Niche Focus' && "bg-indigo-100 border-indigo-400 text-indigo-700 dark:bg-indigo-700/30 dark:border-indigo-600 dark:text-indigo-300",
                                badge === 'Community Pick' && "bg-teal-100 border-teal-400 text-teal-700 dark:bg-teal-700/30 dark:border-teal-600 dark:text-teal-300",
                                badge === 'Grassroots Power' && "bg-lime-100 border-lime-400 text-lime-700 dark:bg-lime-700/30 dark:border-lime-600 dark:text-lime-300",
                                badge === 'Data-Driven' && "bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-700/30 dark:border-purple-600 dark:text-purple-300",
                                badge === 'Legal Advocacy' && "bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-700/30 dark:border-orange-600 dark:text-orange-300",
                                badge === 'Established Voice' && "bg-slate-100 border-slate-400 text-slate-700 dark:bg-slate-700/30 dark:border-slate-600 dark:text-slate-300",
                                badge === 'General Interest' && "bg-gray-100 border-gray-400 text-gray-700 dark:bg-gray-700/30 dark:border-gray-600 dark:text-gray-300 italic",
                            )}
                        >
                           <BadgeIcon badgeType={badge}/> {badge}
                        </Badge>
                    ))}
                    {(resource.matchCount && resource.matchCount > 0 && displayedBadges.length === 0 && !resource.badges?.includes('General Interest')) ? (
                         <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30 text-xs px-1.5 py-0.5 whitespace-nowrap">
                            Matches {resource.matchCount} concern{resource.matchCount !== 1 ? 's':''}
                        </Badge>
                    ): null}
                     {(!resource.matchCount || resource.matchCount === 0) && displayedBadges.length === 0 && (
                        <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30 text-xs px-1.5 py-0.5 whitespace-nowrap italic">
                            General Info
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
                onClick={(e) => e.stopPropagation()}
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IconComponents, BADGE_DISPLAY_PRIORITY_MAP]);


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
             pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', // Initial centering only if not dragged
            'data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut'
        )}
        onInteractOutside={e => drag && e.preventDefault()}
        onOpenAutoFocus={e => {
            e.preventDefault(); // Prevent default focus behavior
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
            <div className="px-2 py-2 sm:px-4 sm:py-3 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-between gap-2">
                <ScrollArea className="w-full whitespace-nowrap rounded-md flex-grow">
                    <div className="flex space-x-2 p-1 items-center">
                        {filterBubbles.map(bubble => (
                            bubble.count > 0 && (
                                <Button
                                    key={bubble.key}
                                    variant={activeFilterKeys.has(bubble.key) ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFilterClick(bubble.key)}
                                    className={cn("rounded-full text-xs h-auto px-3 py-1.5 whitespace-nowrap transition-all duration-150 flex items-center gap-1.5",
                                        activeFilterKeys.has(bubble.key) ? "shadow-md ring-2 ring-primary/50" : "hover:bg-accent/70",
                                        bubble.key === 'your-matches' && activeFilterKeys.has(bubble.key) && 'bg-blue-500/90 border-blue-600 text-blue-50 dark:bg-blue-600/80 dark:border-blue-700 dark:text-blue-100',
                                        bubble.key === 'all-organizations' && activeFilterKeys.has(bubble.key) && 'bg-slate-500/90 border-slate-600 text-slate-50 dark:bg-slate-600/80 dark:border-slate-700 dark:text-slate-100',
                                        bubble.type === 'badgeHighlight' && activeFilterKeys.has(bubble.key) && 'bg-emerald-500/90 border-emerald-600 text-emerald-50 dark:bg-emerald-600/80 dark:border-emerald-700 dark:text-emerald-100',
                                        bubble.type === 'category' && activeFilterKeys.has(bubble.key) && 'bg-indigo-500/90 border-indigo-600 text-indigo-50 dark:bg-indigo-600/80 dark:border-indigo-700 dark:text-indigo-100',
                                        bubble.type === 'orgType' && activeFilterKeys.has(bubble.key) && 'bg-purple-500/90 border-purple-600 text-purple-50 dark:bg-purple-600/80 dark:border-purple-700 dark:text-purple-100',
                                        bubble.type === 'badgeGeneral' && activeFilterKeys.has(bubble.key) && 'bg-teal-500/90 border-teal-600 text-teal-50 dark:bg-teal-600/80 dark:border-teal-700 dark:text-teal-100'
                                    )}
                                    title={`Filter by: ${bubble.label}`}
                                >
                                    <FilterBubbleIcon filterKey={bubble.key} filterType={bubble.type} />
                                    {bubble.label} ({bubble.count})
                                    {activeFilterKeys.has(bubble.key) && bubble.key !== 'all-organizations' && <X className="h-3 w-3 opacity-70 hover:opacity-100 ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleFilterClick(bubble.key);}} />}
                                </Button>
                            )
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="h-2 mt-1" />
                </ScrollArea>
                 {Array.from(activeFilterKeys).some(k => k !== 'all-organizations') && activeFilterKeys.size > 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClearAllFilters}
                                className="rounded-full h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-destructive/10 flex-shrink-0"
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

            <ScrollArea className="flex-1 overflow-y-auto px-2 py-2 sm:px-4 sm:py-4 tooltip-scrollbar">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm">Finding relevant resources...</p>
                </div>
            ) : displayedResources.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                    {displayedResources.map((resource) => renderResourceCard(resource))}
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




