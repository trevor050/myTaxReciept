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
import { GripVertical, Mail, X, Send } from 'lucide-react';

import type { SelectedItem } from '@/services/tax-spending';
import { generateRepresentativeEmail } from '@/services/tax-spending';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';
import { cn } from '@/lib/utils';

/*──────────────── funding presets ────────────────*/
const fundingLevels = [
  { value: -2, label: 'Slash Heavily',      color: 'bg-red-600  dark:bg-red-500' },
  { value: -1, label: 'Cut Significantly',  color: 'bg-orange-500 dark:bg-orange-400' },
  { value:  0, label: 'Improve Efficiency', color: 'bg-yellow-500 dark:bg-yellow-400' },
  { value:  1, label: 'Fund',              color: 'bg-green-500 dark:bg-green-400' },
  { value:  2, label: 'Fund More',          color: 'bg-emerald-600 dark:bg-emerald-500' },
];

/*──────────────── component ───────────────────────*/
export default function EmailCustomizationModal (p: EmailCustomizationModalProps) {
  const {
    isOpen, onOpenChange, selectedItems: initialSelectedItems,
    balanceBudgetChecked, aggressiveness, setAggressiveness,
    itemFundingLevels, setItemFundingLevels,
    userName, setUserName, userLocation, setUserLocation,
  } = p;

  /*───── draggable position (null = CSS centred) ───*/
  const [pos, setPos] = useState<{x:number|null;y:number|null}>({ x:null, y:null });
  const [drag, setDrag] = useState(false);
  const dragOffset = useRef({x:0,y:0});
  const isInitialOpen = useRef(true); // Track if it's the first open

  const refModal = useRef<HTMLDivElement>(null);
  const refHandle= useRef<HTMLDivElement>(null);

  // Reset position and initial state when closed
  useLayoutEffect(()=>{
      if (!isOpen) {
          setPos({x:null,y:null});
          isInitialOpen.current = true; // Reset for next open
      }
  }, [isOpen]);

  // Center on first open AFTER animation frame
  useLayoutEffect(() => {
    if (!isOpen || pos.x !== null || !isInitialOpen.current) return; // Already positioned or not open

    const frame = requestAnimationFrame(() => {
        if (!refModal.current) return;
        const { width, height } = refModal.current.getBoundingClientRect();
        // Guard against zero-size just in case
        if (width && height) {
        setPos({
            x: window.innerWidth  / 2 - width  / 2,
            y: window.innerHeight / 2 - height / 2,
        });
        isInitialOpen.current = false; // Mark as positioned
        }
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, pos.x]); // Rerun if opened or position changes (though we prevent re-run if pos.x is set)


  const onDown = useCallback((e:React.MouseEvent)=>{
    if(!refHandle.current?.contains(e.target as Node) || !refModal.current) return;

    /* lock visual position on first drag */
    if(pos.x===null){
      const r = refModal.current.getBoundingClientRect();
      setPos({x:r.left,y:r.top}); // Switch to absolute coords
      dragOffset.current = {x:e.clientX-r.left,y:e.clientY-r.top};
       isInitialOpen.current = false; // Ensure we don't recenter after drag starts
    } else {
      dragOffset.current = {x:e.clientX-pos.x,y:e.clientY-pos.y};
    }
    setDrag(true);
    document.body.style.userSelect='none';
  },[pos]); // Depend on pos to capture the initial null state

  const onMove = useCallback((e:MouseEvent)=>{
    if(!drag||!refModal.current || pos.x === null) return; // Don't move if not dragging or not yet positioned
    const {innerWidth:vw,innerHeight:vh}=window;
    const {width:hW,height:hH}=refModal.current.getBoundingClientRect();
    let x=e.clientX-dragOffset.current.x;
    let y=e.clientY-dragOffset.current.y;
    x=Math.max(0,Math.min(x,vw-hW));
    y=Math.max(0,Math.min(y,vh-hH));
    setPos({x,y});
  },[drag, pos.x]); // Depend on pos.x to ensure it's not null

  const stopDrag = useCallback(()=>{
    setDrag(false);
    document.body.style.userSelect='';
  },[]);

  useLayoutEffect(()=>{
    if(drag){
      window.addEventListener('mousemove',onMove);
      window.addEventListener('mouseup',stopDrag);
    }else{
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',stopDrag);
    }
    return ()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',stopDrag);};
  },[drag,onMove,stopDrag]);

  /*──────── helpers ────────*/
  const tone = (v:number)=>v<=15?'Kind':v<=40?'Concerned':v<=75?'Stern':'Angry';
  const fdet = (s:number)=> fundingLevels.find(f=>f.value===mapSliderToFundingLevel(s))??fundingLevels[2];
  const selected = React.useMemo(()=>Array.from(initialSelectedItems.values()),[initialSelectedItems]);

  /*──────── UI ─────────────*/
  return(
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        ref={refModal}
        style={
            pos.x !== null
            ? { left: pos.x, top: pos.y, transform: 'none' } // Use absolute position once calculated/dragged
            : undefined // Let CSS handle initial centering via translate
        }
        className={cn(
          'dialog-pop fixed z-50 flex max-h-[85vh] w-[90vw] max-w-3xl flex-col border bg-background shadow-lg sm:w-full sm:rounded-lg',
           // Apply centering ONLY when position is not yet calculated
          pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          // Add scale animation classes for open/close
          'data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut'
        )}
        onInteractOutside={e=>drag&&e.preventDefault()}
        onOpenAutoFocus={e=>e.preventDefault()} // Prevent auto-focus stealing from drag handle
      >

        {/*──── HEADER (grab‑handle) ────*/}
         <div
            ref={refHandle}
            onMouseDown={onDown}
            className='relative flex shrink-0 cursor-move select-none items-center justify-between border-b px-6 py-4 bg-card/95 rounded-t-lg' // Added bg and rounded-t
         >
          {/* Left side: Grip + Title/Desc */}
          <div className='flex items-center gap-3 pointer-events-none'> {/* Disable pointer events on inner elements */}
            <GripVertical className='h-5 w-5 text-muted-foreground shrink-0' />
            <div className='space-y-0.5'>
              <DialogTitle className='text-lg sm:text-xl font-semibold flex items-center gap-2'>
                <Mail className='h-5 w-5 text-primary'/> Customize Your Email
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground'>
                Adjust tone, priorities, and provide your info.
              </DialogDescription>
            </div>
          </div>

          {/* Right side: Close button */}
           <DialogClose asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8 flex-shrink-0 pointer-events-auto z-20 relative'> {/* Ensure close button is clickable */}
                    <X className='h-4 w-4'/><span className='sr-only'>Close</span>
                </Button>
            </DialogClose>
        </div>


        {/*──── BODY (scrolls) ────*/}
        <ScrollArea className='flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
           <div className="space-y-8"> {/* Add container for padding */}
              {/* name / location */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor="userName">Your Name</Label>
                  <Input id="userName" value={userName} onChange={e=>setUserName(e.target.value)} placeholder='Jane Doe' className="h-9"/>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="userLocation">Your Location</Label>
                  <Input id="userLocation" value={userLocation} onChange={e=>setUserLocation(e.target.value)} placeholder='City, ST Zipcode' className="h-9"/>
                </div>
              </div>

              {/* tone slider */}
              <div className='space-y-3 rounded-lg border p-4 bg-secondary/30 shadow-inner'>
                <div className='flex justify-between items-center'>
                    <Label htmlFor="aggressiveness" className="text-base font-semibold">Overall Tone</Label>
                    <span className='text-sm font-medium text-primary rounded-full bg-primary/10 px-2.5 py-0.5'>{tone(aggressiveness)}</span>
                </div>
                <Slider
                    id="aggressiveness"
                    value={[aggressiveness]}
                    onValueChange={v=>setAggressiveness(v[0])}
                    className="my-2" // Add margin
                />
                <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>Kind / Polite</span><span>Concerned</span><span>Stern / Demanding</span>
                </div>
              </div>

              {/* funding sliders */}
              {selected.length > 0 && (
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold border-b pb-2'>Adjust Funding Priorities</h3>
                  {selected.map(item => {
                    const sliderValue = itemFundingLevels.get(item.id) ?? 50; // Use 50 as default if not found
                    const det = fdet(sliderValue);
                    return (
                      <div key={item.id} className='space-y-2 border p-4 rounded-md shadow-sm bg-card/50'>
                        <div className='flex justify-between items-start gap-2'>
                          <Label htmlFor={`funding-${item.id}`} className='text-sm font-medium text-foreground flex-1'>
                            {item.description}
                          </Label>
                           <span className={cn(
                               'text-xs font-semibold rounded-full px-2 py-0.5 text-white whitespace-nowrap', // Base styles
                               det.color // Apply color class
                           )}>
                               {det.label}
                           </span>
                        </div>
                        <Slider
                            id={`funding-${item.id}`}
                            value={[sliderValue]}
                            onValueChange={v => setItemFundingLevels(new Map(itemFundingLevels).set(item.id, v[0]))}
                            className={cn(
                                '[&>span>span]:transition-colors [&>span>span]:duration-200', // Base track/thumb styles
                                `[&>span>span]:${det.color.split(' ')[0]}`, // Apply color to thumb based on label
                                '[&>span]:bg-muted' // Background track color
                            )}
                        />
                        <div className='flex justify-between text-[10px] text-muted-foreground px-1'>
                          <span>Cut</span>
                          <span>Review</span>
                          <span>Increase</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {balanceBudgetChecked && (
                <div className='mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300'>
                  <p><strong>Note:</strong> Your email will emphasize balancing the budget and tackling the national debt.</p>
                </div>
              )}
           </div> {/* End container */}
        </ScrollArea>

        {/*──── FOOTER ────*/}
        <DialogFooter className='flex shrink-0 flex-col-reverse sm:flex-row sm:space-x-2 px-6 py-4 border-t bg-card/95 sticky bottom-0 z-10 sm:justify-between rounded-b-lg'> {/* Added bg and rounded-b */}
          <DialogClose asChild><Button variant='outline' className='w-full sm:w-auto'>Cancel</Button></DialogClose>
          <Button
            disabled={!userName || !userLocation} // Disable if name or location is missing
            onClick={()=>{
              // Map the current slider values back to SelectedItem with funding levels
              const finalSelectedItems: SelectedItem[] = Array.from(itemFundingLevels.entries()).map(([id, sliderValue]) => {
                 const originalItem = initialSelectedItems.get(id);
                 return {
                      id,
                      description: originalItem?.description || 'Unknown Item', // Fallback
                      category: originalItem?.category || 'Unknown Category', // Pass category
                      fundingLevel: mapSliderToFundingLevel(sliderValue)
                  };
              });

              const {subject, body} = generateRepresentativeEmail(
                  finalSelectedItems, // Pass the mapped items
                  aggressiveness,
                  userName,
                  userLocation,
                  balanceBudgetChecked
              );
              // Open mailto link
              window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              onOpenChange(false); // Close modal after generating
            }}
            className='w-full sm:w-auto bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800'
          >
            <Send className='mr-2 h-4 w-4'/> Generate & Open Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/*──────── prop type (unchanged) ────────*/
interface EmailCustomizationModalProps{
  isOpen:boolean;onOpenChange:(b:boolean)=>void;
  selectedItems:Map<string,SelectedItem>; // This map still holds the original selection from dashboard
  balanceBudgetChecked:boolean;taxAmount:number;
  aggressiveness:number;setAggressiveness:(n:number)=>void;
  itemFundingLevels:Map<string,number>;setItemFundingLevels:(m:Map<string,number>)=>void; // This map holds the slider values
  userName:string;setUserName:(s:string)=>void;
  userLocation:string;setUserLocation:(s:string)=>void;
}
