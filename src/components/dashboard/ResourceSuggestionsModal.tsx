// src/components/dashboard/ResourceSuggestionsModal.tsx
'use client';

import * as React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card'; // Aliased CardDescription
import { ExternalLink, Info, Loader2, Link as LinkIcon, GripVertical, X, MessageSquareQuote, PlusCircle, MinusCircle, Search } from 'lucide-react'; // Added MessageSquareQuote, PlusCircle, MinusCircle, Search
import type { SuggestedResource, MatchedReason } from '@/services/resource-suggestions';
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


export default function ResourceSuggestionsModal({
  isOpen,
  onOpenChange,
  suggestedResources,
  isLoading,
}: ResourceSuggestionsModalProps) {
  const [IconComponents, setIconComponents] = React.useState<Record<string, React.ElementType>>({});

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


  const bestMatches = suggestedResources.filter(r => r.matchCount && r.matchCount >= 2);
  const otherMatches = suggestedResources.filter(r => !bestMatches.includes(r));


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
            'dialog-pop fixed z-50 flex max-h-[90vh] sm:max-h-[85vh] w-[95vw] sm:w-[90vw] max-w-2xl flex-col border bg-background shadow-lg sm:rounded-lg',
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
                Take Further Action
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                Organizations related to your concerns. Hover for detailed relevance.
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant='ghost' size='icon' className='h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 pointer-events-auto z-20 relative'>
                <X className='h-3.5 w-3.5 sm:h-4 sm:w-4'/><span className='sr-only'>Close</span>
            </Button>
          </DialogClose>
        </div>


        <ScrollArea className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <TooltipProvider delayDuration={100}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm">Finding relevant resources...</p>
            </div>
          ) : suggestedResources.length > 0 ? (
            <div className="space-y-6">
              {bestMatches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-green-600 dark:text-green-400 border-b border-green-500/30 pb-1.5">Best Matches:</h3>
                  <div className="space-y-3">
                    {bestMatches.map((resource, index) => {
                        const Icon = IconComponents[resource.icon || 'Info'] || Info;
                        return (
                          <Tooltip key={`best-${index}`}>
                            <TooltipTrigger asChild>
                              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 bg-card/90 border-primary/30 hover:border-primary/50 cursor-help rounded-lg overflow-hidden">
                                <CardHeader className="pb-2 pt-3 px-3 sm:px-4 bg-primary/5">
                                  <CardTitle className="text-sm sm:text-base font-semibold flex items-center justify-between text-primary">
                                    <span className="flex items-center gap-1.5 sm:gap-2">
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                                        {resource.name}
                                    </span>
                                    <span className="text-xs font-medium text-primary/90 bg-primary/10 px-2 py-1 rounded-full">
                                        Matches {resource.matchCount} concern{resource.matchCount !== 1 ? 's':''}
                                    </span>
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
                    })}
                  </div>
                </div>
              )}

              {otherMatches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mt-6 mb-3 text-muted-foreground border-b pb-1.5">Other Suggestions:</h3>
                   <div className="space-y-3">
                    {otherMatches.map((resource, index) => {
                        const Icon = IconComponents[resource.icon || 'Info'] || Info;
                        return (
                          <Tooltip key={`other-${index}`}>
                            <TooltipTrigger asChild>
                              <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card/70 border-border/40 hover:border-border/60 cursor-help rounded-lg overflow-hidden">
                                <CardHeader className="pb-1.5 pt-2.5 px-3 sm:px-4 bg-secondary/20">
                                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center justify-between text-foreground/90">
                                      <span className="flex items-center gap-1.5 sm:gap-2">
                                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted-foreground" />
                                          {resource.name}
                                      </span>
                                      {resource.matchCount && resource.matchCount > 0 && (
                                        <span className="text-[10px] sm:text-xs font-normal text-muted-foreground/80 bg-accent/70 px-1.5 py-0.5 rounded-full">
                                            Matches {resource.matchCount} concern{resource.matchCount !== 1 ? 's':''}
                                        </span>
                                      )}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="text-[10px] sm:text-xs space-y-1 px-3 sm:px-4 py-2.5">
                                  <CardDesc className="text-muted-foreground leading-normal line-clamp-2 mb-1">{resource.description}</CardDesc>
                                   <p className="text-foreground/70 italic text-[9px] sm:text-[10px]"><strong className="font-medium text-foreground/80">Why it's relevant:</strong> {resource.overallRelevance}</p>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    asChild
                                    className="p-0 h-auto text-primary/90 hover:text-primary/70 text-[10px] sm:text-xs mt-1 font-medium"
                                  >
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      Visit Website <ExternalLink className="ml-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </a>
                                  </Button>
                                </CardContent>
                              </Card>
                            </TooltipTrigger>
                            <MatchedReasonTooltipContent reasons={resource.matchedReasons || []} resourceName={resource.name}/>
                          </Tooltip>
                        );
                    })}
                  </div>
                </div>
              )}
            </div>
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
