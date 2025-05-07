// src/components/dashboard/ResourceSuggestionsModal.tsx
'use client';

import * as React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Info, Loader2, Link as LinkIcon, GripVertical, X, MessageSquareQuote, PlusCircle, MinusCircle, Search, Sparkles, Trophy, Users as UsersIcon, Target } from 'lucide-react';
import type { SuggestedResource, MatchedReason, BadgeType } from '@/services/resource-suggestions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SelectedItem } from '@/services/tax-spending';
import type { Tone } from '@/services/email/types';

const importLucideIcon = async (iconName: string | undefined): Promise<React.ElementType | typeof Info> => {
  if (!iconName) return Info;
  try {
    const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    const module = await import('lucide-react');
    // @ts-ignore TS doesn't know about dynamic imports for all lucide icons
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
}

const MatchedReasonTooltipContent = ({ reasons, resourceName }: { reasons: MatchedReason[], resourceName: string }) => {
  if (!reasons || reasons.length === 0) {
    return <TooltipContent><p>No specific matching reasons found.</p></TooltipContent>;
  }
  return (
    <TooltipContent side="top" align="start" className="max-w-xs bg-popover p-3 shadow-xl rounded-lg border text-popover-foreground animate-scaleIn z-[60]">
      <p className="font-semibold mb-2 text-sm text-foreground">How {resourceName} aligns with your concerns:</p>
      <ul className="space-y-2 text-xs list-none max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
    </TooltipContent>
  );
};

const BadgeIcon = ({ badgeType }: { badgeType: BadgeType }) => {
    switch (badgeType) {
        case 'Best Match': return <Trophy className="h-3 w-3 mr-1" />;
        case 'High Impact': return <Sparkles className="h-3 w-3 mr-1" />; // Re-using Sparkles for High Impact
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
}: ResourceSuggestionsModalProps) {
  const [IconComponents, setIconComponents] = React.useState<Record<string, React.ElementType>>({});
  const [activeTab, setActiveTab] = React.useState<string>("best-matches");

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
      setActiveTab("best-matches"); // Reset tab on close
    }
  }, [isOpen]);

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

  const bestMatches = suggestedResources.filter(r => r.badges?.includes('Best Match'));
  const otherResources = suggestedResources.filter(r => !r.badges?.includes('Best Match'));

  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    otherResources.forEach(r => uniqueCategories.add(r.mainCategory));
    return Array.from(uniqueCategories).sort();
  }, [otherResources]);


  const renderResourceCard = (resource: SuggestedResource, index: number, type: 'best' | 'other') => {
    const Icon = IconComponents[resource.icon || 'Info'] || Info;
    return (
        <Tooltip key={`${type}-${index}`}>
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
                                badge === 'Best Match' && "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-400",
                                badge === 'High Impact' && "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-400",
                                badge === 'Broad Focus' && "bg-purple-500/20 border-purple-500/50 text-purple-700 dark:text-purple-400",
                                badge === 'Niche Focus' && "bg-orange-500/20 border-orange-500/50 text-orange-700 dark:text-orange-400",
                                badge === 'Community Pick' && "bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-400",
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
                <p className="text-foreground/80 italic text-[10px] sm:text-xs"><strong className="font-medium text-foreground/90">Why it's relevant:</strong> {resource.overallRelevance}</p>
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
            'dialog-pop fixed z-50 flex max-h-[90vh] sm:max-h-[85vh] w-[95vw] sm:w-[90vw] max-w-3xl flex-col border bg-background shadow-lg sm:rounded-lg', // Increased max-w
            pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut'
        )}
        onInteractOutside={e => drag && e.preventDefault()}
        onOpenAutoFocus={e => e.preventDefault()}
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
                Discover organizations aligned with your concerns.
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant='ghost' size='icon' className='h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 pointer-events-auto z-20 relative'>
                <X className='h-3.5 w-3.5 sm:h-4 sm:w-4'/><span className='sr-only'>Close</span>
            </Button>
          </DialogClose>
        </div>


        <ScrollArea className="flex-1 overflow-y-auto px-1 py-1 sm:px-2 sm:py-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <TooltipProvider delayDuration={100}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm">Finding relevant resources...</p>
            </div>
          ) : suggestedResources.length > 0 ? (
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-2 sm:p-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 mb-4 h-auto flex-wrap justify-start">
                    <TabsTrigger value="best-matches" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Best Matches ({bestMatches.length})</TabsTrigger>
                    <TabsTrigger value="all-organizations" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All ({otherResources.length})</TabsTrigger>
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category} className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            {category} ({otherResources.filter(r => r.mainCategory === category).length})
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="best-matches">
                    {bestMatches.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                            {bestMatches.map((resource, index) => renderResourceCard(resource, index, 'best'))}
                        </div>
                    ) : (
                         <div className="text-center py-6 text-muted-foreground">
                            <Info className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                            <p className="text-xs sm:text-sm">No standout "Best Matches" right now. Try the 'All Organizations' tab or broaden your concerns.</p>
                         </div>
                    )}
                </TabsContent>
                <TabsContent value="all-organizations">
                     <div className="space-y-3 sm:space-y-4">
                        {otherResources.map((resource, index) => renderResourceCard(resource, index, 'other'))}
                    </div>
                </TabsContent>
                {categories.map(category => (
                    <TabsContent key={category} value={category}>
                        <div className="space-y-3 sm:space-y-4">
                        {otherResources.filter(r => r.mainCategory === category).map((resource, index) => renderResourceCard(resource, index, 'other'))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Info className="h-10 w-10 mx-auto mb-3 text-primary/70" />
              <p className="text-sm">No specific resources matched all your concerns.</p>
              <p className="text-xs mt-1">Consider broadening your search or contacting your representatives directly with the email you generated.</p>
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
