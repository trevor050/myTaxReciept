
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
import { GripVertical, Mail, X, Send, Lightbulb } from 'lucide-react'; // Added Lightbulb

import type { SelectedItem } from '@/services/tax-spending';
import { generateRepresentativeEmail } from '@/services/tax-spending';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';
import { cn } from '@/lib/utils';

const fundingLevels = [
  { value: -2, label: 'Slash Heavily',      color: 'bg-red-600  dark:bg-red-500' },
  { value: -1, label: 'Cut Significantly',  color: 'bg-orange-500 dark:bg-orange-400' },
  { value:  0, label: 'Improve Efficiency', color: 'bg-yellow-500 dark:bg-yellow-400' },
  { value:  1, label: 'Fund',              color: 'bg-green-500 dark:bg-green-400' },
  { value:  2, label: 'Fund More',          color: 'bg-emerald-600 dark:bg-emerald-500' },
];

export default function EmailCustomizationModal (p: EmailCustomizationModalProps) {
  const {
    isOpen, onOpenChange, onEmailGenerated, onSuggestResources, // Added onSuggestResources
    selectedItems: initialSelectedItems,
    balanceBudgetChecked, aggressiveness, setAggressiveness,
    itemFundingLevels, setItemFundingLevels,
    userName, setUserName, userLocation, setUserLocation,
  } = p;

  const [pos, setPos] = useState<{x:number|null;y:number|null}>({ x:null, y:null });
  const [drag, setDrag] = useState(false);
  const dragOffset = useRef({x:0,y:0});
  const isInitialOpen = useRef(true);

  const refModal = useRef<HTMLDivElement>(null);
  const refHandle= useRef<HTMLDivElement>(null);

  useLayoutEffect(()=>{
      if (!isOpen) {
          setPos({x:null,y:null});
          isInitialOpen.current = true;
      }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || pos.x !== null || !isInitialOpen.current) return;

    const frame = requestAnimationFrame(() => {
        if (!refModal.current) return;
        const { width, height } = refModal.current.getBoundingClientRect();
        if (width && height) {
        setPos({
            x: window.innerWidth  / 2 - width  / 2,
            y: window.innerHeight / 2 - height / 2,
        });
        isInitialOpen.current = false;
        }
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, pos.x]);


  const onDown = useCallback((e:React.MouseEvent)=>{
    if(!refHandle.current?.contains(e.target as Node) || !refModal.current) return;

    if(pos.x===null){
      const r = refModal.current.getBoundingClientRect();
      setPos({x:r.left,y:r.top});
      dragOffset.current = {x:e.clientX-r.left,y:e.clientY-r.top};
       isInitialOpen.current = false;
    } else {
      dragOffset.current = {x:e.clientX-pos.x,y:e.clientY-pos.y};
    }
    setDrag(true);
    document.body.style.userSelect='none';
  },[pos]);

  const onMove = useCallback((e:MouseEvent)=>{
    if(!drag||!refModal.current || pos.x === null) return;
    const {innerWidth:vw,innerHeight:vh}=window;
    const {width:hW,height:hH}=refModal.current.getBoundingClientRect();
    let x=e.clientX-dragOffset.current.x;
    let y=e.clientY-dragOffset.current.y;
    x=Math.max(0,Math.min(x,vw-hW));
    y=Math.max(0,Math.min(y,vh-hH));
    setPos({x,y});
  },[drag, pos.x]);

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

  const tone = (v:number)=>v<=15?'Kind':v<=40?'Concerned':v<=75?'Stern':'Angry';
  const fdet = (s:number)=> fundingLevels.find(f=>f.value===mapSliderToFundingLevel(s))??fundingLevels[2];
  const selected = React.useMemo(()=>Array.from(initialSelectedItems.values()),[initialSelectedItems]);

  const handleGenerateEmail = () => {
    const finalSelectedItems: SelectedItem[] = Array.from(itemFundingLevels.entries()).map(([id, sliderValue]) => {
       const originalItem = initialSelectedItems.get(id);
       return {
            id,
            description: originalItem?.description || 'Unknown Item',
            category: originalItem?.category || 'Unknown Category',
            fundingLevel: mapSliderToFundingLevel(sliderValue)
        };
    });

    const {subject, body} = generateRepresentativeEmail(
        finalSelectedItems,
        aggressiveness,
        userName,
        userLocation,
        balanceBudgetChecked
    );
    window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onEmailGenerated();
  };


  return(
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
        onInteractOutside={e=>drag&&e.preventDefault()}
        onOpenAutoFocus={e=>e.preventDefault()}
      >

         <div
            ref={refHandle}
            onMouseDown={onDown}
            className='relative flex shrink-0 cursor-move select-none items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 bg-card/95 rounded-t-lg'
         >
          <div className='flex items-center gap-2 sm:gap-3 pointer-events-none'>
            <GripVertical className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0' />
            <div className='space-y-0 sm:space-y-0.5'>
              <DialogTitle className='text-base sm:text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2'>
                <Mail className='h-4 w-4 sm:h-5 sm:w-5 text-primary'/> Customize Your Email
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                Adjust tone, priorities, and provide your info.
              </DialogDescription>
            </div>
          </div>

           <DialogClose asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 pointer-events-auto z-20 relative'>
                    <X className='h-3.5 w-3.5 sm:h-4 sm:w-4'/><span className='sr-only'>Close</span>
                </Button>
            </DialogClose>
        </div>


        <ScrollArea className='flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
           <div className="space-y-6 sm:space-y-8">
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div className='space-y-1.5 sm:space-y-2'>
                  <Label htmlFor="userName" className="text-xs sm:text-sm">Your Name</Label>
                  <Input id="userName" value={userName} onChange={e=>setUserName(e.target.value)} placeholder='Jane Doe' className="h-8 sm:h-9 text-sm sm:text-base"/>
                </div>
                <div className='space-y-1.5 sm:space-y-2'>
                  <Label htmlFor="userLocation" className="text-xs sm:text-sm">Your Location</Label>
                  <Input id="userLocation" value={userLocation} onChange={e=>setUserLocation(e.target.value)} placeholder='City, ST Zipcode' className="h-8 sm:h-9 text-sm sm:text-base"/>
                </div>
              </div>

              <div className='space-y-2 sm:space-y-3 rounded-lg border p-3 sm:p-4 bg-secondary/30 shadow-inner'>
                <div className='flex justify-between items-center'>
                    <Label htmlFor="aggressiveness" className="text-sm sm:text-base font-semibold">Overall Tone</Label>
                    <span className='text-xs sm:text-sm font-medium text-primary rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5'>{tone(aggressiveness)}</span>
                </div>
                <Slider
                    id="aggressiveness"
                    value={[aggressiveness]}
                    onValueChange={v=>setAggressiveness(v[0])}
                    className="my-1.5 sm:my-2"
                />
                <div className='flex justify-between text-[10px] sm:text-xs text-muted-foreground'>
                    <span>Kind / Polite</span><span>Concerned</span><span>Stern / Demanding</span>
                </div>
              </div>

              {selected.length > 0 && (
                <div className='space-y-4 sm:space-y-6'>
                  <h3 className='text-sm sm:text-lg font-semibold border-b pb-1.5 sm:pb-2'>Adjust Funding Priorities</h3>
                  {selected.map(item => {
                    const sliderValue = itemFundingLevels.get(item.id) ?? 50;
                    const det = fdet(sliderValue);
                    return (
                      <div key={item.id} className='space-y-1.5 sm:space-y-2 border p-3 sm:p-4 rounded-md shadow-sm bg-card/50'>
                        <div className='flex justify-between items-start gap-1.5 sm:gap-2'>
                          <Label htmlFor={`funding-${item.id}`} className='text-xs sm:text-sm font-medium text-foreground flex-1'>
                            {item.description}
                          </Label>
                           <span className={cn(
                               'text-[10px] sm:text-xs font-semibold rounded-full px-1.5 sm:px-2 py-0.5 text-white whitespace-nowrap',
                               det.color
                           )}>
                               {det.label}
                           </span>
                        </div>
                        <Slider
                            id={`funding-${item.id}`}
                            value={[sliderValue]}
                            onValueChange={v => setItemFundingLevels(new Map(itemFundingLevels).set(item.id, v[0]))}
                            className={cn(
                                '[&>span>span]:transition-colors [&>span>span]:duration-200',
                                `[&>span>span]:${det.color.split(' ')[0]}`,
                                '[&>span]:bg-muted'
                            )}
                        />
                        <div className='flex justify-between text-[9px] sm:text-[10px] text-muted-foreground px-1'>
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
                <div className='mt-4 sm:mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 sm:p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300'>
                  <p><strong>Note:</strong> Your email will emphasize balancing the budget and tackling the national debt.</p>
                </div>
              )}
           </div>
        </ScrollArea>

        <DialogFooter className='flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-between px-4 py-3 sm:px-6 sm:py-4 border-t bg-card/95 sticky bottom-0 z-10 rounded-b-lg'>
          <DialogClose asChild><Button variant='outline' className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'>Cancel</Button></DialogClose>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
            <Button
                variant="secondary"
                onClick={onSuggestResources}
                disabled={initialSelectedItems.size === 0 && !balanceBudgetChecked}
                className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
            >
                <Lightbulb className='mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4'/> Further Actions
            </Button>
            <Button
                disabled={!userName || !userLocation}
                onClick={handleGenerateEmail}
                className='w-full sm:w-auto bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-xs sm:text-sm h-9 sm:h-10'
            >
                <Send className='mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4'/> Generate & Open Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EmailCustomizationModalProps{
  isOpen:boolean;
  onOpenChange:(b:boolean)=>void;
  onEmailGenerated: () => void;
  onSuggestResources: () => void; // New callback prop for suggesting resources
  selectedItems:Map<string,SelectedItem>;
  balanceBudgetChecked:boolean;taxAmount:number;
  aggressiveness:number;setAggressiveness:(n:number)=>void;
  itemFundingLevels:Map<string,number>;setItemFundingLevels:(m:Map<string,number>)=>void;
  userName:string;setUserName:(s:string)=>void;
  userLocation:string;setUserLocation:(s:string)=>void;
}

    