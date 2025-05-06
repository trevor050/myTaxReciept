
'use client';

import * as React from 'react';
import {
  useState, useRef, useLayoutEffect, useCallback,
} from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Mail, Send, GripVertical } from 'lucide-react';

import type { SelectedItem } from '@/services/tax-spending';
import { generateRepresentativeEmail } from '@/services/tax-spending';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------------- */
/* funding‑level presets                                                 */
const fundingLevels = [
  { value: -2, label: 'Slash Heavily',   color: 'bg-red-600  dark:bg-red-500'     },
  { value: -1, label: 'Cut Significantly', color: 'bg-orange-500 dark:bg-orange-400' },
  { value:  0, label: 'Improve Efficiency', color: 'bg-yellow-500 dark:bg-yellow-400' },
  { value:  1, label: 'Fund',             color: 'bg-green-500 dark:bg-green-400'  },
  { value:  2, label: 'Fund More',        color: 'bg-emerald-600 dark:bg-emerald-500'},
];

/* ---------------------------------------------------------------------- */
export default function EmailCustomizationModal(props: EmailCustomizationModalProps) {
  const {
    isOpen, onOpenChange,
    selectedItems: initialSelectedItems,
    balanceBudgetChecked, aggressiveness, setAggressiveness,
    itemFundingLevels, setItemFundingLevels,
    userName, setUserName, userLocation, setUserLocation,
  } = props;

  /* ------------------------------------------------------------------ */
  /* draggable position (null = let CSS centre)                         */
    const [pos, setPos] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
    const [drag, setDrag] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const modalRef      = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLDivElement>(null); // Ref for the entire header area

    /* reset when closed ------------------------------------------------- */
    useLayoutEffect(() => {
      if (!isOpen) setPos({ x: null, y: null }); // Reset position when closed
    }, [isOpen]);

    /* ------------------------------------------------------------------ */
    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Only initiate drag if the mousedown is within the header element (dragHandleRef)
        if (!dragHandleRef.current?.contains(e.target as Node) || !modalRef.current) return;

        // Prevent dragging text selection
        e.preventDefault();

        // Switch to absolute positioning only on the first drag
        if (pos.x === null) {
          const r = modalRef.current.getBoundingClientRect();
          setPos({ x: r.left, y: r.top });
          dragOffset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        } else {
          dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }

        setDrag(true);
        document.body.style.userSelect = 'none'; // Prevent text selection during drag
      }, [pos]);


    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!drag || !modalRef.current) return;

        const { innerWidth: vw, innerHeight: vh } = window;
        const { width, height } = modalRef.current.getBoundingClientRect();

        let x = e.clientX - dragOffset.current.x;
        let y = e.clientY - dragOffset.current.y;

        /* Clamp position to viewport bounds */
        x = Math.max(0, Math.min(x, vw - width));
        y = Math.max(0, Math.min(y, vh - height));

        setPos({ x, y });
      }, [drag]);


    const onMouseUp = useCallback(() => {
        if (drag) {
            setDrag(false);
            document.body.style.userSelect = ''; // Re-enable text selection
        }
    }, [drag]);

  /* attach global drag listeners ------------------------------------- */
  useLayoutEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup',   onMouseUp);
      window.addEventListener('mouseleave', onMouseUp); // Handle mouse leaving window
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
      window.removeEventListener('mouseleave', onMouseUp);
    }
    return () => { // Cleanup
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
      window.removeEventListener('mouseleave', onMouseUp);
      if (drag) document.body.style.userSelect = ''; // Ensure cleanup on unmount
    };
  }, [drag, onMouseMove, onMouseUp]);

  /* ------------------------------------------------------------------ */
  /* helpers                                                            */
  const getAggressivenessLabel = (v: number) =>
    v <= 15 ? 'Kind'
      : v <= 40 ? 'Concerned'
        : v <= 75 ? 'Stern'
          : 'Angry';

  const fundingDetails = (slider: number) =>
    fundingLevels.find(f => f.value === mapSliderToFundingLevel(slider)) ?? fundingLevels[2];

  /* ------------------------------------------------------------------ */
  const selectedItems = React.useMemo(() => Array.from(initialSelectedItems.values()), [initialSelectedItems]);

  /* ------------------------------------------------------------------ */
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        ref={modalRef}
        /* centre w/ CSS until we have absolute coords */
        style={ pos.x !== null ? { left: pos.x, top: pos.y, transform: 'none' } : undefined }
        className={cn(
          'fixed z-50 flex max-h-[85vh] w-[90vw] max-w-3xl flex-col p-0 border bg-background shadow-lg sm:rounded-lg',
          'data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut', // Use scale animation
          pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', // Center initially
        )}
        onInteractOutside={e => drag && e.preventDefault()} // Prevent closing during drag
        onOpenAutoFocus={e => e.preventDefault()} // Prevent auto-focus on first element
      >

        {/* ---------------- header (drag handle) -------------------- */}
        <DialogHeader
          ref={dragHandleRef} // Attach ref to the header for dragging
          onMouseDown={onMouseDown}
          className={cn(
            'relative flex shrink-0 items-center justify-between gap-4 border-b bg-card/95 px-6 py-4 rounded-t-lg', // Use justify-between
            'cursor-move', // Indicate draggable area
             drag ? 'cursor-grabbing' : 'cursor-move',
          )}
        >
            {/* Left side: Grip + Title/Description */}
            <div className="flex items-center gap-3">
                <GripVertical className='h-5 w-5 text-muted-foreground shrink-0 hidden sm:block' /> {/* Hide grip on small screens */}
                <div className='space-y-1 text-left'> {/* Align text left */}
                    <DialogTitle className='flex items-center gap-2 text-xl sm:text-2xl font-semibold'>
                        <Mail className='h-5 w-5 text-primary' />
                        Customize Your Email
                    </DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground'>
                        Adjust the tone and desired funding changes for your message.
                    </DialogDescription>
                </div>
            </div>

           {/* Right side: Close Button */}
           <DialogClose asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8 shrink-0 rounded-full'> {/* Make button round */}
              <X className='h-4 w-4' />
              <span className='sr-only'>Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* ---------------- body ------------------------------------ */}
        <ScrollArea className='flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'> {/* Added scrollbar styles */}
         <div className="space-y-8"> {/* Add spacing between sections */}
              {/* name / location */}
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='userName'>Your Name</Label>
                  <Input id='userName' value={userName} onChange={e => setUserName(e.target.value)} placeholder='Jane Doe' className="h-9"/> {/* Reduced height */}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='userLocation'>Your Location</Label>
                  <Input id='userLocation' value={userLocation} onChange={e => setUserLocation(e.target.value)} placeholder='City, ST Zipcode' className="h-9"/> {/* Reduced height */}
                </div>
              </div>

              {/* aggressiveness */}
              <div className='rounded-lg border bg-secondary/30 p-4 shadow-inner space-y-3'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor="aggressiveness" className="text-base font-semibold">Overall Tone</Label> {/* Use standard label styling */}
                  <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary'>
                    {getAggressivenessLabel(aggressiveness)}
                  </span>
                </div>
                <Slider
                  id="aggressiveness"
                  min={0} max={100} step={1}
                  value={[aggressiveness]}
                  onValueChange={v => setAggressiveness(v[0])}
                  className='my-2'
                />
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>Kind / Polite</span><span>Concerned</span><span>Stern / Demanding</span>
                </div>
              </div>

              {/* funding sliders */}
              {selectedItems.length > 0 && (
                <div className='space-y-6'>
                  <h3 className='border-b pb-2 text-lg font-semibold'>Adjust Funding Priorities</h3>
                  {selectedItems.map(item => {
                    const sliderValue = itemFundingLevels.get(item.id) ?? 50;
                    const fundingDetail = fundingDetails(sliderValue);
                    return (
                      <div key={item.id} className='space-y-2 rounded-md border bg-card/50 p-4 shadow-sm'>
                        <div className='flex items-start justify-between gap-2'>
                          <Label htmlFor={`funding-${item.id}`} className='flex-1 text-sm font-medium text-foreground'>{item.description}</Label>
                          <span className={cn('whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-white', fundingDetail.color)}>
                            {fundingDetail.label}
                          </span>
                        </div>
                        <Slider
                          id={`funding-${item.id}`}
                          min={0} max={100} step={1}
                          value={[sliderValue]}
                          onValueChange={v => setItemFundingLevels(new Map(itemFundingLevels).set(item.id, v[0]))}
                          className={cn(
                            '[&>span>span]:transition-colors [&>span>span]:duration-200', // Smooth color transition
                            `[&>span>span]:${fundingDetail.color.split(' ')[0]}`, // Apply base color class
                            `[&>span>span]:dark:${fundingDetail.color.split(' ')[1] ?? fundingDetail.color.split(' ')[0]}`, // Apply dark mode color if available
                            '[&>span]:bg-muted' // Make track muted
                          )}
                        />
                        <div className='flex justify-between text-[10px] text-muted-foreground px-1'>
                          <span>Cut</span><span>Review</span><span>Increase</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {balanceBudgetChecked && (
                <div className='rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300'>
                  <p><strong>Note:</strong> Your email will emphasise balancing the budget and tackling the national debt.</p>
                </div>
              )}
         </div>
        </ScrollArea>

        {/* ---------------- footer ---------------------------------- */}
        <DialogFooter className='sticky bottom-0 z-10 flex shrink-0 items-center gap-4 border-t bg-card/95 px-6 py-4 rounded-b-lg sm:justify-between'> {/* Added justify-between */}
          <DialogClose asChild>
            <Button variant='outline' className='w-full sm:w-auto'>Cancel</Button>
          </DialogClose>
          <Button
            disabled={!userName || !userLocation}
            onClick={() => {
              const mapped: SelectedItem[] = Array.from(itemFundingLevels).map(([id, slider]) => ({
                id,
                description: initialSelectedItems.get(id)!.description,
                fundingLevel: mapSliderToFundingLevel(slider),
              }));
              const { subject, body } = generateRepresentativeEmail(mapped, aggressiveness, userName, userLocation, balanceBudgetChecked);
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              onOpenChange(false);
            }}
            className='w-full sm:w-auto bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground
                       dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800'
          >
            <Send className='mr-2 h-4 w-4' /> Generate & Open Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------------------- */
/* prop types ----------------------------------------------------------- */
interface EmailCustomizationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: Map<string, SelectedItem>;
  balanceBudgetChecked: boolean;
  taxAmount: number;                        // not used inside, but kept for future
  aggressiveness: number;
  setAggressiveness: (n: number) => void;
  itemFundingLevels: Map<string, number>;
  setItemFundingLevels: (m: Map<string, number>) => void;
  userName: string;
  setUserName: (s: string) => void;
  userLocation: string;
  setUserLocation: (s: string) => void;
}

