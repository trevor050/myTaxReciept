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
import { ExternalLink, Info, Loader2, Link as LinkIcon, GripVertical, X, MessageSquareQuote, PlusCircle, MinusCircle, Search, Sparkles, Trophy, Users as UsersIcon, Target, HandHeart } from 'lucide-react';
import type { SuggestedResource, MatchedReason, BadgeType } from '@/services/resource-suggestions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SelectedItem } from '@/services/tax-spending';
import type { Tone } from '@/services/email/types';

const importLucideIcon = async (iconName: string | undefined): Promise<React.ElementType | typeof Info> => {
  if (!iconName) return Info;
  try {
    const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    // @ts-ignore TS doesn't know about dynamic imports for all lucide icons
    const module = await import('lucide-react');
    // @ts-ignore
    return module[normalizedIconName] || Info;
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

const BadgeIcon = ({ badgeType }: { badgeType: BadgeType }) => {
    switch (badgeType) {
        case 'Best Match': return <Trophy className="h-3 w-3 mr-1" />;
        case 'High Impact': return <Sparkles className="h-3 w-3 mr-1" />;
        case 'Broad Focus': return <UsersIcon className="h-3 w-3 mr-1" />;
        case 'Niche Focus': return <Target className="h-3 w-3 mr-1" />;
        case 'Community Pick': return <HandHeart className="h-3 w-3 mr-1" />;
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
  const [activeFilterKey, setActiveFilterKey] = React.useState<string | null>(hasUserConcerns ? 'best-matches' : null);


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
       setActiveFilterKey(hasUserConcerns ? "best-matches" : null); // Reset filter on close based on concerns
    } else {
      // Reset filter on open if no concerns, or stick to best-matches if there are concerns
      setActiveFilterKey(hasUserConcerns ? (activeFilterKey || "best-matches") : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasUserConcerns]);

  React.useLayoutEffect(() => {
    if (!isOpen || pos.x !== null || !isInitialOpen.current) return;
    const frame = requestAnimationFrame(() => {
      if (!refModal.current) return;
      const { width, height } = refModal.current.getBoundingClientRect();
      if (width && height) {
        setPos({
          x: window.innerWidth / 2 - width / 2,
          y: window.innerHeight / 2 - height / 2,
        });
        isInitialOpen.current = false;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, pos.x]);


  const onDown = React.useCallback((e: React.MouseEvent) => {
    if (!refHandle.current?.contains(e.target as Node) || !refModal.current) return;
    if (pos.x === null) {
      const r = refModal.current.getBoundingClientRect();
      setPos({ x: r.left, y: r.top });
      dragOffset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
       isInitialOpen.current = false;
    } else {
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }
    setDrag(true);
    document.body.style.userSelect = 'none';
  }, [pos]);


  const onMove = React.useCallback((e: MouseEvent) => {
    if (!drag || !refModal.current || pos.x === null ) return;
    const { innerWidth: vw, innerHeight: vh } = window;
    const { width: hW, height: hH } = refModal.current.getBoundingClientRect();
    let x = e.clientX - dragOffset.current.x;
    let y = e.clientY - dragOffset.current.y;
    x = Math.max(0, Math.min(x, vw - hW));
    y = Math.max(0, Math.min(y, vh - hH));
    setPos({ x, y });
  }, [drag, pos.x]);

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
        const bestMatchesCount = suggestedResources.filter(r => r.badges?.includes('Best Match')).length;
        if (bestMatchesCount > 0) {
            bubbles.push({ key: 'best-matches', label: 'Best Matches', count: bestMatchesCount });
        }
        const allRelevantCount = suggestedResources.filter(r => (r.matchCount || 0) > 0).length;
         if (allRelevantCount > 0 && (!bestMatchesCount || allRelevantCount > bestMatchesCount)) { // Avoid redundant "All Relevant" if it's same as Best
            bubbles.push({ key: 'all-relevant', label: 'All Relevant', count: allRelevantCount });
        }
    } else {
         bubbles.push({ key: 'all-organizations', label: 'All Organizations', count: suggestedResources.length });
    }

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
    if (activeFilterKey === null || activeFilterKey === 'all-organizations') {
      return suggestedResources; // Show all if no filter or if "All Organizations" selected
    }
    if (activeFilterKey === 'all-relevant' && hasUserConcerns) {
      return suggestedResources.filter(r => (r.matchCount || 0) > 0);
    }
    if (activeFilterKey === 'best-matches' && hasUserConcerns) {
      return suggestedResources.filter(r => r.badges?.includes('Best Match'));
    }
    return suggestedResources.filter(r => r.mainCategory === activeFilterKey);
  }, [isLoading, suggestedResources, activeFilterKey, hasUserConcerns]);

  const handleFilterClick = (key: string) => {
    if (activeFilterKey === key) {
      setActiveFilterKey(hasUserConcerns ? 'all-relevant' : null); // Deselect to "all relevant" or "all orgs"
    } else {
      setActiveFilterKey(key);
    }
  };


  const renderResourceCard = (resource: SuggestedResource, index: number) => {
    const Icon = IconComponents[resource.icon || 'Info'] || Info;
    return (
        <Tooltip key={`${activeFilterKey}-${index}-${resource.url}`}>
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
                                "text-xs px-1.5 py-0.5 whitespace-nowrap",
                                badge === 'Best Match' && "bg-green-100 border-green-400 text-green-700 dark:bg-green-700/30 dark:border-green-600 dark:text-green-300",
                                badge === 'High Impact' && "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-700/30 dark:border-blue-600 dark:text-blue-300",
                                badge === 'Broad Focus' && "bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-700/30 dark:border-purple-600 dark:text-purple-300",
                                badge === 'Niche Focus' && "bg-orange-100 border-orange-400 text-orange-700 dark:bg-orange-700/30 dark:border-orange-600 dark:text-orange-300",
                                badge === 'Community Pick' && "bg-teal-100 border-teal-400 text-teal-700 dark:bg-teal-700/30 dark:border-teal-600 dark:text-teal-300",
                            )}
                        >
                           <BadgeIcon badgeType={badge}/> {badge}
                        </Badge>
                    ))}
                    {resource.matchCount && resource.matchCount > 0 && (!resource.badges || resource.badges.length === 0) && (
                         <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30 text-xs px-1.5 py-0.5 whitespace-nowrap">
                            Matches {resource.matchCount} concern{resource.matchCount !== 1 ? 's':''}
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
            pos.x !== null
            ? { left: pos.x, top: pos.y, transform: 'none' }
            : undefined
        }
        className={cn(
            'dialog-pop fixed z-50 flex max-h-[90vh] sm:max-h-[85vh] w-[95vw] sm:w-[90vw] max-w-3xl flex-col border bg-background shadow-lg sm:rounded-lg',
            pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut'
        )}
        onInteractOutside={e => drag && e.preventDefault()}
        onOpenAutoFocus={e => {
            e.preventDefault();
             // If opening and no concerns, reset filter to show all organizations
            if (!hasUserConcerns) {
                setActiveFilterKey(null);
            } else if (!activeFilterKey) { // If there are concerns but no active filter, default to best-matches
                 setActiveFilterKey('best-matches');
            }
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

        <div className="px-2 py-2 sm:px-4 sm:py-3 border-b">
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex space-x-2 p-1 items-center">
                    {filterBubbles.map(bubble => (
                        bubble.count > 0 && (
                            <Button
                                key={bubble.key}
                                variant={activeFilterKey === bubble.key ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleFilterClick(bubble.key)}
                                className={cn("rounded-full text-xs h-auto px-3 py-1.5 whitespace-nowrap transition-all duration-150",
                                   activeFilterKey === bubble.key ? "shadow-md ring-2 ring-primary/50" : "hover:bg-accent/70"
                                )}
                            >
                                {bubble.label} ({bubble.count})
                                {activeFilterKey === bubble.key && <X className="ml-1.5 h-3 w-3" />}
                            </Button>
                        )
                    ))}
                     {activeFilterKey !== null && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveFilterKey(hasUserConcerns ? 'all-relevant' : null)}
                            className="rounded-full text-xs h-auto px-2 py-1 text-muted-foreground hover:text-foreground"
                            title="Clear current filter"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
                <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto px-2 py-2 sm:px-4 sm:py-4 tooltip-scrollbar">
          <TooltipProvider delayDuration={100}>
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
              <p className="text-sm">{activeFilterKey ? `No specific resources matched the "${activeFilterKey}" filter.` : "No resources found."}</p>
              <p className="text-xs mt-1">
                {activeFilterKey && hasUserConcerns ? 'Try a different filter, "All Relevant", or clear the filter to see all organizations.' :
                 activeFilterKey && !hasUserConcerns ? 'Try a different filter or clear the filter to see all organizations.' :
                 'Resources may not be available for this combination.'
                }
              </p>
            </div>
          )}
          </TooltipProvider>
        </ScrollArea>

        <DialogFooter className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end px-4 py-3 sm:px-6 sm:py-4 border-t bg-card/95 rounded-b-lg">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

